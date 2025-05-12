// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
    const Poker = await hre.ethers.getContractFactory("Poker");
    const poker = await Poker.deploy(); // deploys the contract
    await poker.waitForDeployment();    // correct function in newer Hardhat versions

    console.log("Poker deployed to:", poker.target); // use .target for the address
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
