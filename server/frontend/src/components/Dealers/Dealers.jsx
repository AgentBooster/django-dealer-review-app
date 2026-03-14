import React, { useEffect, useState } from "react";

import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import reviewIcon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);

  const dealerUrl = "/djangoapp/get_dealers";

  const filterDealers = async (state) => {
    const url = state === "All" ? dealerUrl : `${dealerUrl}/${state}`;
    const response = await fetch(url, {
      method: "GET",
    });
    const payload = await response.json();
    if (payload.status === 200) {
      const nextUrl = state === "All" ? "/dealers" : `/dealers?state=${encodeURIComponent(state)}`;
      window.history.replaceState({}, "", nextUrl);
      setDealersList(Array.from(payload.dealers));
    }
  };

  const getDealers = async () => {
    const response = await fetch(dealerUrl, {
      method: "GET",
    });
    const payload = await response.json();
    if (payload.status === 200) {
      const allDealers = Array.from(payload.dealers);
      setStates(Array.from(new Set(allDealers.map((dealer) => dealer.state))).sort());
      const selectedState = new URLSearchParams(window.location.search).get("state");
      if (selectedState) {
        const filteredDealers = allDealers.filter((dealer) => dealer.state === selectedState);
        setDealersList(filteredDealers);
      } else {
        setDealersList(allDealers);
      }
    }
  };

  useEffect(() => {
    getDealers();
  }, []);

  const isLoggedIn = sessionStorage.getItem("username") !== null;

  return (
    <div>
      <Header />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select
                name="state"
                id="state"
                defaultValue=""
                onChange={(event) => filterDealers(event.target.value)}
              >
                <option value="" disabled hidden>
                  State
                </option>
                <option value="All">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </th>
            {isLoggedIn ? <th>Review Dealer</th> : null}
          </tr>
        </thead>
        <tbody>
          {dealersList.map((dealer) => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td>
                <a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a>
              </td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn ? (
                <td>
                  <a href={`/postreview/${dealer.id}`}>
                    <img src={reviewIcon} className="review_icon" alt="Post Review" />
                  </a>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
