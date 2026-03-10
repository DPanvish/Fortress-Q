import express from 'express';
import { negotiateQuantumKey, mineQuantumBlock, signMigration, runAttackSimulation } from "../controllers/quantum.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// All quantum simulation routes are protected and require a valid token
router.use(auth);

router.post("/qkd", negotiateQuantumKey);
router.post("/mine", mineQuantumBlock);
router.post("/sign-migration", signMigration);
router.post("/attack", runAttackSimulation);

export default router;
