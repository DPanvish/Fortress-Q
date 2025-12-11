import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // The Quantum Identity Fields
    quantumPublicKey: {
        type: String,
        required: true,
        default: "pending"
    },
    // In a real production app, private key stays on client.
    // For this prototype, we store it encrypted on the server (Custodial Model).
    encryptedPrivateKey: {
        type: String,
        required: true,
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("User", userSchema);