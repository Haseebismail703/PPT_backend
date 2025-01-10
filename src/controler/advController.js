import User from '../model/authModel.js';
import Task from '../model/creteTask.js';
import PayementModel from '../model/paymentModel.js';
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
            advertiserId,
        } = req.body;

        console.log(req.body);

        // Validation checks
        if (
            !taskTitle || 
            !taskDescription || 
            !category || 
            !subcategory || 
            !instructions || 
            !workersNeeded || 
            !publisherReward || 
            !targetCountries || 
            !advertiserId
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (publisherReward < 0.1) {
            return res.status(400).json({ message: "Publisher reward must be at least 0.10" });
        }

        if (workersNeeded < 1) {
            return res.status(400).json({ message: "At least one worker is needed" });
        }

        // Fetch the advertiser's user details
        const user = await User.findById(advertiserId);
        if (!user) {
            return res.status(404).json({ message: "Advertiser not found" });
        }

        const advertiserBalance = user.advBalance;
        const totalCost = workersNeeded * publisherReward;

        // Check if the advertiser has sufficient funds
        if (totalCost > advertiserBalance) {
            return res.status(400).json({ message: "Insufficient funds. Please add more funds." });
        }

        // Deduct the cost from the advertiser's balance
        await User.findByIdAndUpdate(
            advertiserId,
            { advBalance: advertiserBalance - totalCost },
            { new: true }
        );

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
            advertiserId,
            userName: user.username,
        });

        // Save task to MongoDB
        await newTask.save();

        // Return success response
        return res.status(200).json({
            message: "Task created successfully",
            task: newTask,
        });

    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// get all task id  in advertiser  page 
let getTaskbyId = async (req, res) => {
    const { id } = req.params
    // console.log(req.body);

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
        let getProof = await getallTask.filter((task) => task.status === 'pending');
        let revision = await getallTask.filter((task) => task.status === 'revision');
        // console.log(getallTask);

        return res.status(200).json({ getProof, revision });
    } catch (error) {
        console.error("Error in getallproofbyId:", error.message);

        // Return an error response
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};
// reject approve revision task 
let UpdateTaskProf = async (req, res) => {
    const { userId, taskId, status, revisionComments , publisherReward } = req.body;
    console.log (req.body)

    //update the task proof counting 
    let task = await Task.findById(taskId)
    let submitTask = await UserTaskSubmit.findById({_id : taskId})
    if(status === "reject"){
        let taskreject = await Task.findOneAndUpdate(
            { _id : taskId },
            { taskProof : task.taskProof - 1 },
            { new: true }
        );
        if(task.status === "Complete"){
            let statusUpdate = await Task.findOneAndUpdate(
                { _id : taskId },
                {status : "Running" , active : true },
                { new: true }
            );
        }
    }

    if (status === 'revision') {
        let taskRevision = await UserTaskSubmit.findOneAndUpdate(
            { userId, taskId },
            { revision: true },
            { new: true }
        );
    } 
    
    if (status === "approved"){
        let getUser = await User.findById({_id : userId})
        let updateEarning = await User.findOneAndUpdate(
           {_id :  userId},
            { earning : getUser.earning + publisherReward  },
            { new: true }
        );
    }
    // Validate status
    const validStatuses = ["approved", "reject", "revision"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        // Find and update the task submission by userId and taskId
        const updatedTask = await UserTaskSubmit.findOneAndUpdate(
            { userId, taskId }, // Query criteria
            { status, revisionComments: revisionComments || '' }, // Update operation
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
    // console.log(req.body);

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
// get all proof in the advertiser page
let allApRejRevTask = async (req, res) => {
    const { taskId } = req.params
    // console.log(req.params);

    try {
        let getProof = await UserTaskSubmit.find({ taskId: taskId })
        let getTask = await Task.findOne({ _id: taskId })
        return res.status(200).json({ getProof, getTask });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
// add fund in advertiser page
const addFund = async (req, res) => {
    // console.log(req.body);

    try {
        // Input validation (Optional, depends on your needs)
        const { userId, amount, paymentMethod, paymentType, TID } = req.body;

        if (!userId || !amount || !paymentMethod || !paymentType || !TID) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Ensure amount is a positive number
        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero." });
        }
        let user = await User.findById(userId);
        let userName = user.username;
        // Create and save the payment
        const add = new PayementModel({ userId, amount, paymentMethod, paymentType, TID, userName });
        const addFund = await add.save();
        return res.status(201).json({ message: "Fund added successfully.", data: addFund });
    } catch (error) {
        // Handle errors
        console.error("Error adding fund:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export { createTask, getTaskbyId, statusUpdate, UpdateTaskProf, getallproofbyId, allApRejRevTask, addFund };
