import express from "express";
import multer  from "multer";
import { signupUser, signinUser, adminLogin } from '../controler/authController.js'
import { createTask, getTaskbyId, statusUpdate, UpdateTaskProf } from "../controler/advController.js";
import { pendingTask, getTask, approve_task, reject_task, getPayment, getUser } from '../controler/adminControler.js'
import { getPaymentHistory, getTaskuser,myWork,submitTask, userPayment } from '../controler/userControler.js'
const router = express.Router();
const storage = multer.diskStorage({});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
});
// publick route
router.post('/signinUser', signinUser);
router.post('/signupUser', signupUser);
router.post('/adminLogin', adminLogin);
// advertiser routes 
router.post('/createTask', createTask);
router.get('/getTaskbyId/:id', getTaskbyId);
router.put('/UpdateTaskProf',UpdateTaskProf) 
router.put('/statusUpdate/:id', statusUpdate);
// admin rotes
router.get('/getUser',getUser)
router.get('/pendingTask', pendingTask);
router.get('/getTask', getTask);
router.put('/approve_task/:id', approve_task);
router.put('/reject_task/:id', reject_task);
router.get('/getPayment',getPayment)
// User route 
router.get('/getTaskuser', getTaskuser);
router.post('/submitTask', upload.array('file', 3),submitTask)
router.get('/myWork',myWork)
router.post('/payment',userPayment)
router.get('/getPaymentHistory',getPaymentHistory)
export default router
