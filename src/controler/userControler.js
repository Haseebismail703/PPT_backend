import Task from "../model/creteTask.js";
import UserTaskSubmit from "../model/submitTask.js";
import { configDotenv } from 'dotenv';
import cloudinary from 'cloudinary'
import PayementModel from "../model/paymentModel.js";
configDotenv()

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});


let getTaskuser = async (req, res) => {
    try {
        let get = await Task.find({ active: true, status: "Running" })
        return res.status(200).json(get);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
// SubmitTask from publisher 
const submitTask = async (req, res) => {
  const { userId, taskId, comment } = req.body;
  console.log(req.body);
  
  try {
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
      userId : userId,
      taskId : taskId,
      comment : comment,
      imgurl: imageUrls, 
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
let myWork = async (req,res)=>{
  const { userId } = req.body
  try {
    let get = await UserTaskSubmit.find({userId : "123"})
   let approve =  get.filter((item)=>{
      return item.status === 'approved'
    })
    let pending =  get.filter((item)=>{
      return item.status === 'pending'
    })
    let rejected =  get.filter((item)=>{
      return item.status === 'rejected'
    })
    let revision =  get.filter((item)=>{
      return item.status === 'revision'
    })
    return res.status(200).json({approve,rejected,revision,pending});
} catch (error) {
    return res.status(500).json({ message: "Internal server error" });
}
}

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
export { getTaskuser ,submitTask,myWork,userPayment ,getPaymentHistory}
