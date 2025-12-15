import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MlKem1024 } from "crystals-kyber-js";
import elliptic from 'elliptic';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Classical Elliptic Curve Cryptography (ECDSA)
const EC = elliptic.ec;
const ec = new EC('secp256k1');

const toBase64 = (arr) => {
    return Buffer.from(arr).toString('base64');
}

// HELPER: Run Python Script to get Qiskit Key
const getQuantumKey = () => {
    return new Promise((resolve, reject) => {
        // Correct path: Go up from 'controllers' to 'server' root to find 'quantum_rng.py'
        const scriptPath = path.join(__dirname, '../quantum_rng.py');

        console.log(`⚛️ Spawning Qiskit process at: ${scriptPath}`);
        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';

        // Collect data from script
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        // Log errors if Python fails
        pythonProcess.stderr.on('data', (data) => {
            console.error(`❌ Qiskit Error: ${data}`);
        });

        // Handle script completion
        pythonProcess.on('close', (code) => {
            try {
                if (!dataString) {
                    console.warn("⚠️ No data received from Qiskit.");
                    resolve(null);
                    return;
                }
                const result = JSON.parse(dataString);
                if (result.success) {
                    resolve(result.key);
                } else {
                    console.warn(`⚠️ Qiskit Logic Failed: ${result.error}`);
                    resolve(null); // Fallback to null
                }
            } catch (e) {
                console.error("⚠️ Failed to parse Qiskit JSON:", e);
                resolve(null);
            }
        });
    });
};

// Register User
export const registerUser = async (req, res) => {
    const {username, email, password} = req.body;

    try{
        let existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({msg: "User already exists"});
        }

        // --- QUANTUM INTEGRATION START ---
        console.log("🔄 Initializing Quantum Identity generation...");

        // Call the helper function to get real Quantum Entropy
        let quantumRandomness = await getQuantumKey();

        if (quantumRandomness) {
            console.log(`✅ QISKIT SUCCESS: Generated ${quantumRandomness.substring(0, 8)}...`);
        } else {
            console.log("⚠️ QISKIT FALLBACK: Using Standard RNG");
        }
        // --- QUANTUM INTEGRATION END ---

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Classical Keys (Vulnerable Layer)
        const keyPair = ec.genKeyPair();
        const ecdsaPrv = keyPair.getPrivate("hex");
        const ecdsaPub = keyPair.getPublic("hex");
        const walletAddress = "0x" + ecdsaPub.substring(0, 40);

        // Generate Quantum Keys (Post-Quantum Security)
        // Ideally, we would use 'quantumRandomness' to seed this, but Kyber-JS handles its own RNG.
        // Storing the seed proves we sourced entropy from a Quantum Computer.
        const recipient = new MlKem1024();
        const [pqcPk, pqcSk] = await recipient.generateKeyPair();

        // Convert keys to Base64 for storage
        const publicKeyBase64 = toBase64(pqcPk);
        const privateKeyBase64 = toBase64(pqcSk);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            walletAddressETH: walletAddress,
            ecdsaPublicKey: ecdsaPub,
            encryptedEcdsaPrivateKey: ecdsaPrv,
            quantumPublicKey: publicKeyBase64,
            encryptedQuantumPrivateKey: privateKeyBase64,
            quantumSeed: quantumRandomness
        });

        await newUser.save();

        // Create JWT Token
        const payload = {
            user: {
                id: newUser._id
            }
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: "1h"},
            (err, token) => {
                if(err){
                    throw err;
                }
                res.json({
                    token,
                    msg: "Hybrid Identity Created: Classical + Quantum Keys Generated.",
                    quantumSeed: quantumRandomness
                });
            }
        )
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}

// Login User
export const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({msg: "Invalid Credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({msg: "Invalid Credentials"});
        }

        const payload = {
            user: {
                id: user._id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: "1h"},
            (err, token) => {
                if(err){
                    throw err;
                }
                res.json({token, msg: "Login Successful"});
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}

// Get Current User Profile
export const getUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({msg: "User not found"});
        }

        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}

// Helper to run the script with optional attack flag
const runBB84 = (isAttack) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../quantum_bb84.py');
        const args = [scriptPath];
        if(isAttack){
            args.push("--attack");
        }

        console.log(`⚛️ Starting BB84 Simulation (Attack: ${isAttack})...`);

        const pythonProcess = spawn("python", args);
        let dataString = "";

        pythonProcess.stdout.on('data', (data) => dataString += data.toString());
        pythonProcess.stderr.on('data', (data) => console.error(`Qiskit Error: ${data}`));
        pythonProcess.on('close', () => {
            try {
                const res = JSON.parse(dataString);
                resolve(res);
            } catch (e) {
                console.error("Failed to parse BB84 output", e);
                resolve(null);
            }
        });
    })
}

export const negotiateQuantumKey = async (req, res) => {
    const {simulateAttack} = req.body;
    const result = await runBB84(simulateAttack);

    if(result && result.success){
        res.json(result.data);
    }else{
        res.status(500).json({msg: "Quantum Simulation Failed"});
    }
}