import mongoose, { Schema } from "mongoose";

let submitTask = new Schema({
  username: {
    type: Schema.Types.String,
    default: "123"
  },
  userId: {
    type: Schema.Types.String,
    default: "123"
  },
  publisherReward: {
    type: Schema.Types.Number,
    default: "123"
  },
  country: {
    type: Schema.Types.String,
    default: "123"
  },
  taskId: {
    type: Schema.Types.String,
    default: "456"
  },
  comment: {
    type: Schema.Types.String,
    default: "hello"
  },
  advId: {
    type: Schema.Types.String,
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
  status: {
    type: Schema.Types.String,
    enum: ["pending", "approved", "reject", "revision"], // Status options
    default: "pending",
  },
  revisionComments: {
    type: Schema.Types.String,
    default: ""
  },
  approvalStatus: {
    type: Schema.Types.String,
    default: ""
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

let UserTaskSubmit = mongoose.model('TaskSubmit', submitTask)

export default UserTaskSubmit