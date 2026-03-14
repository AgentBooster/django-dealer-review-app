import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./Dealers.css";
import "../assets/style.css";
import positiveIcon from "../assets/positive.png";
import neutralIcon from "../assets/neutral.png";
import negativeIcon from "../assets/negative.png";
import reviewIcon from "../assets/reviewbutton.png";
import Header from "../Header/Header";

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(<></>);

  const { id } = useParams();
  const rootUrl = window.location.origin;
  const dealerUrl = `${rootUrl}/djangoapp/dealer/${id}`;
  const reviewsUrl = `${rootUrl}/djangoapp/reviews/dealer/${id}`;
  const postReviewUrl = `${rootUrl}/postreview/${id}`;

  const sentimentIcon = (sentiment) => {
    if (sentiment === "positive") {
      return positiveIcon;
    }
    if (sentiment === "negative") {
      return negativeIcon;
    }
    return neutralIcon;
  };

  useEffect(() => {
    const loadDealer = async () => {
      const response = await fetch(dealerUrl, {
        method: "GET",
      });
      const payload = await response.json();

      if (payload.status === 200) {
        const dealerObjects = Array.from(payload.dealer);
        setDealer(dealerObjects[0]);
      }
    };

    const loadReviews = async () => {
      const response = await fetch(reviewsUrl, {
        method: "GET",
      });
      const payload = await response.json();

      if (payload.status === 200) {
        if (payload.reviews.length > 0) {
          setReviews(payload.reviews);
        } else {
          setUnreviewed(true);
        }
      }
    };

    loadDealer();
    loadReviews();
    if (sessionStorage.getItem("username")) {
      setPostReview(
        <a href={postReviewUrl}>
          <img
            src={reviewIcon}
            style={{ width: "10%", marginLeft: "10px", marginTop: "10px" }}
            alt="Post Review"
          />
        </a>
      );
    }
  }, [dealerUrl, postReviewUrl, reviewsUrl]);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>
          {dealer.full_name}
          {postReview}
        </h1>
        <h4 style={{ color: "grey" }}>
          {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
        </h4>
      </div>
      <div className="reviews_panel">
        {reviews.length === 0 && unreviewed === false ? (
          <span>Loading Reviews....</span>
        ) : unreviewed === true ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review) => (
            <div className="review_panel" key={review.id}>
              <img src={sentimentIcon(review.sentiment)} className="emotion_icon" alt="Sentiment" />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
