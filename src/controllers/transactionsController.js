import { sql } from "../config/db.js";

// GET Transactions by User ID
export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;

    const transactions = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC, id DESC
    `;

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error getting transactions:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// CREATE Transaction
export async function createTransaction(req, res) {
  try {
    const { user_id, title, amount, category } = req.body;

    const numericAmount = Number(amount);

    if (
      typeof user_id !== "string" ||
      !user_id.trim() ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      Math.abs(numericAmount) > 99999999.99
    ) {
      return res.status(400).json({
        message: "All fields are required and amount must be valid",
      });
    }

    const transaction = await sql`
      INSERT INTO transactions (
        user_id,
        title,
        amount,
        category
      )
      VALUES (
        ${user_id.trim()},
        ${title.trim()},
        ${numericAmount},
        ${category.trim()}
      )
      RETURNING *
    `;

    return res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Error creating transaction:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// DELETE Transaction
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (
      !/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(Number(id)) ||
      Number(id) > 2147483647
    ) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const result = await sql`
      DELETE FROM transactions
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      message: "Transaction deleted successfully",
      transaction: result[0],
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET Transaction Summary
export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;

    const [summary] = await sql`
      SELECT
        COALESCE(SUM(amount), 0) AS balance,

        COALESCE(
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END),
          0
        ) AS income,

        COALESCE(
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END),
          0
        ) AS expenses,

        COUNT(*) AS transaction_count
      FROM transactions
      WHERE user_id = ${userId}
    `;

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
