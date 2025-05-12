const { ethers } = require("hardhat");

async function main() {
    const [owner, player1] = await ethers.getSigners();
    const pokerAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Deployed contract address
    const poker = await ethers.getContractAt("Poker", pokerAddress);

    // Example: Call the 'buy_in' function (assuming player1 is buying in)
    await poker.connect(player1).buy_in({ value: ethers.utils.parseEther("1.0") });

    // Example: Call 'my_hand' to see the player's hand
    const hand = await poker.connect(player1).my_hand();
    console.log("Player's hand:", hand);

    // Example: Call 'current_bet' to get the current bet
    const currentBet = await poker.current_bet();
    console.log("Current bet:", ethers.utils.formatEther(currentBet));

    // Example: Call 'board_string' to get the board cards
    const board = await poker.board_string();
    console.log("Current board:", board);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
