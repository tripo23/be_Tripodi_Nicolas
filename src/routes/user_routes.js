import { Router } from "express";
import { changeRole, uploadFile, logout, resetPassword, selectRole, setNewPassword, setPassword } from "../dao/controllers/user_controller.js";
import uploader from "../dao/services/uploader.service.js";

const documentUploader = uploader('documents');

const router = Router();

router.post('/resetPassword', resetPassword);
router.get('/setPassword/:email/:token', setPassword);
router.post('/setNewPassword', setNewPassword);
router.get('/api/users/premium/:uid', selectRole);
router.post('/changeRole', changeRole);
router.post('/logout', logout);
router.post('/:uid/documents', documentUploader.single('file'), uploadFile);



export default router;