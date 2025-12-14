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
    // Classical Identity Fields
    walletAddressETH: {
        type: String,
        default: "pending"
    },
    ecdsaPublicKey: {
        type: String,
        default: "pending"
    },
    encryptedEcdsaPrivateKey: {
        type: String,
        default: "pending"
    },
    // The Quantum Identity Fields
    quantumPublicKey: {
        type: String,
        required: true,
        default: "pending"
    },
    // In a real production app, private key stays on client.
    // For this prototype, we store it encrypted on the server (Custodial Model).
    encryptedQuantumPrivateKey: {
        type: String,
        required: true,
        default: "pending"
    },
    // The Qiskit Entropy Field
    quantumSeed: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("User", userSchema);