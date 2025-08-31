const { authMiddleware } = require("../middleware/middleware")
const Account=require("../models/user").Account;
const Transaction = require("../models/transaction"); 
const express=require("express");
const router=express.Router();
const pool=require("../db");

router.get("/balance",authMiddleware,async(req,res)=>{
 try{
    userId=req.userId;
    const result=await pool.query(
        "SELECT balance FROM account WHERE user_id=$1",
        [userId]
    )

    if(result.rows.length==0){
        return res.status(404).json({
            message:"Account not found"
        });

    }
        return res.status(200).json({
            balance:result.rows[0].balance
        });


 }catch(error){
    console.error(error);
    res.status(500).json({ message: "Error fetching balance" });
 }
})


router.post("/transfer",authMiddleware,async (req,res)=>{
  const client= await pool.connect();
  try{
    const {to,amount}=req.body;
    const fromUser=req.userId;

    await client.query("BEGIN");

    const senderbalanceRes=await client.query(
        "SELECT balance FROM accounts WHERE user_id=$1 FOR UPDATE ",
        [fromUser]
    );

    if(senderbalanceRes.rows.length==0){
        throw new Error("Sender account not found");

    }

    const senderbalance=parseFloat(senderbalanceRes.rows[0].balance);
    if(senderBalance<amount){
        throw new error("Insufficent balance");
    }

    const receiverbalanceRes=await client.query(
        "SELECT balance FROM accounts WHERE user_id=$1 FOR UPDATE",
        [to]
    );

    if(receiverbalanceRes.rows.length==0){
        throw new Error("Receiver account not found");
    }
    await client.query("UPDATE accounts SET balance =balance-$1 WHERE user_id=$2",[amount,from]);

    await client.query("UPDATE accounts SET balance= balance+$1 WHERE user_id=$2",[amount,to]);

    await client.query(`INSERT INTO tranasactions(from,to,amount,type,status,created_at)
        VALUES($1,$2,$3,$3,$4,$5,NOW())`,[from,to,amount,"transfer","completed"]);


        await client.query("COMMIT");

        res.status(200).json({
            message:"Transfer successful"
        });



  }catch(err){
    await client.query("ROLLBACK");
    console.error(err);
    res.status(400).json({
        message:err.message|| "Transfer failed"
    })
  }finally{
    client.release();
  }

   

  
});

module.exports=router;