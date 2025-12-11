import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MlKem1024 } from "crystals-kyber-js";

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

        // Generate Quantum Keys (Post-Quantum Security)
        const recipient = new MlKem1024();
        const [pk, sk] = await recipient.generateKeyPair();

        // Convert keys to Base64 for storage
        const publicKeyBase64 = toBase64(pk);
        const privateKeyBase64 = toBase64(sk);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            quantumPublicKey: publicKeyBase64,
            encryptedPrivateKey: privateKeyBase64
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
                res.json({token, msg: "Registration Successful. Quantum Identity Created."});
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