import mongoose from "mongoose";

const { Schema } = mongoose;

const Payement = new Schema({
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