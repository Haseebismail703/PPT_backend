import Task from '../model/creteTask.js'



let pendingTask = async (req, res) => {
    try {
        let task = await Task.find({ status: "Pending" })
        return res.status(200).json(task)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

let getTask = async (req, res) => {
    try {
        let task = await Task.find()
        return res.status(200).json(task)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}


let approve_task = async (req, res) => {
    const { id } = req.params;
    const { status, active } = req.body;
    console.log(req.body);

    try {
        let approve = await Task.findByIdAndUpdate(
            id,
            { status, active },
            { new: true },
        )
        res.json({ message: 'Task status updated successfully', approve });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }

}

let reject_task = async (req, res) => {
    const { id } = req.params;
    const { reject_reason, status } = req.body;
    console.log(req.body);

    try {
        let reject = await Task.findByIdAndUpdate(
            id,
            { reject_reason, status },
            { new: true },
        )
        res.json({ message: 'Task status updated successfully', reject });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export { pendingTask, getTask, approve_task, reject_task }