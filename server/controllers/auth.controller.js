import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MlKem1024 } from "crystals-kyber-js";
import elliptic from 'elliptic';

// Classical Elliptic Curve Cryptography (ECDSA)
const EC = elliptic.ec;
const ec = new EC('secp256k1');

const toBase64 = (arr) => {
    return Buffer.from(arr).toString('base64');
}

// Register User
export const registerUser = async (req, res) => {
    const {username, email, password} = req.body;

    try{
        let existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({msg: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Classical Keys (Vulnerable Layer)
        const keyPair = ec.genKeyPair();
        const ecdsaPrv = keyPair.getPrivateKey("hex");
        const ecdsaPub = keyPair.getPublic("hex");
        const walletAddress = "0x" + ecdsaPub.substring(0, 40);

        // Generate Quantum Keys (Post-Quantum Security)
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
            encryptedQuantumPrivateKey: privateKeyBase64
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
                res.json({token, msg: "Hybrid Identity Created: Classical + Quantum Keys Generated."});
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