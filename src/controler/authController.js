import User from "../model/authModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { configDotenv } from 'dotenv'
import cloudinary from 'cloudinary'
import Task from "../model/creteTask.js";
import UserTaskSubmit from "../model/submitTask.js";
configDotenv()

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});
// user signup api 
const signupUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    //    console.log(req.body)
    try {
        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).send({ message: 'Username already exists' });
        }

        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).send({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ email, role, username }, 'Haseeb');

        const newUser = new User({ username, email, password: hashedPassword, role });
        const data = await newUser.save();
        const user_data = {
            email: data.email,
            id: data._id,
            username: data.username,
            role: data.role
        };

        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        return res.status(200).send({ status: 200, message: "Registration successful", user_data, token });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// signin api 
let signinUser = async (req, res) => {
    const { email, password } = req.body;
    //   console.log(req.body);

    try {
        // Find user by email and exclude password from returned document
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Check if user role is admin
        if (user.role !== 'user') {
            return res.status(403).send({ status: 403, message: "Invalid email or password" });
        }

        // Prepare minimal user data to include in the JWT payload
        const user_data = {
            email: user.email,
            id: user._id,
            username: user.username,
            // profileurl: user.profileurl,
            role: user.role
        };

        // Generate JWT token
        const token = jwt.sign(user_data, 'Haseeb');

        // Return success response with user data (without password) and token
        return res.status(200).send({ status: 200, message: "Login successful", user_data, token });

    } catch (error) {
        // Handle any errors
        console.log(error)
        res.status(500).send({ status: 500, message: "Internal server error", error: error.message });
    }
}
// admin login api 
let adminLogin = async (req, res) => {
    const { email, password } = req.body;


    try {
        // Find user by email and exclude password from returned document
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Check if user role is admin
        if (user.role !== 'admin') {
            return res.status(403).send({ status: 403, message: "Invalid email or password" });
        }

        // Prepare minimal user data to include in the JWT payload
        const user_data = {
            email: user.email,
            id: user._id,
            role: user.role,
            // profileurl: user.profileurl,
            username: user.username
            // Include role in JWT payload
            // Add more fields as needed
        };

        // Generate JWT token
        const token = jwt.sign(user_data, 'Haseeb');
        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1 hour
        });
        // Return success response with user data (without password) and token
        return res.status(200).send({ status: 200, message: "Login successful", user_data, token });

    } catch (error) {
        // Handle any errors
        res.status(500).send({ status: 500, message: "Internal server error", error: error.message });
    }
}


let userProfile = async (req, res) => {
  const { id } = req.params;
  try {
      // Find the user by ID
      let user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Fetch completed, pending, and rejected task counts
      let [getCompleteTask, getPendingTask, getRejectedTask] = await Promise.all([
          UserTaskSubmit.countDocuments({ status: "approved", userId: id }),
          UserTaskSubmit.countDocuments({ status: "pending", userId: id }),
          UserTaskSubmit.countDocuments({ status: "rejected", userId: id }),
      ]);

      // Calculate total tasks and progress percentage
      let totalTasks = getCompleteTask + getPendingTask + getRejectedTask;
      let progress = totalTasks > 0 ? ((getCompleteTask / totalTasks) * 100).toFixed(2) : 0;
      // Add task counts and progress to the user object
      let userWithTasks = {
          ...user.toObject(), // Convert Mongoose document to plain JavaScript object
          completed: getCompleteTask,
          pending: getPendingTask,
          rejected: getRejectedTask,
          progress: progress,
      };

      // Send the response
      return res.status(200).json({ user: userWithTasks });
  } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



const profileUpdate = async (req, res) => {
    const { id } = req.params;
    const { username, perfectMoney, payeer } = req.body;
    const file = req.files ? req.files[0] : null; // Check if files are present
     console.log(req.body)
    try {
      // Find the user in the database
      let user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      let updateData = {};
  
      // If a file is uploaded, upload to Cloudinary and update profile image
      if (file) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "user_profile",
          use_filename: true,
          resource_type: "image",
        });
  
        // Destroy the old image if it exists
        if (user.public_id) {
          await cloudinary.uploader.destroy(user.public_id);
        }
  
        updateData.profileurl = result.secure_url;
        updateData.public_id = result.public_id;
      }
  
      // Update username if provided
      if (username) {
        updateData.username = username;
      }
  
      // Update Payeer and PerfectMoney if provided
      if (payeer) {
        updateData.payeer = payeer;
      }
  
      if (perfectMoney) {
        updateData.perfectMoney = perfectMoney;
      }
  
      // Update the user's profile in the database
      let update = await User.findByIdAndUpdate(id, updateData, { new: true });
  
      res.status(200).json({
        message: "Profile updated successfully",
        update,
      });
    } catch (err) {
      console.error("Error during profile update:", err);
      // Handle server errors
      res.status(500).json({
        message: "Server error",
        error: err.message, // Optional: Include error details for debugging
      });
    }
  };
  
export { signupUser, signinUser, adminLogin,userProfile,profileUpdate };
