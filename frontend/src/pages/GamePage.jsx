import React, { useEffect, useState } from 'react';
import { useGameStore } from "../store/useGameStore.js";
import { useParams } from 'react-router-dom';

const GamePage = () => {
    const [communityCards, setCommunityCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [betAmount, setBetAmount] = useState("");

    const { isGameLoading, currentGame, fetchGame } = useGameStore();
    const { id: gameId } = useParams();

    useEffect(() => {
        fetchGame(gameId);
    }, [gameId, fetchGame]);

    const players = currentGame?.players || [];

    // Card deck and dealing functions (simulation, not real functionality)
    const createDeck = () => {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ rank, suit });
            }
        }

        return deck;
    };

    const shuffleDeck = (deck) => {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    };

    const dealCards = (players, deck) => {
        return players.map(() => {
            // Deal two cards to each player
            const cards = [deck.pop(), deck.pop()];
            return cards;
        });
    };

    const dealCommunityCards = (deck) => {
        const communityCards = [];

        for (let i = 0; i < 5; i++) {
            communityCards.push(deck.pop());
        }

        return communityCards;
    };

    const simulateGame = () => {
        const deck = createDeck();
        shuffleDeck(deck);

        // Deal cards to players
        const playerCards = dealCards(players, deck);

        // Deal community cards
        const communityCards = dealCommunityCards(deck);

        // Now, update the game state (player cards and community cards)
        setPlayerCards(playerCards); // Update the player cards state
        setCommunityCards(communityCards); // Update the community cards state
    };

    useEffect(() => {
        if (!isGameLoading) {
            simulateGame(); // Call simulate game after loading
        }
    }, [isGameLoading]);

    // Function to render cards
    const renderCard = (card, index) => (
        <div
            key={index}
            className="w-12 h-16 bg-red-500 rounded shadow text-xl flex justify-center items-center text-white"
            style={{ fontSize: '0.8rem' }} // Adjust font size for the card numbers
        >
            {card.rank} of {card.suit}
        </div>
    );

    const handleBet = async () => {
        console.log("Bet:", betAmount);
        try {
            const response = await fetch(`/api/games/${gameId}/bet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ betAmount }),
            });
            const updatedGame = await response.json();
            fetchGame(gameId); // Re-fetch game data to update state
        } catch (error) {
            console.error("Bet action failed:", error);
        }
    };

    const handleCall = async () => {
        console.log("Call/Check");
        try {
            const response = await fetch(`/api/games/${gameId}/call`, {
                method: 'POST',
            });
            const updatedGame = await response.json();
            fetchGame(gameId);
        } catch (error) {
            console.error("Call action failed:", error);
        }
    };

    const handleFold = async () => {
        console.log("Fold");
        try {
            const response = await fetch(`/api/games/${gameId}/fold`, {
                method: 'POST',
            });
            const updatedGame = await response.json();
            fetchGame(gameId);
        } catch (error) {
            console.error("Fold action failed:", error);
        }
    };


    if (isGameLoading) {
        return <div>Loading game...</div>;
    }

    return (
        <div className="min-h-screen bg-green-800 pb-32 mt-24"> {/* Extra padding for bottom bar space */}
            <div className="flex justify-center items-center pt-10">
                <div className="relative w-[800px] h-[500px] rounded-full border-8 border-yellow-600 bg-green-700 shadow-xl">
                    {/* Community Cards */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                        {communityCards.map((card, index) => renderCard(card, index))}
                    </div>

                    {/* Players */}
                    {players.map((player, index) => {
                        const angle = (360 / players.length) * index;
                        const radius = 200;
                        const x = Math.cos((angle * Math.PI) / 180) * radius;
                        const y = Math.sin((angle * Math.PI) / 180) * radius;

                        return (
                            <div
                                key={player._id || index}
                                className="absolute flex flex-col items-center text-white"
                                style={{
                                    top: `calc(50% + ${y}px)`,
                                    left: `calc(50% + ${x}px)`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="bg-gray-900 px-3 py-1 rounded-full text-sm">{player.username}</div>
                                <div className="text-yellow-300 text-xs">{player.chips} chips</div>
                                {/* Player's Cards */}
                                <div className="flex gap-2 mt-2">
                                    {playerCards[index]?.map((card, idx) => renderCard(card, idx))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-base-100 border-t border-base-300 p-8 z-10">
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center background-red">
                    <button className="btn btn-error h-12 w-40 bg-red-500 border-none text-white" onClick={handleFold}>
                        Fold
                    </button>

                    <button className="btn btn-secondary bg-blue-500 border-none h-12 w-40 text-lg" onClick={handleCall}>
                        Call / Check
                    </button>

                    <button className="btn btn-primary bg-green-700 border-none h-12 w-40 text-lg" onClick={handleBet}>
                        Bet
                    </button>

                    <input
                        type="number"
                        className="input input-bordered h-12 w-32 text-center"
                        placeholder="Bet amount"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        min={0}
                    />
                </div>
            </div>
        </div>
    );
};

export default GamePage;
