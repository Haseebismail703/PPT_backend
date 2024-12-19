import Task from '../model/creteTask.js';

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

export { createTask, getTaskbyId, statusUpdate };
