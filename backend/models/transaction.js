const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ["transfer", "deposit", "withdrawal"], // can expand later
        default: "transfer"
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "completed"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {Transaction};
