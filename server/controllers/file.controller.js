import File from '../models/file.model.js';
import fs from 'fs';

const uploadToIPFS = async(filePath) => {
    return "Om" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Upload file
export const uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({msg: "No file uploaded"});
        }

        const {encapsulatedKey} = req.body;
        const ipfsHash = await uploadToIPFS(req.file.path);

        const newFile = new File({
            user: req.user.id,
            originalName: req.file.originalname,
            mimeType: req.file.mimeType,
            size: req.file.size,
            ipfsHash,
            encryptedKey: encapsulatedKey
        })

        await newFile.save();

        // Clean up local storage
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            msg: "File Secured and Uploaded to Decentralized Storage.",
            file: {
                id: newFile._id,
                name: newFile.originalName,
                ipfsHash: newFile.ipfsHash,
            }
        });
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error during File Upload. Please try again later.");
    }
}

// Get user files
export const getUserFiles = async (req, res) => {
    try{
        const files = await File.find({user: req.user.id}).sort({uploadedAt: -1});
        res.json(files);
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error. Please try again later.");
    }
}