import express from 'express';
import { registerUser, loginUser, getUserProfile, negotiateQuantumKey, mineQuantumBlock, signMigration} from "../controllers/auth.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getUserProfile);
router.post("/qkd", auth, negotiateQuantumKey);
router.post("/mine", auth, mineQuantumBlock);
router.post("/sign-migration", auth, signMigration);

export default router;
