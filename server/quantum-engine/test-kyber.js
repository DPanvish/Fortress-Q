import {MlKem1024} from 'crystals-kyber-js';

async function runQuantumCheck(){
    console.log("---------------------------------------------");
    console.log("🛡️  FORTRESS Q: QUANTUM ENGINE DIAGNOSTICS 🛡️");
    console.log("---------------------------------------------");

    try{
        // 1. Instantiate the PQC Algorithm
        // We use Kyber1024 (Highest security level, roughly equivalent to AES-256)
        const recipient = new MlKem1024();
        const sender = new MlKem1024();

        console.log("1. Generating Quantum-Resistant Key Pair...");
        const [publicKey, privateKey] = await recipient.generateKeyPair();
        console.log(`   ✅ Public Key Size: ${publicKey.length} bytes (Lattice-based)`);
        console.log(`   ✅ Private Key Size: ${privateKey.length} bytes`);

        console.log("\n2. Encapsulating Secret (Simulating User Encryption)...");
        // Sender uses Public Key to create a Shared Secret and a Ciphertext
        const [ciphertext, sharedSecretSender] = await sender.encap(publicKey);
        console.log(`   ✅ Ciphertext Created: ${ciphertext.length} bytes`);

        console.log("\n3. Decapsulating (Simulating Server Decryption)...");
        // Recipient uses Private Key to recover the Shared Secret
        const sharedSecretRecipient = await recipient.decap(ciphertext, privateKey);

        console.log("\n4. Verifying Integrity...");
        // Check if both secrets match
        const isSecure = sharedSecretSender.every((byte, i) => byte === sharedSecretRecipient[i]);

        if (isSecure) {
            console.log("   🟢 SUCCESS: Shared secrets match exactly.");
            console.log("   🚀 STATUS: READY FOR DEVELOPMENT.");
        } else {
            console.log("   🔴 FAILURE: Secrets do not match.");
        }
    }catch(err){
        console.error("   🔴 DIAGNOSTIC FAILED:", err);
        // Debugging line to see what the library actually exports if this fails again
        console.log("DEBUG: Library Exports ->", require('crystals-kyber-js'));
    }

    console.log("---------------------------------------------");
}

runQuantumCheck();