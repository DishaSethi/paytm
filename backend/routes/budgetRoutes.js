const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const {authMiddleware} = require("../middleware/middleware");

router.post("/",authMiddleware, async(req,res)=>{
    const {category, amount}=req.body;
    const userId=req.userId;

    try{
        const existing=await pool.query(
            `SELECT * FROM budgets WHERE user_id=$1 AND category=$2`,
            [userId, category]
        );

        let result;
        if(existing.rows.length>0){
            result=await pool.query(
                `UPDATE budgets SET amount=$1, updated_at=NOW() WHERE user_id=$2 AND category=$3 RETURNING *`,
                [amount,userId, category]
            );
        
        }else{
            result=await pool.query(
                `INSERT INTO budgets(user_id, category, amount) VALUES($1,$2,$3) RETURNING *`,
                [userId, category, amount]
            );
        }
        res.json({budget:result.rows[0]});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Failed to set budget"});
    }
});

router.get("/", authMiddleware, async(req,res)=>{
    const userId=req.userId;
    try{
        const result=await pool.query(
            `SELECT * FROM budgets WHERE user_id=$1 ORDER BY category ASC`,
            [userId]
        );
        res.json({budgets:result.rows});
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:"Failed to fetch budgets"
        });
    }
});

module.exports=router;