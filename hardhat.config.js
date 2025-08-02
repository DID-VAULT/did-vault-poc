// Load environment variables from .env file
require("dotenv").config();

// Import the Hardhat toolbox
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      // Directly access the environment variable here
      url: process.env.AMOY_RPC_URL,
      
      // Directly access the environment variable here and wrap it in an array
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

