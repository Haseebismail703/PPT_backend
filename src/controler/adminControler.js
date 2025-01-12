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
    const { reject_reason, status , advertiserId , totalPriceWithoutFee} = req.body;
    // console.log(req.body);
    try {
        let user = await User.findById({_id : advertiserId})
        let returnFund = await User.findByIdAndUpdate(
            advertiserId,
            { advBalance : user.advBalance + totalPriceWithoutFee } ,
            {new : true}
            )

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
const paidWithdrow = async (req, res) => {
    const { id } = req.params;
    const { TID, status, rejectReason, amount , userId } = req.body;
    //  console.log(req.body,req.params)
    try {

        if (status === "paid") {
            const user = await User.findById({ _id: userId });
            if (!user) {
            return res.status(404).json({ message: "User not found" });
            }
            user.earning -= amount;
            await user.save();
            // console.log(user);
        }

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // Handle case when status is 'added'
        if (status === 'added') {
            const user = await User.findById({_id : userId});

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Update User's advBalance
            user.advBalance += amount;
            user.status = status;
            await user.save();
            // Update Payment Model status
            await PayementModel.findByIdAndUpdate(id, { status }, { new: true });

            return res.json({ message: "Balance updated successfully" });
        }

        // Common logic for handling withdraw requests
        const updateData = { status };
        if (amount) {
            updateData.amount = amount;
        } else {
            updateData.TID = TID;
            updateData.rejectReason = rejectReason;
        }

        const payment = await PayementModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        res.json({ message: `Withdrawal request ${status} successfully`, payment });
    } catch (error) {
        console.error("Error in paidWithdrow:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
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
// get all in admin card 
const getCardDeatail = async (req, res) => {
    try {
      // Fetch the required counts concurrently
      const [
        totalTasks,
        totalUsers,
        pendingPayouts,
        runningTasks,
        blockedUsers,
        newUsers,
        taskReports,
      ] = await Promise.all([
        Task.countDocuments(), // Total number of tasks
        User.countDocuments(), // Total number of users
        PayementModel.countDocuments({ status: "pending" }), // Pending payout requests
        Task.countDocuments({ status: "Running" }), // Tasks currently running
        User.countDocuments({ status: "blocked" }), // Users marked as blocked
        User.countDocuments({
            created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Users created in the last 7 days
        }),
        UserTaskSubmit.countDocuments(),
      ]);
  
      // Send the aggregated data as a response
      return res.status(200).json({
        totalTasks,
        totalUsers,
        pendingPayouts,
        runningTasks,
        blockedUsers,
        newUsers,
        taskReports,
      });
    } catch (error) {
      // Handle any server errors
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
export { pendingTask, getTask, approve_task, reject_task ,getPayment,getUser,PaymentHistory,blockUser,paidWithdrow,getTaskReport,getReportTask,getCardDeatail}
