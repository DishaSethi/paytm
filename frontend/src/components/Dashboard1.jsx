import React from "react";
import "./Dashboard1.css";
import {useState,useEffect, } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";




const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {

    const [balance,setBalance]=useState(0);
    const [weeklySpending,setWeeklySpending]=useState([]);
    const [categorySpending,setCategorySpending]=useState([]);
    const [transactions, setTransactions]=useState([]);
    const [budgets, setBudgets] = useState([]);
   const [totalIncome, setTotalIncome] = useState(0);
   const [totalExpense, setTotalExpense] = useState(0);
    const [remainingBudget, setRemainingBudget] = useState(0);
     const navigate=useNavigate();


    const fetchBalance=async()=>{
        

const token = sessionStorage.getItem("token"); // get token from session storage
if (!token) {
  console.error("No token found in session storage");
  return;
}

try {
  const res = await axios.get("http://localhost:3000/api/v1/account/balance", {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
  });

            setBalance(res.data.balance);
        }catch(err){
            console.error("Error fetching balance:", err);
        }


    }

  
    
const analyticsData=async()=>{
const token=sessionStorage.getItem("token");
if(!token) return;

try{
    const res=await axios.get("http://localhost:3000/api/v1/analytics/analyticsData",{
        headers:{"Authorization":`Bearer ${token}`}
    
    }
    );


          const dailyTrend = res.data.dailyTrend.map((item) => ({
        day: new Date(item.day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        incoming: Number(item.incoming),
        outgoing: Number(item.outgoing),
      }));

      // Preprocess spending by category
      const spendingByCategory = res.data.spendingByCategory.map((item) => ({
        category: item.category || "Uncategorized",
        total_spent: Number(item.total_spent),
      }));

      setWeeklySpending(dailyTrend);
      setCategorySpending(spendingByCategory);
    //  setWeeklySpending(res.data.dailyTrend); 
    //   setCategorySpending(res.data.spendingByCategory); 


}catch(err){
console.error("Error fetching analytics:", err);
}
}
const fetchTransactions=async()=>{
    const token=sessionStorage.getItem("token");

    if(!token) return;
    try{
        const res=await axios.get(
            "http://localhost:3000/api/v1/transaction/transactions",
            {
                headers:{Authorization:`Bearer ${token}`},
            }
        );

        const txns=res.data.transactions||[];
        setTransactions(res.data.transactions|| []);

        const income=txns
          .filter((t)=> t.type==="income")
          .reduce((acc,t)=> acc+Number(t.amount),0);
          
        const expense=txns
           .filter((t)=> t.type==="expense")
           .reduce((acc,t)=> acc+ Number(t.amount),0);

           setTotalIncome(income);
           setTotalExpense(expense);

           const totalBudget=budgets.reduce((acc,b)=> acc+Number(b.amount),0);
           setRemainingBudget(totalBudget-expense);
    }catch(err){
        console.error("Error fetching transactions",err);
    }
};

const fetchBudgets= async ()=>{
  const token=sessionStorage.getItem("token");
  if(!token) return;

  try{
    const res=await axios.get("http://localhost:3000/api/v1/budget",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });
    setBudgets(res.data.budgets||[]);
  }catch(err){
    console.error("Error fetching budgets:",err);
  }



}



  useEffect(()=>{
        fetchBalance();
        analyticsData();
        fetchTransactions();
        fetchBudgets();

    },[]);
  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="logo">💰 MyFinance</div>
        <input className="search-bar" type="text" placeholder="Quick Search" />
        <div className="profile">👤 🔔</div>
      </div>

      <div className="summary-cards">
        <div className="card">Current Balance: ${balance}</div>
        <div className="card">Total Income: ${totalIncome}</div>
        <div className="card">Total Expense: ${totalExpense}</div>
        <div className="card">Remaining Budget: ${remainingBudget}</div>
      </div>

      <div className="charts">
        <div className="chart-card">
          <h3>Weekly Incoming vs Outgoing</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklySpending}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="incoming" fill="#4CAF50" />
              <Bar dataKey="outgoing" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Spending per Category</h3>
   <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={categorySpending}
      cx="50%"
      cy="50%"
      outerRadius={80}
      dataKey="total_spent"   // value field
      nameKey="category"      // ✅ tell recharts what to use as label
      label
    >
     {categorySpending.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}/>
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>

        </div>
      </div>

      <div className="quick-actions">
        <button className="btn" onClick={()=> navigate(`/transactionpage`)}>➕ Add Transaction</button>
        <button className="btn"  onClick={() => navigate(`/sendpage`)}>💸 Send Money</button>
        <button className="btn" onClick={()=> navigate(`/budgetpage`)}>📊 Set Budget</button>
      </div>

      <div className="transactions-list">
        <h3>Transactions</h3>
        <table> 
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>From/To</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
           {transactions.length>0 ?(
            transactions.map((txn)=>(
                <tr key={txn.id}>
                    <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td>{txn.type}</td>
                  <td>₹{txn.amount}</td>
                  <td>{txn.from_user || "-"}</td>
                  <td>{txn.to_user || "-"}</td>
                  <td>{txn.category || "Uncategorized"} </td>
                </tr>
            ))
        ):
           (
            <tr>
             <td colSpan="6">No transactions found</td>
            </tr>
           )}
          </tbody>
        </table>
      </div>
    </div>
  );
}