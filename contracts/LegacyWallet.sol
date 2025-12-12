pragma solidity ^0.8.0;

contract LegacyWallet {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    // Standard Ethereum Withdrawal
    // Vulnerability: If I steal your ECDSA Private Key (via Shor's algo),
    // I can become 'msg.sender' and empty this wallet.
    function withdraw() external {
        require(msg.sender == owner, "Access Denied: Not the owner");
        payable(msg.sender).transfer(address(this).balance);
    }

    // Function to verify balance easily
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}