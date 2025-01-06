import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    userName : {
        type: String,
        required: true
    },
    taskTitle: {
        type: String,
        required: true
    },
    taskDescription: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    workersNeeded: {
        type: Number,
        required: true,
        min: 1
    },
    publisherReward: {
        type: Number,
        required: true,
        min: 0.1
    },
    targetCountries: {
        type: [String],
        required: true
    },
    totalPriceWithoutFee: {
        type: Number,
        required: true
    },
    advertiserId: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Pending", "Approve", "Reject", "Running", "Complete"],
        default: "Pending"
    },
    reject_reason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
