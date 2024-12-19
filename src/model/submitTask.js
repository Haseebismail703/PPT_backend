import mongoose, { Schema } from "mongoose";

let submitTask = new Schema({
    userId : {
        type: Schema.Types.String,
        default : "123"
    },
    taskId : {
        type : Schema.Types.String,
        default : "456"
    },
    comment : {
        type : Schema.Types.String,
        default : "hello"
    },
    imgurl: {
        type: [
          {
            public_id: {
              type: Schema.Types.String,  
              required: true,             
            },
            image_url: {                  
              type: Schema.Types.String,  
              required: true,            
            },
          },
        ],
        required: true,
      },
      status : {
        type : Schema.Types.String,
        enum: ["pending", "approved", "rejected", "revision"], // Status options
        default: "pending", 
      },
      revisionComments : {
        type : Schema.Types.String,
        default : " "
      }
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

let UserTaskSubmit = mongoose.model('TaskSubmit',submitTask)

export default UserTaskSubmit