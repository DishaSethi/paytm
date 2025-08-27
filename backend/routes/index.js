// backend/routes/index.js
const express = require('express');
const userRouter = require("./userRoutes");
const accountRouter=require("./accountRoutes");
const router = express.Router();

router.use("/user", userRouter);
router.use("/account",accountRouter);

module.exports = router;