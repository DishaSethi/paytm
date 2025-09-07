// backend/routes/index.js
const express = require('express');
const userRouter = require("./userRoutes");
const accountRouter=require("./accountRoutes");
const transactionRouter=require("./transactionRoutes");
const analyticRouter=require("./analyticsRoutes");
const budgetRouter=require("./budgetRoutes");
const router = express.Router();

router.use("/user", userRouter);
router.use("/account",accountRouter);
router.use("/transaction",transactionRouter);
router.use("/analytics",analyticRouter);
router.use("/budget",budgetRouter);
module.exports = router;