import mongoose, { Schema } from "mongoose";

let submitTask = new Schema({
    userId : {
        type: Schema.Types.String,
    },
    taskId : {
        type : Schema.Types.String
    },
    comment : {
        type : Schema.Types.String
    },
    img : {
        type: [Schema.Types.String]
    }
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

let UserTaskSubmit = mongoose.model('UserTaskSubmit',submitTask)

export default UserTaskSubmit