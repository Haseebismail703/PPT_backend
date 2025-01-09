import Task from "../model/creteTask.js";
import UserTaskSubmit from "../model/submitTask.js";
import { configDotenv } from 'dotenv';
import cloudinary from 'cloudinary'
import PayementModel from "../model/paymentModel.js";
import User from "../model/authModel.js";
import report from "../model/reportModel.js";
configDotenv()

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});

// all task in user page
let getTaskuser = async (req, res) => {
    try {
        let get = await Task.find({ active: true, status: "Running" })
        return res.status(200).json(get);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
// get task using id 
const getTaskByuser = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId); // No need to use `{ _id: taskId }` with `findById`.
    if (!task) {
      return res.status(404).json({ message: "Task not found" }); // Handle case when task is not found.
    }
    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message }); // Include error details for debugging.
  }
};
// SubmitTask from publisher 
const submitTask = async (req, res) => {
  const { country,userId, taskId, comment,advId } = req.body;
  // console.log(req.body);
  
  try {
   let userName = await User.findById(userId)
   let task = await Task.findById(taskId)


    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Array to store image upload results
    const imageUrls = [];

    // Iterate through uploaded files and upload to Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "user_tasks", // Optional: Specify a folder in Cloudinary
        use_filename: true, // Optional: Use original filename
        resource_type: "image", // Ensure it's treated as an image
      });

      // Push the uploaded image details to the array
      imageUrls.push({
        public_id: result.public_id,
        image_url: result.secure_url, // Use secure_url for HTTPS
      });
    }

    // Create a new document in MongoDB
    const newTaskSubmit = new UserTaskSubmit({
      taskName : task.taskTitle,
      username : userName.username,
      userId : userId,
      taskId : taskId,
      comment : comment,
      advId : advId ,
      imgurl: imageUrls, 
      publisherReward: task.publisherReward,
      country : country
    });
    await newTaskSubmit.save();

    // Send a success response
    res.status(200).json({
      message: "Images uploaded successfully",
      newTaskSubmit
    });
  } catch (err) {
    console.error("Error during image upload:", err);

    // Handle server errors
    res.status(500).json({
      message: "Server error",
      error: err.message, // Optional: Include error details for debugging
    });
  }
};
// get my all work 
let myWork = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all task submissions for the user
    let submissions = await UserTaskSubmit.find({ userId: userId });

    // Fetch task details for each submission
    let tasksWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        let taskDetails = await Task.findById(submission.taskId);
        return {
          ...submission._doc, // Include submission details
          taskDetails,        // Add corresponding task details
        };
      })
    );

    // Filter submissions by status
    let approved = tasksWithDetails.filter((item) => item.status === 'approved');
    let pending = tasksWithDetails.filter((item) => item.status === 'pending');
    let reject = tasksWithDetails.filter((item) => item.status === 'reject');
    let revision = tasksWithDetails.filter((item) => item.status === 'revision');

    return res.status(200).json({ approved, reject, revision, pending });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
// withdrow fund 
const userPayment = async (req, res) => {
  const { userId, paymentMethod, paymentType, amount } = req.body;

  try {
    // Fetch user and get username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userName = user.username;

    // Create new payment record
    const payment = new PayementModel({
      userId,
      paymentMethod,
      paymentType,
      amount,
      userName,
    });

    // Save the payment record to the database
    const addPayment = await payment.save();

    // Respond with success
    return res.status(200).json({
      message: "Payment request successfully added",
      addPayment,
    });
  } catch (error) {
    console.error(error);

    // Respond with internal server error
    return res.status(500).json({ message: "Internal server error" });
  }
};
// my payment history 
let getPaymentHistory = async (req,res)=>{
  const {id} = req.params
  try {
    let getPayment = await PayementModel.find({userId : id})
    return res.status(200).json(getPayment)
} catch (error) {
    return res.status(500).json({ message: "Internal server error" });
}
}
// report task
const reportTask = async (req, res) => {
  const { userId, taskId, reportType, reportDesc } = req.body;
  try {

   // Check if report already exists
    const existingReport = await report.findOne({ userId, taskId});
    if (existingReport) {
      return res.status(400).send({ message: "Report already exists" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create a new report
    const taskReport = {
      taskName : task.taskTitle,
      userName: user.username,
      userId,
      taskId,
      reportType,
      reportDesc
    };

    let creatReport = new report(taskReport);
    await creatReport.save();

    // Respond with success
    return res.status(200).json({ message: "Task reported successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

let getUserByid = async (req,res)=>{
  const {id} = req.params
  try {
    let user = await User.findById(id)
    res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export { getTaskuser ,submitTask,myWork,userPayment ,getPaymentHistory,getTaskByuser,reportTask,getUserByid}
