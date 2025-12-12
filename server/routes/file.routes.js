import express from 'express';
import multer from 'multer';
import { uploadFile, getUserFiles, downloadFile } from "../controllers/file.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

const upload = multer({dest: 'uploads/'});

router.post("/upload", auth, upload.single('file'), uploadFile);
router.get("/", auth, getUserFiles);
router.get('/download/:ipfsHash', downloadFile);

export default router;