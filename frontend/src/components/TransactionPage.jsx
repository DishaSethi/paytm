import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TransactionPage.css";

const TransactionPage=()=>{
    const[amount,setAmount]=useState("");
    const [type,setType]=useState("expense");
    const [category,setCategory]=useState("");
    const [notes, setNotes]=useState("");
    const [loading, setLoading]=useState(false);
    const [error,setError]=useState(null);
    const [success, setSuccess]=useState(null);

    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try{
            const token=sessionStorage.getItem("token");
            if(!token){
                setError("No token found, please log in again");
                return;
            }

            const res=await fetch("http://localhost:3000/api/v1/transaction/transactions",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`,
                },
                body:JSON.stringify({
                    amount:parseFloat(amount),
                    category,
                    notes,
                    type
                })
            });

            if(!res.ok){
                throw new Error("Transaction failed");
            }

            const data=await res.json();
            setSuccess("Transaction added successfully!");

            setTimeout(()=>{
                navigate("/dashboard");
            },1500);
        } catch(err){
            console.error(err);
            setError("Failed to add transaction");
        }finally{
            setLoading(false);
        }
    };



    return(
        <div className="transaction-container">
            <h2 className="transaction-title">Add Transaction</h2>
            <form className="transaction-form" onSubmit={handleSubmit}>
                <label>
                    Amount:
                    <input type="number"
                     value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                     required/>
                    </label> 
                    <label>
                        Type:
                        <select value={type} onChange={(e)=>setType(e.target.value)}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </label>
        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Food, Travel, Rent"
            required
          />
        </label>

          <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </label>
          <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Transaction"}
        </button>

            </form>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
        </div>

    );
};

export default TransactionPage;
