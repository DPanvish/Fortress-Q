pragma solidity ^0.8.0;

contract QuantumVault {
    address public owner;

    // Instead of an address, we lock funds behind a "Quantum Lock" (Hash of Lattice Key)
    bytes32 public quantumLock;

    constructor(bytes32 _quantumLock) payable {
        owner = msg.sender;
        quantumLock = _quantumLock;
    }

    // SECURE WITHDRAWAL
    // This simulates verifying a Post-Quantum Signature (Dilithium).
    // The user must provide the 'latticeSecret' which corresponds to the lock.
    function withdrawSecurely(string memory latticeSecret) external {
        // 1. Verify the Quantum Proof
        require(keccak256(abi.encodePacked(latticeSecret)) == quantumLock, "Invalid Quantum Proof");

        // 2. Transfer funds
        payable(msg.sender).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}