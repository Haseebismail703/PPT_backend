import mongoose from "mongoose";

const { Schema } = mongoose;

const reportSchema = new Schema({
    taskName : {
        type: Schema.Types.String,
        required: true,
    },
    userName: {
        type: Schema.Types.String,
        required: true,
    },
    userId: {
        type: Schema.Types.String,
        required: true,
    },
    taskId: {
        type: Schema.Types.String,
        required: true
    },
    reportType: {
        type: Schema.Types.String,
        required: true,
    },
    reportDesc: {
        type: Schema.Types.String,
        default: ''
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const report = mongoose.model('ReportTask', reportSchema);

export default report;