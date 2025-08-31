import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import './Signup.css';

const Signup=()=>{
    const [formData,setFormData]=useState({
        username:"",
        password:"",
        firstName:"",
        lastName:"",
        email:""
    })

    const handleChange=(e)=>{
        setFormData({
            ...formData,[e.target.name]:e.target.value
        })
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
      try{
          const res = await fetch("http://localhost:3000/api/v1/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }),
    });

        const data=await res.json();
        if(!res.ok){
            console.error("Error:",data.message);
            alert(data.message);
            return;
        }

         console.log("Signup successful:", data);

         if (data.token) {
      sessionStorage.setItem("token", data.token);
    }

    alert("Signup successful!");
    window.location.href = "/signin";

      }catch(err){
         console.error("Network error:", err);
    alert("Something went wrong. Please try again.");

      }

    }

    return(
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className='signup-form'>
                <input type="text"
                 name="firstName" 
                 placeholder="First Name"
                  value={formData.firstName} 
                  onChange={handleChange} />

                 <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/signin">Signin</Link>
      </p>
    </div>
  )
}

    

export default Signup;
