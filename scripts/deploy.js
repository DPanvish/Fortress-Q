const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy LegacyWallet (Vulnerable)
  const LegacyWallet = await hre.ethers.getContractFactory("LegacyWallet");
  const legacyWallet = await LegacyWallet.deploy();
  await legacyWallet.waitForDeployment();
  const legacyAddress = await legacyWallet.getAddress();
  console.log("🔓 LegacyWallet deployed to:", legacyAddress);

  // Fund LegacyWallet so there is something to migrate
  await deployer.sendTransaction({
    to: legacyAddress,
    value: hre.ethers.parseEther("10.0")
  });
  console.log("💰 LegacyWallet funded with 10 ETH");

  // 2. Deploy QuantumVault (Secure)
  // Create a dummy quantum lock (Keccak256 hash of "lattice-secret-123")
  const secret = "lattice-secret-123";
  const quantumLock = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(secret));

  const QuantumVault = await hre.ethers.getContractFactory("QuantumVault");
  const quantumVault = await QuantumVault.deploy(quantumLock);
  await quantumVault.waitForDeployment();
  const quantumAddress = await quantumVault.getAddress();

  console.log("🛡️ QuantumVault deployed to:", quantumAddress);
  console.log(`   (Locked with secret: "${secret}")`);

  console.log("\n--- COPY THESE FOR FRONTEND ---");
  console.log(`LEGACY_ADDRESS: "${legacyAddress}"`);
  console.log(`QUANTUM_ADDRESS: "${quantumAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});