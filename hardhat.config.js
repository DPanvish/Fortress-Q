require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24", // Matches the pragma in our contracts
    networks: {
        hardhat: {
            chainId: 1337 // Standard local chain ID
        }
    }
};