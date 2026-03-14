import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  const { id } = useParams();
  const rootUrl = window.location.origin;
  const dealerUrl = `${rootUrl}/djangoapp/dealer/${id}`;
  const reviewUrl = `${rootUrl}/djangoapp/add_review`;
  const carmodelsUrl = `${rootUrl}/djangoapp/get_cars`;

  const postReview = async () => {
    let name = `${sessionStorage.getItem("firstname")} ${sessionStorage.getItem("lastname")}`.trim();
    if (!name || name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    if (!model || review === "" || date === "" || year === "") {
      alert("All details are mandatory");
      return;
    }

    const [makeChosen, ...modelParts] = model.split(" ");
    const modelChosen = modelParts.join(" ");

    const response = await fetch(reviewUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        dealership: id,
        review,
        purchase: true,
        purchase_date: date,
        car_make: makeChosen,
        car_model: modelChosen,
        car_year: year,
      }),
    });

    const payload = await response.json();
    if (payload.status === 200) {
      window.location.href = `${window.location.origin}/dealer/${id}`;
    }
  };

  useEffect(() => {
    const loadDealer = async () => {
      const response = await fetch(dealerUrl, {
        method: "GET",
      });
      const payload = await response.json();

      if (payload.status === 200) {
        const dealerObjects = Array.from(payload.dealer);
        if (dealerObjects.length > 0) {
          setDealer(dealerObjects[0]);
        }
      }
    };

    const loadCars = async () => {
      const response = await fetch(carmodelsUrl, {
        method: "GET",
      });
      const payload = await response.json();
      setCarmodels(Array.from(payload.CarModels));
    };

    loadDealer();
    loadCars();
  }, [carmodelsUrl, dealerUrl]);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>
        <textarea id="review" cols="50" rows="7" onChange={(event) => setReview(event.target.value)} />
        <div className="input_field">
          Purchase Date <input type="date" onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="input_field">
          Car Make
          <select
            name="cars"
            id="cars"
            defaultValue=""
            onChange={(event) => setModel(event.target.value)}
          >
            <option value="" disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carModel) => (
              <option
                key={`${carModel.CarMake}-${carModel.CarModel}-${carModel.Year}`}
                value={`${carModel.CarMake} ${carModel.CarModel}`}
              >
                {carModel.CarMake} {carModel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className="input_field">
          Car Year
          <input
            type="number"
            onChange={(event) => setYear(event.target.value)}
            max={new Date().getFullYear() + 1}
            min={2015}
          />
        </div>

        <div>
          <button className="postreview" onClick={postReview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
