import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BudgetPage.css";

const BudgetPage=()=>{
   const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate=useNavigate();

  const fetchBudgets= async()=>{
    const token=sessionStorage.getItem("token");
    if (!token) {
      setError("No token found, please log in again");
      return;
    }
try{
    const res= await fetch("http://localhost:3000/api/v1/budget",{
        method:"GET",
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`

        }
        
    });

      if (!res.ok) throw new Error("Failed to fetch budgets");

      const data=await res.json();
      setBudgets(data.budgets||[]);

  }catch(err){
     console.error(err);
      setError("Error fetching budgets");
  }
}
const handleSubmit=async (e)=>{
      e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No token found, please log in again");
      setLoading(false);
      return;
    }

    try{
        const res=await fetch("http://localhost:3000/api/v1/budget",{
            method:"POST",
             headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body:JSON.stringify({category, amount},

    )
        
        });

      if (!res.ok) throw new Error("Failed to save budget");
      
       const data = await res.json();
           setSuccess("Budget saved successfully!");
      setCategory("");
      setAmount("");

      fetchBudgets();


    }catch(err){
        console.error(err);
      setError("Failed to save budget");

    }finally{
        setLoading(false);
    }

}
  useEffect(() => {
    fetchBudgets();
  }, []);

    return(
        <div className="budget-container">
      <h2>💰 Budget Management</h2>
         <form className="budget-form" onSubmit={handleSubmit}>
        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Food, Travel"
            required
          />
        </label>

                <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
           <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Budget"}
        </button>
      </form>

       {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

         <h3>📊 Your Budgets</h3>
      <table className="budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Last Updated</th>
            </tr>
        </thead>
        <tbody>
          {budgets.length > 0 ? (
            budgets.map((b) => (
              <tr key={b.id}>
                <td>{b.category}</td>
                <td>₹{b.amount}</td>
                <td>
                  {b.updated_at
                    ? new Date(b.updated_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No budgets set yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="btn-back" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>
          </div>



    )
}
export default BudgetPage;