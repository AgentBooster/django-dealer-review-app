import React, { useState } from "react";

import "./Register.css";
import Header from "../Header/Header";
import emailIcon from "../assets/email.png";
import passwordIcon from "../assets/password.png";
import personIcon from "../assets/person.png";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const registrationUrl = `${window.location.origin}/djangoapp/registration`;

  const handleChange = (event) => {
    setFormData((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const register = async (event) => {
    event.preventDefault();
    const response = await fetch(registrationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const payload = await response.json();
    if (response.ok && payload.status === 201) {
      sessionStorage.setItem("username", payload.userName);
      sessionStorage.setItem("firstname", payload.firstName || "");
      sessionStorage.setItem("lastname", payload.lastName || "");
      window.location.href = "/dealers";
      return;
    }

    alert(payload.message || "The user could not be registered.");
  };

  return (
    <div>
      <Header />
      <form className="register_container" onSubmit={register}>
        <span className="header">Register</span>
        <div className="inputs">
          <div className="input">
            <img src={personIcon} className="img_icon" alt="username" />
            <input
              className="input_field"
              type="text"
              name="userName"
              placeholder="Username"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input">
            <img src={personIcon} className="img_icon" alt="first name" />
            <input
              className="input_field"
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input">
            <img src={personIcon} className="img_icon" alt="last name" />
            <input
              className="input_field"
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input">
            <img src={emailIcon} className="img_icon" alt="email" />
            <input
              className="input_field"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input">
            <img src={passwordIcon} className="img_icon" alt="password" />
            <input
              className="input_field"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="submit_panel">
          <button className="submit" type="submit">
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
