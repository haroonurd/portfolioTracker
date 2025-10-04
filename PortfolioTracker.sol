// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PortfolioTracker {
    struct Portfolio {
        address user;
        uint256 totalValue;
        uint256 lastUpdated;
        string[] chains;
    }
    
    mapping(address => Portfolio) public portfolios;
    address[] public users;
    
    event PortfolioUpdated(address indexed user, uint256 totalValue, uint256 timestamp);
    
    function updatePortfolio(uint256 _totalValue, string[] memory _chains) external {
        Portfolio storage portfolio = portfolios[msg.sender];
        
        if (portfolio.user == address(0)) {
            // New user
            portfolio.user = msg.sender;
            users.push(msg.sender);
        }
        
        portfolio.totalValue = _totalValue;
        portfolio.lastUpdated = block.timestamp;
        portfolio.chains = _chains;
        
        emit PortfolioUpdated(msg.sender, _totalValue, block.timestamp);
    }
    
    function getUserPortfolio(address _user) external view returns (Portfolio memory) {
        return portfolios[_user];
    }
    
    function getAllUsers() external view returns (address[] memory) {
        return users;
    }
    
    function getPortfolioCount() external view returns (uint256) {
        return users.length;
    }
}