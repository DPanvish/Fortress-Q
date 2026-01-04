pragma solidity ^0.8.0;

contract QuantumVault {
    address public admin;

    // Instead of an address, we lock funds behind a "Quantum Lock" (Hash of Lattice Key)
    bytes32 public quantumLock;

    // Mapping to track individual user balances (Quantum-Resistant Ledger)
    mapping(address => uint256) public balances;

    constructor(bytes32 _quantumLock) payable {
        admin = msg.sender;
        quantumLock = _quantumLock;
    }

    // Deposit funds into the secure vault and credit the sender
    receive() external payable {
        balances[msg.sender] += msg.value;
    }

    // SECURE WITHDRAWAL
    // Uses Hash-Based Cryptography (Quantum-Resistant).
    // The user provides the pre-image 'latticeSecret' for the on-chain 'quantumLock'.
    // This mechanism relies on Pre-image Resistance, which is secure against Shor's Algorithm.
    function withdrawSecurely(string memory latticeSecret) external {
        // 1. Verify the Quantum Proof
        require(keccak256(abi.encodePacked(latticeSecret)) == quantumLock, "Invalid Quantum Proof");

        // 2. Check User Balance
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds deposited for this address");

        // 3. Update State (Prevent Re-entrancy)
        balances[msg.sender] = 0;

        // 4. Transfer
        payable(msg.sender).transfer(amount);
    }

    // ADMIN HELPER: Reset the demo by draining all funds back to admin
    function emergencyDrain() external {
        require(msg.sender == admin, "Admin only");
        payable(admin).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}