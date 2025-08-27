import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signin.css"; // optional CSS file

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Signin data:", formData);
    try{
    const res=fetch("http://localhost:3000/api/v1/user/signin",{
        "method":"POST",
        "headers":{
            "Content-Type":"application/json"
        },
        credentials:"include",
        body:JSON.stringify(formData)

    });


    if(!res.ok){
        const errorData = await res.json();
      console.error("Error:", errorData.message);
      alert(errorData.message); 
      return;
    }

    const data=await res.json();
    sessionStorage.setItem("token",data.token);

    console.log("Signin success",data);
    window.location.href = "/dashboard";
}catch(error){
      console.error("Network error:", err);
    alert("Something went wrong. Please try again.");
}};


  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} className="signin-form">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign In</button>
      </form>

      <p>
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Signin;
