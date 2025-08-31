// backend/routes/index.js
const express = require('express');
const userRouter = require("./userRoutes");
const accountRouter=require("./accountRoutes");
const transactionRouter=require("./transactionRoutes");
const router = express.Router();

router.use("/user", userRouter);
router.use("/account",accountRouter);
// router.use("/transaction",transactionRouter);

module.exports = router;