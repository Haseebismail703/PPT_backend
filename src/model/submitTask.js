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
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

let UserTaskSubmit = mongoose.model('TaskSubmit',submitTask)

export default UserTaskSubmit