// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameContract {
    struct Game {
        string teamA;
        uint scoreA;
        string teamB;
        uint scoreB;
    }
    
    Game public currentGame;
    
    constructor(
        string memory _teamA,
        uint _scoreA,
        string memory _teamB,
        uint _scoreB
    ) {
        currentGame = Game(_teamA, _scoreA, _teamB, _scoreB);
    }
    
    function getGameData() public view returns (
        string memory, uint, string memory, uint
    ) {
        return (
            currentGame.teamA,
            currentGame.scoreA,
            currentGame.teamB,
            currentGame.scoreB
        );
    }
}