import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: Schema.Types.String,
            required: false,
            unique: true,
        },
        email: {
            type: Schema.Types.String,
            required: true,
            unique: true,
        },
        password: {
            type: Schema.Types.String,
            required: true,
        },
        role: {
            type: Schema.Types.String,
            required: true,
            enum: ["user", "admin"],
        },
        gender: {
            type: Schema.Types.String,
            default: "not selected",
        },
        earning: {
            type: Schema.Types.Number,
            default: 0,
        },
        advBalance: {
            type: Schema.Types.Number,
            default: 0,
        },
        status: {
            type: Schema.Types.String,
            default: "active",
        },
        payeer: {
            type: Schema.Types.String,
            default: "",
        },
        perfectMoney: {
            type: Schema.Types.String,
            default: "",
        },
        public_id: {
            type: Schema.Types.String,
            default: "",
        },
        profileurl: {
            type: Schema.Types.String,
            default:
                "https://img.freepik.com/free-psd/3d-icon-social-media-app_23-2150049569.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1719273600&semt=ais_user",
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

const User = mongoose.model("All_user", userSchema);

export default User;
