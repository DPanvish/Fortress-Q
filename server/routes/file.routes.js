import express from 'express';
import multer from 'multer';
import { uploadFile, getUserFiles } from "../controllers/file.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const storage = multer.dest({dest: 'uploads/'});
const upload = multer({dest: 'uploads/'});

router.post("/upload", auth, upload.single('file'), uploadFile);
router.get("/", auth, getUserFiles);

export default router;