import mongoose from "mongoose";

const { Schema } = mongoose;

const Payement = new Schema({
    userName: {
        type: Schema.Types.String,
        required: true,
    },
    userId: {
        type: Schema.Types.String,
        required: true,
    },
    paymentMethod: {
        type: Schema.Types.String,
        required: true,
    },
    paymentType: {
        type: Schema.Types.String,
        required: true
    },
    amount: {
        type: Schema.Types.Number,
        required: true
    },
    TID: {
        type: Schema.Types.String,
        default : '',
    },
    walletAddress: {
        type: Schema.Types.String,
        default : '',
    },
    status : {
        type: Schema.Types.String,
        default : "pending"
    },
    rejectReason : {
        type: Schema.Types.String,
        default : ""
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const PayementModel = mongoose.model('payments', Payement);

export default PayementModel;