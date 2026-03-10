const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

module.exports = buildModule("FortressQModule", (m) => {
  // 1. Deploy Toy RSA Wallet (Vulnerable)
  // We send 1 ETH to it so there's something to steal
  const toyRSAWallet = m.contract("ToyRSAWallet", [], {
    value: 1_000_000_000_000_000_000n, // 1 ETH
  });

  // 2. Deploy Quantum Vault (Secure)
  // We need a "Quantum Lock" (Hash of a secret)
  // Secret: "lattice-secret-key"
  // Hash: keccak256("lattice-secret-key")
  // = 0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0
  const quantumLock = "0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0";
  
  const quantumVault = m.contract("QuantumVault", [quantumLock], {
    value: 1_000_000_000_000_000_000n, // 1 ETH
  });

  return { toyRSAWallet, quantumVault };
});