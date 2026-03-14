import React, { useState } from "react";

import "./Login.css";
import Header from "../Header/Header";

const Login = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true);

  const loginUrl = `${window.location.origin}/djangoapp/login`;

  const login = async (event) => {
    event.preventDefault();

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        password,
      }),
    });

    const payload = await response.json();
    if (payload.status === "Authenticated") {
      sessionStorage.setItem("username", payload.userName);
      sessionStorage.setItem("firstname", payload.firstName || "");
      sessionStorage.setItem("lastname", payload.lastName || "");
      setOpen(false);
      return;
    }

    alert("The user could not be authenticated.");
  };

  if (!open) {
    window.location.href = "/dealers";
  }

  return (
    <div>
      <Header />
      <div onClick={onClose}>
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="modalContainer"
        >
          <form className="login_panel" onSubmit={login}>
            <div>
              <span className="input_field">Username </span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input_field"
                onChange={(event) => setUserName(event.target.value)}
              />
            </div>
            <div>
              <span className="input_field">Password </span>
              <input
                name="psw"
                type="password"
                placeholder="Password"
                className="input_field"
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div>
              <input className="action_button" type="submit" value="Login" />
              <input
                className="action_button"
                type="button"
                value="Cancel"
                onClick={() => setOpen(false)}
              />
            </div>
            <a className="loginlink" href="/register">
              Register Now
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
