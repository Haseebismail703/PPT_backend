import Task from "../model/creteTask.js";
import UserTaskSubmit from "../model/submitTask.js";
import { configDotenv } from 'dotenv';
import cloudinary from 'cloudinary'
import PayementModel from "../model/paymentModel.js";
import User from "../model/authModel.js";
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
  console.log(req.body);
  
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


// Add fund 
let userPayment = async (req,res)=>{
  const {userId,paymeMethod,PaymentType,amount} = req.body
  try {
    let add = new PayementModel({userId,paymeMethod,PaymentType,amount})
    let addPayment = await add.save()
    return res.status(200).json({message : "payment request succesful added" , addPayment});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

// my payment history 
let getPaymentHistory = async (req,res)=>{
  //useParams 
  try {
    let getPayment = await PayementModel.find({userId : "123"})
    return res.status(200).json(getPayment)
} catch (error) {
    return res.status(500).json({ message: "Internal server error" });
}
}


export { getTaskuser ,submitTask,myWork,userPayment ,getPaymentHistory,getTaskByuser}
