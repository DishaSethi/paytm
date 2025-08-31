const zod = require("zod");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { Account } = require("../models/user");
const {authMiddleware}=require("../middleware/middleware");
const express=require("express");
const router=express.Router();
const pool=require("../db");

const signupBody = zod.object({
    username: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

  const client=await pool.connect();
  try{
    const {username, firstName,lastName,password}=req.body;

  

  const existing=await client.query("SELECT * FROM users WHERE username=$1",[username]);
 if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already taken" });
    }


    const newUser=await client.query(`INSERT INTO users(username, first_name,last_name,password) VALUES($1,$2,$3,$4) RETURNING id`,[username,firstName,lastName,password]);
     const userId = newUser.rows[0].id;

     await client.query("INSERT INTO account(user_id,balance) VALUES($1,$2)",[userId,Math.random()*10000]);


  

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
}catch(err){
     console.error(err);
    res.status(500).json({ message: "Signup failed" });
}
})


const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
     const { username, password } = req.body;
    

  try{
  

          const user = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

        if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
        const token = jwt.sign({
            userId: user.rows[0].id
        }, JWT_SECRET);
  
        res.status(200).json({
            token: token
        })
        return;
    }

    
   
catch(err){
    console.log(err);
 res.status(411).json({
        message: "Error while logging in"
    })
}
})

router.get("/bulk",authMiddleware,async(req,res)=>{
    const filter=req.query.filer || '';
      const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
        console.log("Current userId from authMiddleware:", req.userId); 
 const currentUser= req.userId;
  try{
    const users=await pool.query(
        "SELECT id, first_name, last_name FROM users WHERE id!=$1 AND (first_name ILIKE $2 OR last_name ILIKE $2) OFFSET $3 LIMIT $4",
        [currentUser,`%${filter}%`,(page-1)*limit, limit]
    );

    res.json({
      user: users.rows.map((user) => ({
        _id: user.id,
        firstName: user.first_name,
        lastName: user.last_name
      }))
    });
  }catch (err){
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }

     
})
module.exports = router;