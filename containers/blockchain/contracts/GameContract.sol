// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameContract {
    string public message = "Empty contract";
    
    // Basic function to confirm contract is working
    function getMessage() public view returns (string memory) {
        return message;
    }
}