// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameContract {
    struct Game {
        string player1Name;
        uint player1Score;
        string player2Name;
        uint player2Score;
    }
    
    Game public currentGame;
    
    constructor(
        string memory player1Name,
        uint player1Score,
        string memory player2Name,
        uint player2Score
    ) {
        currentGame = Game(player1Name, player1Score, player2Name, player2Score);
    }
    
    function getGameData() public view returns (
        string memory, uint, string memory, uint
    ) {
        return (
            currentGame.player1Name,
            currentGame.player1Score,
            currentGame.player2Name,
            currentGame.player2Score
        );
    }
}