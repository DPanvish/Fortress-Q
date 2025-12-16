import express from 'express';
import { registerUser, loginUser, getUserProfile, negotiateQuantumKey, mineQuantumBlock} from "../controllers/auth.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getUserProfile);
router.post("/qkd", auth, negotiateQuantumKey);
router.post("/mine", auth, mineQuantumBlock);

export default router;
