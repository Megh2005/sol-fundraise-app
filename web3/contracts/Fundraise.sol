// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Fundraise {
    struct Memo {
        string name;
        string message;
        uint256 timestamp;
        address from;
    }

    Memo[] public memos;
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function donate(
        string calldata name,
        string calldata message
    ) external payable {
        require(msg.value > 0, "Please pay more than 0 Sonic");
        owner.transfer(msg.value);
        memos.push(Memo(name, message, block.timestamp, msg.sender));
    }
}
