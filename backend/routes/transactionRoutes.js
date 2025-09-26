const express=require("express");
const router=express.Router();
const { authMiddleware, } = require("../middleware/middleware");
const {cacheData}=require("../middleware/cache");
const pool=require("../db");
// const Transaction = require("../models/transaction");

// router.get("/transactions",authMiddleware,async(req,res)=>{
//    try{ const userId=req.userId;
//     const page=parseInt(req.query.page)||1;
//     const limit=parseInt(req.query.limit)||5;


//     const transactions=await Transaction.find({
//       $or:[{from:userId},{to:userId}]
//     })
//     .sort({createdAt:-1})
//     .skip((page-1)*limit)
//     .limit(limit)
//     .populate("from","firstName lastName")
//     .populate("to","firstname lastname");


//     const totalCount=await Transaction.countDocuments({
//         $or:[{from:userId},{to:userId}]
//     })

//     res.json({
//         transactions,
//         totalPages:Math.ceil((totalCount/limit)),
//         currentPage:page,

//     }); 


// }catch(err){
//      console.err(err);
//       res.status(500).json({ message: "Failed to fetch transactions" });
// }}
// )

router.get("/transactions",authMiddleware,async (req,res)=>{
    try{
        const userId=req.userId;
      const query=`SELECT   
        t.id,   
         t.amount,
    t."created_at",
    u_from.first_name AS from_first_name,
    u_from.last_name AS from_last_name,
    u_to.first_name AS to_first_name,
    u_to.last_name AS to_last_name
FROM Transactions t
JOIN Users u_from ON t."from_user" = u_from.id
JOIN Users u_to ON t."to_user" = u_to.id
WHERE t."from_user" = $1 OR t."to_user" = $1 
ORDER BY t."created_at" DESC;`;

const result=await pool.query(query,[userId]);
res.json({
    transactions:result.rows
});







    }catch(error){
        console.error(error);
        res.status(500).json({
            message:"Failed to fetch transactions"
        });
    }
})

router.post("/transactions",authMiddleware, async (req, res) => {
  const { amount, category, notes, type } = req.body;
  const userId = req.userId;

  try {
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type",
      });
    }

    let fromUser = null;
    let toUser = null;

    if (type === "income") {
      toUser = userId;
    } else if (type === "expense") {
      fromUser = userId;
    }

    const query = `
      INSERT INTO transactions(from_user, to_user, amount, type, category, notes)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(query, [fromUser, toUser, amount, type, category, notes]);

    res.json({
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Transaction failed",
    });
  }
});


// In your transaction router file, update the /summary route with this code
router.get("/summary", authMiddleware, cacheData, async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Define all the queries we need to run
    const transactionSummaryQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN to_user = $1 THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN from_user = $1 THEN amount ELSE 0 END), 0) AS total_expense
      FROM transactions
      WHERE from_user = $1 OR to_user = $1;
    `;

    const accountBalanceQuery = `SELECT balance FROM account WHERE user_id = $1;`;

    const totalBudgetQuery = `
      SELECT COALESCE(SUM(amount), 0) AS total_budget 
      FROM budgets 
      WHERE user_id = $1;
    `;

    // 2. Execute all queries in parallel for maximum efficiency
    const [summaryResult, balanceResult, budgetResult] = await Promise.all([
      pool.query(transactionSummaryQuery, [userId]),
      pool.query(accountBalanceQuery, [userId]),
      pool.query(totalBudgetQuery, [userId]),
    ]);

    // 3. Extract the results from each query
    const { total_income, total_expense } = summaryResult.rows[0];
    const current_balance = balanceResult.rows[0]?.balance || 0; // Default to 0 if no account exists
    const total_budget = budgetResult.rows[0].total_budget;
    
    // 4. Calculate the remaining budget
    const remaining_budget = parseFloat(total_budget) - parseFloat(total_expense);

    // 5. Send all data back in a single response
    res.json({
      currentBalance: parseFloat(current_balance),
      totalIncome: parseFloat(total_income),
      totalExpense: parseFloat(total_expense),
      remainingBudget: remaining_budget,
    });

  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    res.status(500).json({ message: "Server error while fetching summary." });
  }
});


module.exports=router;