require("dotenv").config();
// backend/index.js
const express = require('express');
const cors = require("cors");
const redis=require("redis");
const rootRouter = require("./routes/index");
const app = express();
const pool = require("./db"); 

const {initializeSocket}=require("./socket");
// const redisClient=redis.createClient();

const http=require('http');
const {Server}=require("socket.io");
const server=http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

pool.connect()
  .then(() => console.log("Connected to PostgreSQL DB ✅"))
  .catch(err => console.error("Database connection error ❌", err));

const redisClient=redis.createClient();
redisClient.on("error",(err)=>console.log('Redis Client Error',err));
(async()=>{
  await redisClient.connect();
  console.log("connected to Redis successfully!");
})();

const {io, userSocketMap}=initializeSocket(server,redisClient);


app.use((req,res,next)=>{
  req.io=io;
  req.userSocketMap=userSocketMap;
  req.redisClient=redisClient;
  next();
})

app.use("/api/v1", rootRouter);

const PORT =process.env.PORT||3000;

server.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
});