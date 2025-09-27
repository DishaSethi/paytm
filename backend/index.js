require("dotenv").config();
const {redisClient,connectRedis}=require("./db/redis");
// console.log("My Redis URL is:", process.env.REDIS_URL);
// backend/index.js
const express = require('express');
const cors = require("cors");

const rootRouter = require("./routes/index");
const app = express();
const pool = require("./db/db"); 

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

// const redisClient=redis.createClient({url:process.env.REDIS_URL});
// redisClient.on("error",(err)=>console.log('Redis Client Error',err));
// (async()=>{
//   await redisClient.connect();
//   console.log("connected to Redis successfully!");
// })();


// In index.js

// --- Redis Connection ---
(async () => {
  try {
    await connectRedis();
    console.log("Connected to Redis successfully!");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    // Optionally, you can exit the process if Redis is critical for your app to run
    // process.exit(1); 
  }
})();

const {io}=initializeSocket(server,redisClient);


app.use((req,res,next)=>{
  req.io=io;
  // req.userSocketMap=userSocketMap;
  req.redisClient=redisClient;
  next();
})

app.use("/api/v1", rootRouter);

const PORT =process.env.PORT||3000;

server.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
});