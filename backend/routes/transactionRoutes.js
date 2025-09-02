const express=require("express");
const router=express.Router();
const { authMiddleware } = require("../middleware/middleware");
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


module.exports=router;