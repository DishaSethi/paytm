const express=require("express");
const router=express.Router();
const { authMiddleware } = require("../middleware/middleware");
const Transaction = require("../models/transaction");

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

module.exports=router;