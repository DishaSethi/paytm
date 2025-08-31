require("dotenv").config();
// backend/index.js
const express = require('express');
const cors = require("cors");
const rootRouter = require("./routes/index");
const app = express();
const pool = require("./db"); 

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

pool.connect()
  .then(() => console.log("Connected to PostgreSQL DB ✅"))
  .catch(err => console.error("Database connection error ❌", err));

app.use("/api/v1", rootRouter);

const PORT =process.env.PORT||3000;

app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
});