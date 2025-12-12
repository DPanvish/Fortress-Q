import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    ipfsHash: {
        type: String,
        required: true
    },
    encryptedKey: {
        type: String,
        default: "AES-256-GCM + Kyber1024"
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("File", fileSchema);