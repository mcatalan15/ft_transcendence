// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TournamentScores {
    struct Score {
        uint teamA;
        uint teamB;
    }
    
    mapping(uint => Score) public matches;
    uint public matchCount;
    
    event ScoreRecorded(uint indexed matchId, uint teamA, uint teamB);
    
    function recordScores(uint _teamA, uint _teamB) public returns (uint) {
        matchCount++;
        matches[matchCount] = Score(_teamA, _teamB);
        emit ScoreRecorded(matchCount, _teamA, _teamB);
        return matchCount;
    }
    
    function getScores(uint _matchId) public view returns (uint, uint) {
        return (matches[_matchId].teamA, matches[_matchId].teamB);
    }
}
