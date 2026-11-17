import express from "express";

import {
  createTransaction,
  deleteTransaction,
  getTransactionsByUserId,
  getSummaryByUserId,
} from "../controllers/transactionsController.js";

const router = express.Router();

// GET Transactions by User ID
router.get("/:userId", getTransactionsByUserId);

// CREATE Transaction
router.post("/", createTransaction);

// DELETE Transaction
router.delete("/:id", deleteTransaction);

// GET Transaction Summary
router.get("/summary/:userId", getSummaryByUserId);

export default router;
