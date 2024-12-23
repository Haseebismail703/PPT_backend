import User from '../model/authModel.js';
import Task from '../model/creteTask.js';
import UserTaskSubmit from '../model/submitTask.js';

// create task compaign  in advertiser page 
let createTask = async (req, res) => {
    try {
        // Destructure request body
        const {
            taskTitle,
            taskDescription,
            category,
            subcategory,
            instructions,
            workersNeeded,
            publisherReward,
            targetCountries,
            advertiserId
        } = req.body;
        // console.log(req.body);

        // Validation checks
        if (!taskTitle || !taskDescription || !category || !subcategory || !instructions || !workersNeeded || !publisherReward || !targetCountries || !advertiserId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (publisherReward < 0.1) {
            return res.status(400).json({ message: "Publisher reward must be at least 0.10" });
        }

        if (workersNeeded < 1) {
            return res.status(400).json({ message: "At least one worker is needed" });
        }

        // Calculate total price without fee
        const totalPriceWithoutFee = workersNeeded * publisherReward;

        // Create a new task
        const newTask = new Task({
            taskTitle,
            taskDescription,
            category,
            subcategory,
            instructions,
            workersNeeded,
            publisherReward,
            targetCountries,
            totalPriceWithoutFee,
            advertiserId
        });

        // Save task to MongoDB
        await newTask.save();

        // Return success response
        return res.status(201).json({
            message: "Task created successfully",
            task: newTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// get all task id  in advertiser  page 
let getTaskbyId = async (req, res) => {
    const { id } = req.params
    console.log(req.body);

    try {
        let getallTask = await Task.find({ advertiserId: id })
        return res.status(201).json(getallTask);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// get all proof in my_compaign/id page  remaining 
let getallproofbyId = async (req, res) => {
    const { taskId } = req.params;
    try {
        let getallTask = await UserTaskSubmit.find({ taskId });
        return res.status(200).json(getallTask);
    } catch (error) {
        console.error("Error in getallproofbyId:", error.message);

        // Return an error response
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

// reject approve revision task 
let UpdateTaskProf = async (req, res) => {
    const { userId, taskId, status } = req.body; // Extract data from request body
  
    console.log(req.body);
  
    // Validate status
    const validStatuses = ["approved", "rejected", "revision"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
  
    try {
      // Find and update the task submission by userId and taskId
      const updatedTask = await UserTaskSubmit.findOneAndUpdate(
        { userId, taskId }, // Query criteria
        { status }, // Update operation
        { new: true } // Return the updated document
      );
  
      // Check if the task was found
      if (!updatedTask) {
        return res.status(404).json({ message: "Task submission not found" });
      }
  
      res.status(200).json({
        message: `Task status updated to '${status}' successfully`,
        task: updatedTask,
      });
    } catch (error) {
      console.error("Error updating task status:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
// statctus active disable api 
let statusUpdate = async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    console.log(req.body);

    try {
        const task = await Task.findByIdAndUpdate(
            id,
            { active },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task status updated successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task status', error });
    }
}

export { createTask, getTaskbyId, statusUpdate,UpdateTaskProf,getallproofbyId };
