import mongoose from "mongoose";

const { Schema } = mongoose;

const notification = new Schema({
    userId : {
        type: Schema.Types.String,
        required: true,
    },
    isRead: {
        type: Schema.Types.Boolean,
        default: false,
      },
    path: {
        type: Schema.Types.String,
        required: true,
    },
    message: {
        type: Schema.Types.String,
        required: true,
    },
    messageId: {
        type: Schema.Types.String,
        required: true,
    },
    type: {
        type: Schema.Types.String,
        required: true,
    },
    role: {
        type: Schema.Types.String,
        enum : ['user','admin'],
        required: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const noti = mongoose.model('notification', notification);

export default noti;