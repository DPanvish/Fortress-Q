const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from (Main Account):", deployer.address);

    // SETUP THE VICTIM (Weak Key)
    // We intentionally create a wallet with a "weak" Private Key (Entropy = 12345)
    // This represents a key that has been weakened by Quantum Algorithms.
    const WEAK_PRIVATE_KEY = "0x" + "12345".padStart(64, "0");
    const weakWallet = new ethers.Wallet(WEAK_PRIVATE_KEY, hre.ethers.provider);

    console.log("\n⚠️  VICTIM SETUP:");
    console.log("   Weak Private Key: " + WEAK_PRIVATE_KEY);
    console.log("   Weak Address:     " + weakWallet.address);

    // Fund the Weak Wallet so it can pay for gas to deploy its contract
    const fundTx = await deployer.sendTransaction({
        to: weakWallet.address,
        value: ethers.parseEther("2.0") // Give it 2 ETH for gas
    });
    await fundTx.wait();

    // DEPLOY VULNERABLE CONTRACT (Owned by Weak Wallet)
    // We connect the factory to the weak wallet, so 'msg.sender' (owner) will be the weak address.
    const LegacyWalletFactory = await hre.ethers.getContractFactory("LegacyWallet", weakWallet);
    const legacyWallet = await LegacyWalletFactory.deploy();
    await legacyWallet.waitForDeployment();
    const legacyAddress = await legacyWallet.getAddress();

    // Fund the Contract (The "Bounty" to steal)
    const tx = await deployer.sendTransaction({
        to: legacyAddress,
        value: ethers.parseEther("10.0")
    });
    await tx.wait();

    console.log(`🔓 LegacyWallet deployed to: ${legacyAddress}`);
    console.log(`   Owner is: ${weakWallet.address} (Vulnerable!)`);

    // DEPLOY QUANTUM VAULT (Secure)
    const QuantumVaultFactory = await hre.ethers.getContractFactory("QuantumVault");
    const secret = "lattice-secret-123";
    const lock = ethers.id(secret);
    const quantumVault = await QuantumVaultFactory.deploy(lock);
    await quantumVault.waitForDeployment();

    console.log(`🛡️ QuantumVault deployed to: ${await quantumVault.getAddress()}`);

    console.log("\n--- COPY FOR FRONTEND ---");
    console.log("LEGACY_ADDRESS:", legacyAddress);
    console.log("QUANTUM_ADDRESS:", await quantumVault.getAddress());
    console.log("VICTIM_OWNER_ADDRESS:", weakWallet.address); // Need this for the simulator
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});