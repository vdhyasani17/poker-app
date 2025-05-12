pragma solidity ^0.8.0;

contract Poker {

    mapping(address => uint256) private bankrolls;
    address[] private players;
    mapping(address => bool) private is_player;
    mapping(address => bool) private is_ready;
    mapping(address => bool) private needs_action;
    mapping(address => Card[]) private player_hands;
    mapping(address => uint256) private bets;

    function random(uint256 seed)public view returns (uint) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seed)));
    }

    enum Stage { BUYIN, PREFLOP, FLOP, TURN, RIVER, SHOWDOWN, FINISHED }
    enum Suit { CLUBS, DIAMONDS, HEARTS, SPADES }
    enum Rank {
        TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN,
        JACK, QUEEN, KING, ACE
    }

    function hand_value(Card[] memory hand) private view returns(uint256)
    {
        require(hand.length == 2, "Hand must be of length 2");
        require(board.length == 5, "Board must be of length 5");

        // Combine hand and board into a single array
        Card[7] memory cards;
        for (uint i = 0; i < 2; i++) {
            cards[i] = hand[i];
        }
        for (uint i = 0; i < 5; i++) {
            cards[i + 2] = board[i];
        }

        // Rank and suit counters
        uint8[13] memory rankCount;
        uint8[4] memory suitCount;
        bool[13] memory rankExists;

        for (uint i = 0; i < 7; i++) {
            rankCount[uint8(cards[i].rank)]++;
            suitCount[uint8(cards[i].suit)]++;
            rankExists[uint8(cards[i].rank)] = true;
        }

        // Check for flush
        uint8 flushSuit = 4; // 0-3 are valid, 4 = none
        for (uint8 i = 0; i < 4; i++) {
            if (suitCount[i] >= 5) {
                flushSuit = i;
                break;
            }
        }

        // Build array of ranks in flush for straight flush detection
        bool[13] memory flushRanks;
        if (flushSuit != 4) {
            for (uint i = 0; i < 7; i++) {
                if (uint8(cards[i].suit) == flushSuit) {
                    flushRanks[uint8(cards[i].rank)] = true;
                }
            }

            int sfHigh = highestStraight(flushRanks);
            if (sfHigh >= 0) return 800 + uint256(sfHigh);
        }

        // Four of a Kind
        for (int i = 12; i >= 0; i--) {
            if (rankCount[uint(i)] == 4) return 700 + uint256(i);
        }

        // Full House
        int three = -1;
        int pair = -1;
        for (int i = 12; i >= 0; i--) {
            if (rankCount[uint(i)] >= 3 && three == -1) three = i;
            else if (rankCount[uint(i)] >= 2 && pair == -1) pair = i;
        }
        if (three != -1 && pair != -1) return 600 + uint256(three);

        // Flush (already found flushSuit)
        if (flushSuit != 4) {
            int high = -1;
            for (int i = 12; i >= 0; i--) {
                if (flushRanks[uint(i)] && high == -1) high = i;
            }
            return 500 + uint256(high);
        }

        // Straight
        int sHigh = highestStraight(rankExists);
        if (sHigh >= 0) return 400 + uint256(sHigh);

        // Three of a Kind
        for (int i = 12; i >= 0; i--) {
            if (rankCount[uint(i)] == 3) return 300 + uint256(i);
        }

        // Two Pair
        int topPair = -1;
        int secondPair = -1;
        for (int i = 12; i >= 0; i--) {
            if (rankCount[uint(i)] >= 2) {
                if (topPair == -1) topPair = i;
                else if (secondPair == -1) secondPair = i;
            }
        }
        if (topPair != -1 && secondPair != -1) return 200 + uint256(topPair);

        // One Pair
        for (int i = 12; i >= 0; i--) {
            if (rankCount[uint(i)] == 2) return 100 + uint256(i);
        }

        // High Card
        for (int i = 12; i >= 0; i--) {
            if (rankExists[uint(i)]) return uint256(i);
        }

        return 0;
    }

    // Utility function to find highest straight
    function highestStraight(bool[13] memory rankMap) private pure returns (int) {
        for (int i = 12; i >= 4; i--) {
            bool isStraight = true;
            for (int j = 0; j < 5; j++) {
                if (!rankMap[uint(i - j)]) {
                    isStraight = false;
                    break;
                }
            }
            if (isStraight) return i;
        }

        // Special case: A-2-3-4-5 (wheel)
        if (rankMap[12] && rankMap[0] && rankMap[1] && rankMap[2] && rankMap[3]) {
            return 3; // Five-high straight
        }

        return -1;
    }

    Stage private stage;
    uint256 private curr_player;
    uint256 private curr_bet;
    uint256 private pot;

    function advance_stage() private {
        stage = Stage(uint(stage) + 1);
        curr_player = 0;
        curr_bet = 0;

        if (players.length == 1)
        {
            stage = Stage.FINISHED;
            return;
        }

        uint256 cards_to_draw = 0;

        if (stage == Stage.FLOP)
        {
            cards_to_draw = 3;
        }
        else if (stage == Stage.TURN || stage == Stage.RIVER)
        {
            cards_to_draw = 1;
        }
        else if (stage == Stage.SHOWDOWN)
        {            
            uint256 max_value = 0;
            address winner;

            for (uint i = 0; i < players.length; i++)
            {
                uint256 value = hand_value(player_hands[players[i]]);

                if (value > max_value)
                {
                    max_value = value;
                    winner = players[i];
                }
            }

            bankrolls[winner] += pot;

            for (uint i = 0; i < players.length; i++)
                payable(players[i]).transfer(bankrolls[players[i]]);

            stage = Stage.FINISHED;
            return;
        }

        for (uint256 i = 0; i < cards_to_draw; i++) {
            board.push(deck[deck.length - 1]);
            deck.pop();
        }

        for (uint i = 0; i < players.length; i++)
        {
            needs_action[players[i]] = true;
            bets[players[i]] = 0;
        }
    }

    struct Card {
        Suit suit;
        Rank rank;
    }

    Card[] private deck;
    Card[] private board;

    function shuffle() private {
        delete deck;
        for (uint8 s = 0; s < 4; s++) {
            for (uint8 r = 0; r < 13; r++) {
                deck.push(Card({
                    suit: Suit(s),
                    rank: Rank(r)
                }));
            }
        }

        for (uint256 j = 0; j < 52; j++)
        {
            uint256 i1 = random(j)%52;
            uint256 i2 = random(j+52)%52;

            Card memory temp = deck[i1];
            deck[i1] = deck[i2];
            deck[i2] = temp;
        }
    }

    constructor () {
        stage = Stage.BUYIN;
        shuffle();
        pot = 0;
    }

    function cardToString(Card memory c) public pure returns (string memory) {
        bytes memory suits = "CDHS";
        bytes memory ranks = "23456789TJQKA";

        bytes memory result = abi.encodePacked(
            ranks[uint8(c.rank)],
            "_",
            suits[uint8(c.suit)]
        );

        return string(result);
    }

    function card_array_to_string(Card[] storage cards) private view returns(string memory) {
        string memory result = "";
        for (uint i = 0; i < cards.length; i++) {
            result = string(abi.encodePacked(
                result,
                ", ",
                cardToString(cards[i])
            ));
        }

        return result;
    }

    //event CardArray(string s);
    function board_string() public view returns (string memory) {
        return card_array_to_string(board);
    }
    
    function my_hand() public view returns(string memory) {
        require(is_player[msg.sender], "You're not in the hand.");
        return card_array_to_string(player_hands[msg.sender]);
    }

    function ready() public {
        require(is_player[msg.sender], "You're not in the hand.");
        require(!is_ready[msg.sender], "You're already in the hand");
        require(stage == Stage.BUYIN, "The game already started");

        is_ready[msg.sender] = true;
        for (uint i = 0; i < 2; i++) {
            player_hands[msg.sender].push(deck[deck.length - 1]);
            deck.pop();
        }

        if (players.length < 2) return;

        for (uint i = 0; i < players.length; i++) {
            if (!is_ready[players[i]]) return;
        }

        advance_stage();
    }

    function action(uint256 _bet) public
    {
        require(stage != Stage.FINISHED, "The game is over");

        address player = players[curr_player];
        uint256 bet = bets[player] + _bet;

        require(stage != Stage.BUYIN, "The game hasn't started yet.");
        require(msg.sender == player, "It's not your turn.");
        require(_bet <= bankrolls[player], "You don't have enough money.");
        require(_bet == bankrolls[msg.sender] 
            ||  _bet == 0
            ||  bet == curr_bet
            ||  bet >= curr_bet * 2, "Invalid bet: min raise is 2x, or use 0 to fold.");

        // check
        if (bet == 0 && curr_bet == 0)
        {
            needs_action[player] = false;
            curr_player = (curr_player + 1) % players.length;
        }

        // call
        else if (bet == curr_bet)
        {
            needs_action[player] = false;

            bankrolls[player] -= _bet;
            bets[player] = bet;
            pot += _bet;

            curr_player = (curr_player + 1) % players.length;
        }

        // raise
        else if (bet > curr_bet)
        {
            for (uint i = 0; i < players.length; i++)
                needs_action[players[i]] = true;

            needs_action[player] = false;

            bankrolls[player] -= _bet;
            curr_bet = bet;
            bets[player] = bet;
            pot += _bet;

            curr_player = (curr_player + 1) % players.length;
        }

        // fold
        else if (bet == 0)
        {
            remove_player(curr_player);
            curr_player = curr_player % players.length;

            if (players.length == 1) stage = Stage.FINISHED;
        }

        if (action_done())
        {
            advance_stage();
        }
    }

    function action_done() private view returns(bool) {
        for (uint i = 0; i < players.length; i++) {
            if (needs_action[players[i]])
                return false;
        }
        return true;
    }

    function buy_in() public payable {
        require(msg.value > 0, "Not enough Ether sent.");
        require(stage == Stage.BUYIN, "It's too late to buy in.");
        bankrolls[msg.sender] += msg.value;
        players.push(msg.sender);
        is_player[msg.sender] = true;
    }

    function current_bet() public view returns(uint256) {
        return curr_bet;
    }

    function remove_player(uint index) private {
        require(index < players.length, "Index out of bounds");
        is_player[players[index]] = false;
        payable(players[index]).transfer(bankrolls[players[index]]);
        for (uint i = index; i < players.length - 1; i++) {
            players[i] = players[i + 1];
        }
        players.pop();
    }

    function bankroll_of(address addr) public view returns (uint256) {
        return bankrolls[addr];
    }
}
