// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ConnectionTest
 * @dev A simple contract to test deployment and interaction with the Ethereum network
 */
contract ConnectionTest {
    string public message;

    /**
     * @dev Set a new message
     * @param newMessage The new message to store
     */
    function setMessage(string calldata newMessage) external {
        message = newMessage;
    }
}