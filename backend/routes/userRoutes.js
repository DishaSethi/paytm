const zod = require("zod");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { Account } = require("../models/user");
const {authMiddleware}=require("../middleware/middleware");
const express=require("express");
const router=express.Router();

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

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;


  await Account.create({
    userId,
    balance:1+Math.random()*10000
  })


    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
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

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.status(200).json({
            token: token
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})

router.get("/bulk",authMiddleware,async(req,res)=>{
    const filter=req.query.filer || '';
      const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
        console.log("Current userId from authMiddleware:", req.userId); 
 const currentUser= req.userId;
    const users=await User.find({
        _id:{$ne:currentUser},
        $or:[
            {
                firstName:{$regex:filter,$options:'i'}
            },
            {
                lastName:{$regex:filter,$options:'i'}
            }
        ]
    })  .skip((page - 1) * limit)
    .limit(limit);

        res.json({
            user:users.map(user=>({
                firstName:user.firstName,
                lastName:user.lastName,
                _id:user._id

            }))
        })
})
module.exports = router;