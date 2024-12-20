import mongoose from "mongoose";

const { Schema } = mongoose;

const Payement = new Schema({
    userId: {
        type: Schema.Types.String,
        required: true,
    },
    paymeMethod: {
        type: Schema.Types.String,
        required: true,
    },
    PaymentType: {
        type: Schema.Types.String,
        required: true
    },
    amount: {
        type: Schema.Types.Number,
        required: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const PayementModel = mongoose.model('payment', Payement);

export default PayementModel;