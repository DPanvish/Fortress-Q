import File from '../models/file.model.js';
import fs from 'fs';
import path from 'path';

// Mock IPFS Hash Generator
const generateIPFSHash = () => {
    return "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        const { encapsulatedKey } = req.body;
        const ipfsHash = generateIPFSHash();

        // --- 1. DETERMINE UPLOAD PATH ---
        // process.cwd() returns the folder where you started the server (usually 'server/')
        // This avoids the confusing __dirname logic entirely.
        const uploadDir = path.join(process.cwd(), 'uploads');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const newPath = path.join(uploadDir, ipfsHash);

        // Move file
        fs.renameSync(req.file.path, newPath);

        // --- 2. SAVE METADATA ---
        const newFile = new File({
            user: req.user.id,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype || 'application/octet-stream',
            size: req.file.size,
            ipfsHash: ipfsHash,
            encryptedKey: encapsulatedKey
        });

        await newFile.save();

        res.json({
            success: true,
            msg: "File Secured & Stored",
            file: {
                id: newFile._id,
                name: newFile.originalName,
                ipfsHash: newFile.ipfsHash
            }
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

export const downloadFile = async (req, res) => {
    try {
        const { ipfsHash } = req.params;

        // Use process.cwd() here too for consistency
        const uploadDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadDir, ipfsHash);

        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ msg: "File not found on local IPFS node" });
        }
    } catch (err) {
        console.error("Download Error:", err);
        res.status(500).send("Server Error");
    }
};

export const getUserFiles = async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id }).sort({ uploadedAt: -1 });
        res.json(files);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};