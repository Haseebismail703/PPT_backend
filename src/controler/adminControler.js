import User from '../model/authModel.js'
import Task from '../model/creteTask.js'
import PayementModel from '../model/paymentModel.js'
import report from '../model/reportModel.js'
import UserTaskSubmit from '../model/submitTask.js'
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
// getAll user 
let getUser = async (req,res) =>{
    try {
        let getUser = await User.find()
        return res.status(200).json(getUser)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
// get all Payment request 
let getPayment = async (req, res) => {
    try {
        let getPayment = await PayementModel.find({status : "pending"});
        let getDeposite = await getPayment.filter((payment) => payment.paymentType === 'Deposit');
        let getWithdraw = await getPayment.filter((payment) => payment.paymentType === 'Withdraw');
        return res.status(200).json({getDeposite,getWithdraw});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// transaction history  
let PaymentHistory = async (req, res) => {
    try {
        let getPayment = await PayementModel.find();
        return res.status(200).json(getPayment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//block user 
let blockUser = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        let block = await User.findByIdAndUpdate
            (id,
                { status },
                { new: true }
            )
        res.json({ message: `User ${status} successfully`, block });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
let paidWithdrow = async (req, res) => {
    const { id } = req.params;
    const {TID,status,rejectReason,amount} = req.body;
    
    try {
        if(amount){
            let block = await PayementModel.findByIdAndUpdate
                (id,{ status,amount },{ new: true })
            res.json({ message: `Withdrowel request ${status} successfully`, block });    
            }else{
             let block = await PayementModel.findByIdAndUpdate
            (id,
                { status,TID,rejectReason },
                { new: true }
            )
        res.json({ message: `Withdrowel request ${status} successfully`, block });   
            }
        
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
// getreport 
let getTaskReport = async (req, res) => {
    try {
        let getPayment = await report.find();
        return res.status(200).json(getPayment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//get all report task deatial
let getReportTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        let getPayment = await UserTaskSubmit.find({taskId});
        return res.status(200).json(getPayment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
export { pendingTask, getTask, approve_task, reject_task ,getPayment,getUser,PaymentHistory,blockUser,paidWithdrow,getTaskReport,getReportTask}
