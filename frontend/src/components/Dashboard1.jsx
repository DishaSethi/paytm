import React, { useState, useEffect } from "react";
import "./Dashboard1.css";
import axios from "axios";
import {io} from "socket.io-client";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export default function Dashboard() {
  // --- 1. State & Hooks ---
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  // --- 2. Helper Functions ---

  // Fetches data for the top summary cards from the new efficient endpoint
  const fetchSummaryData = async (token) => {
    const res = await axios.get(
      "http://localhost:3000/api/v1/transaction/summary",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setCurrentBalance(res.data.currentBalance.toFixed(2));
    setTotalIncome(res.data.totalIncome.toFixed(2));
    setTotalExpense(res.data.totalExpense.toFixed(2));
    setRemainingBudget(res.data.remainingBudget.toFixed(2));
  };

  // Fetches data for the charts
  const fetchAnalyticsData = async (token) => {
    const res = await axios.get(
      "http://localhost:3000/api/v1/analytics/analyticsData",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const formattedDailyTrend = (res.data.dailyTrend || []).map((item) => ({
      day: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      incoming: Number(item.incoming),
      outgoing: Number(item.outgoing),
    }));
    const formattedCategorySpending = (res.data.spendingByCategory || []).map(
      (item) => ({
        category: item.category || "Uncategorized",
        total_spent: Number(item.total_spent),
      })
    );
    setDailyTrend(formattedDailyTrend);
    setCategorySpending(formattedCategorySpending);
  };
  
  // Fetches just the list of recent transactions for the table
  const fetchTransactionsList = async (token) => {
    const res = await axios.get(
      "http://localhost:3000/api/v1/transaction/transactions",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTransactions(res.data.transactions || []);
  };

  // --- 3. useEffect Hook ---

  // This single useEffect hook fetches all necessary data when the component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found.");
        return;
      }

      try {
        // Fetch summary, analytics, and transaction list in parallel
        await Promise.all([
          fetchSummaryData(token),
          fetchAnalyticsData(token),
          fetchTransactionsList(token),
        ]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };
    

    fetchDashboardData();
  }, []);

  useEffect(()=>{
    const token=sessionStorage.getItem("token");
    if(!token) return;

    const socket=io("http://localhost:3000");

    socket.on("connect",()=>{
      console.log("Connected to WebSocket server with ID:",socket.id);
      try{
        // const decodedToken=jwtDecode(token);
        socket.emit("register",token);
      }catch(error){
        console.error("Invalid token:",error);
      }
    });

     socket.on('notification',(data)=>{
    console.log("Notification received:",data.message);
    alert(data.message);
    toast.success(data.message);

       // ✅ **THE FIX: Re-fetch data to update the UI instantly**
      fetchSummaryData(token);
      fetchTransactionsList(token);
  });

  return () => {
    console.log("Disconnection from WebSocket server");
    socket.disconnect();
  };
}, []);

 

  // --- 4. JSX Return ---

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="logo">💰 MyFinance</div>
        <div className="profile">👤 🔔</div>
      </div>

      <div className="summary-cards">
        <div className="card">Current Balance <br/> <strong>₹{currentBalance}</strong></div>
        <div className="card">Total Income <br/> <strong className="income-text">₹{totalIncome}</strong></div>
        <div className="card">Total Expense <br/> <strong className="expense-text">₹{totalExpense}</strong></div>
        <div className="card">Remaining Budget <br/> <strong>₹{remainingBudget}</strong></div>
      </div>

      <div className="charts">
        <div className="chart-card">
          <h3>Daily Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyTrend}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`}/>
              <Legend />
              <Bar dataKey="incoming" fill="#4CAF50" name="Income" />
              <Bar dataKey="outgoing" fill="#F44336" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="total_spent"
                nameKey="category"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categorySpending.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn" onClick={() => navigate(`/transactionpage`)}>
          ➕ Add Transaction
        </button>
        <button className="btn" onClick={() => navigate(`/sendpage`)}>
          💸 Send Money
        </button>
        <button className="btn" onClick={() => navigate(`/budgetpage`)}>
          📊 Set Budget
        </button>
      </div>

      <div className="transactions-list">
        <h3>Recent Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.slice(0, 10).map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td>
                    {txn.to_user_name 
                      ? `To: ${txn.to_user_name}` 
                      : (txn.from_user_name ? `From: ${txn.from_user_name}` : 'Personal')}
                  </td>
                  <td className={txn.type}>{txn.type}</td>
                  <td>{txn.category || "Uncategorized"}</td>
                  <td className={txn.type === 'expense' ? 'expense-text' : 'income-text'}>
                    {txn.type === 'expense' ? '-' : '+'}₹{txn.amount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}