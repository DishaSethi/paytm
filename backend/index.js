// backend/index.js
const express = require('express');
const cors = require("cors");
const rootRouter = require("./routes/index");
const mongoose = require('mongoose');   
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

async function connectDB(){
    try{
        await mongoose.connect("mongodb://localhost:27017/paytm?replicaSet=rs0"
        )
        console.log("Connected to DB");

    }catch(err){
        console.log("Error connection to DB",err);
    }
}
connectDB();

app.use("/api/v1", rootRouter);

app.listen(3000,()=>{
    console.log("Server started on port 3000");
});