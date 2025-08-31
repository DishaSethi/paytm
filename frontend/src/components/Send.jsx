import { useState,useEffect, } from "react";
import {useParams, useNavigate} from "react-router-dom";
const Send=()=>{
    const {id}=useParams();
    const [amount,setAmount]=useState("");
    const navigate=useNavigate();
 
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            const token=sessionStorage.getItem("token");
            const res=await fetch("http://localhost:3000/api/v1/account/transfer",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                }, credentials:"include",
                body:JSON.stringify({
                    to:id,
                    amount:parseFloat(amount)
                })
            })
            const data=await res.json();
            if(!res.ok){
                alert(data.message || "Transfer failed");
                return;
            }

            alert("Transfer successful");
            navigate("/dashboard");
        }catch(err){
            console.error("Error:", err);
            alert("Something went wrong");
        }
    }

    return(
        <div className="sendContainer">
            <h2>Send Money</h2>
            <form onSubmit={handleSubmit} >
                <input type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e)=>setAmount(e.target.value)} required/>
                <button type="submit">Send</button>
            </form>
        </div>
    )

}
export default Send;