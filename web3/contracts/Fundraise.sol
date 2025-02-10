// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Fundraise {
    // Memo struct to store details of each donation
    struct Memo {
        string name;
        string message;
        uint256 timestamp;
        address from;
    }

    // Array to store all memos
    Memo[] public memos;

    // Address of the contract owner
    address payable public owner;

    // Event to emit when a donation is received
    event DonationReceived(address indexed from, uint256 amount, string name, string message);

    // Constructor to set the owner of the contract
    constructor() {
        owner = payable(msg.sender);
    }

    // Function to donate to the contract
    function donate(
        string calldata name,
        string calldata message
    ) external payable {
        // Ensure the donation amount is greater than 0
        require(msg.value > 0, "Please pay more than 0 Sonic");

        // Transfer the donation amount to the owner
        owner.transfer(msg.value);

        // Add the memo to the memos array
        memos.push(Memo(name, message, block.timestamp, msg.sender));

        // Emit the DonationReceived event
        emit DonationReceived(msg.sender, msg.value, name, message);
    }

    // Function to get all memos
    function getMemos() external view returns (Memo[] memory) {
        return memos;
    }
}
