const hre = require("hardhat");

async function main() {
    // Get test accounts (Signers) provided by Hardhat
    const [deployer, hacker] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy Vulnerable Wallet
    const LegacyWallet = await hre.ethers.getContractFactory("LegacyWallet");
    const legacyWallet = await LegacyWallet.deploy();
    await legacyWallet.waitForDeployment();

    const legacyAddress = await legacyWallet.getAddress();
    console.log(`🔓 LegacyWallet deployed to: ${legacyAddress}`);

    // Fund It (Send some ETH to it)
    const tx = await deployer.sendTransaction({
        to: legacyAddress,
        value: hre.ethers.parseEther("10.0") // 10 ETH
    });
    await tx.wait();
    console.log("💰 LegacyWallet funded with 10 ETH");

    // Deploy Quantum Vault
    const secretKey = "lattice-secret-123";
    const quantumLock = hre.ethers.id(secretKey);

    const QuantumVault = await hre.ethers.getContractFactory("QuantumVault");
    const quantumVault = await QuantumVault.deploy(quantumLock);
    await quantumVault.waitForDeployment();

    const quantumAddress = await quantumVault.getAddress();
    console.log(`🛡️ QuantumVault deployed to: ${quantumAddress}`);
    console.log(`   (Locked with secret: "${secretKey}")`);

    console.log("\n--- COPY THESE FOR FRONTEND ---");
    console.log("LEGACY_ADDRESS:", legacyAddress);
    console.log("QUANTUM_ADDRESS:", quantumAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});