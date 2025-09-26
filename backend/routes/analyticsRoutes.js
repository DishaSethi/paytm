const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/middleware");
const {cacheData}=require("../middleware/cache");
const pool = require("../db");

router.get("/analyticsData", authMiddleware,cacheData, async (req, res) => {
  const userId = req.userId;

  try {
    // Weekly spending (total outgoing per week)
    const weeklySpendingQuery = `
      SELECT 
        DATE_TRUNC('week', created_at) AS week_start,
        SUM(amount) AS total_spend
      FROM transactions
      WHERE from_user = $1
      GROUP BY week_start
      ORDER BY week_start ASC;
    `;

    // Incoming vs outgoing (per day for last 7 days)
    const dailyTrendQuery = `
      SELECT 
        DATE(created_at) AS day,
        SUM(CASE WHEN from_user = $1 THEN amount ELSE 0 END) AS outgoing,
        SUM(CASE WHEN to_user = $1 THEN amount ELSE 0 END) AS incoming
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND (from_user = $1 OR to_user = $1)
      GROUP BY day
      ORDER BY day ASC;
    `;

    // Spending by category (last 7 days)
    const categoryQuery = `
      SELECT category, SUM(amount) AS total_spent
      FROM transactions
      WHERE from_user = $1
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY category
      ORDER BY total_spent DESC;
    `;

    const [weeklySpending, dailyTrend, categoryData] = await Promise.all([
      pool.query(weeklySpendingQuery, [userId]),
      pool.query(dailyTrendQuery, [userId]),
      pool.query(categoryQuery, [userId])
    ]);

    res.json({
      weeklySpending: weeklySpending.rows,
      dailyTrend: dailyTrend.rows,
      spendingByCategory: categoryData.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});



module.exports = router;
