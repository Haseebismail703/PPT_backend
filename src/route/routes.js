import express from "express";
import multer  from "multer";
import { signupUser, signinUser, adminLogin,userProfile,profileUpdate } from '../controler/authController.js'
import { allApRejRevTask, createTask, getallproofbyId, getTaskbyId, statusUpdate, UpdateTaskProf,addFund } from "../controler/advController.js";
import { pendingTask, getTask, approve_task, reject_task, getPayment, getUser,PaymentHistory,blockUser, paidWithdrow ,getTaskReport,getReportTask} from '../controler/adminControler.js'
import { getPaymentHistory, getTaskuser,getTaskByuser,myWork,submitTask, userPayment,reportTask } from '../controler/userControler.js'
const router = express.Router();
const storage = multer.diskStorage({});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
});
// public route
router.post('/signinUser', signinUser);
router.post('/signupUser', signupUser);
router.post('/adminLogin', adminLogin);
router.get('/userProfile/:id',userProfile);
router.put('/profileUpdate/:id',upload.array('file', 1),profileUpdate);
// advertiser routes 
router.post('/createTask', createTask);
router.get('/getTaskbyId/:id', getTaskbyId);
router.get('/getallproofbyId/:taskId',getallproofbyId);
router.get('/allApRejRevTask/:taskId',allApRejRevTask);
router.put('/UpdateTaskProf',UpdateTaskProf);
router.put('/statusUpdate/:id', statusUpdate);
router.post('/addFund',addFund);
// admin rotes
router.get('/getUser',getUser);
router.put('/blockUser/:id',blockUser);
router.get('/pendingTask', pendingTask);
router.get('/getTask', getTask);
router.put('/approve_task/:id', approve_task);
router.put('/reject_task/:id', reject_task);
router.get('/getPayment',getPayment);
router.get('/PaymentHistory',PaymentHistory)
router.put('/paidWithdrow/:id',paidWithdrow)
router.get('/getTaskReport',getTaskReport)
router.get('/getReportTask/:taskId',getReportTask)
// User route 
router.get('/getTaskuser', getTaskuser);
router.get('/getTaskByuser/:taskId',getTaskByuser);
router.post('/submitTask', upload.array('file', 3),submitTask);
router.get('/myWork/:userId',myWork);
router.post('/payment',userPayment);
router.get('/getPaymentHistory/:id',getPaymentHistory);
router.post('/reportTask',reportTask);

export default router;
