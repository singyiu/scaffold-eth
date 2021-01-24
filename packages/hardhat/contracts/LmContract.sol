// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //"https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "./ILendingPool.sol";

contract LmContract {
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F); //mainnet
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3); //mainnet
    ILendingPool pool = ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    struct Membership {
        address creator;
        address beneficiary;
        string title;
        string description;
        string imageUrl;
        string linkUrl;
        uint stakePrice;
        uint numOfMembers;
        bool isActive;
    }

    event NewMEvent(uint id, address creator, string title); //New membership event
    event DoneStakeEvent(address from); //Done stake into pool event

    mapping(uint => Membership) public mpMap; //map for storing all membership programs

    uint public createMStakePrice = 1e18; //amount a service provider need to stake to create one membership program
    uint public numOfMP = 0; //membership programs counter
    uint public numOfStakes = 0; //TODO: remove

    constructor() public { //TODO: add owner
    }

/*
    function createMembershipProgram(address _beneficiary, string calldata _title, string calldata _description, uint _stakePrice) external {
        //require(dai.transferFrom(msg.sender, address(this), createMembershipStake), "Stake 1 DAI to create a new membership program");
        Membership memory m = Membership(msg.sender, _beneficiary, _title, _description, _stakePrice, 0, true);
        numOfM = numOfM + 1;
        mMap[numOfM] = m;
    }
*/

    function stakeAndCreateMembership(address _beneficiary, string calldata _title, string calldata _description, string calldata _imageUrl, string calldata _linkUrl, uint _stakePrice) external {
        require(dai.transferFrom(msg.sender, address(this), createMStakePrice), "Transfer DAI to contract failed"); //transfer createMStakePrice DAI to this contract
        require(dai.approve(address(pool), createMStakePrice), "approve DAI for stake pool failed"); //approve DAI to be deposited into pool
        pool.deposit(address(dai), createMStakePrice, address(this), 0); //deposit DAI into pool
        numOfStakes = numOfStakes + 1; //increase numOfStakes counter
        Membership memory m = Membership(msg.sender, _beneficiary, _title, _description, _imageUrl, _linkUrl, _stakePrice, 0, true); //prepare membership obj
        numOfMP = numOfMP + 1; //increase numOfM counter / index
        mpMap[numOfMP] = m; //assign membership obj to the membership program map with updated index
        emit NewMEvent(numOfMP, msg.sender, _title); //emit NewMEvent
        emit DoneStakeEvent(msg.sender); //emit DoneStakeEvent
    }

/*
    function playStake(uint _stakeAmount) public {
        require(dai.transferFrom(msg.sender, address(this), _stakeAmount), "playStake required");
        require(dai.approve(address(pool), _stakeAmount), "approve required"); //approve DAI to be deposited into pool
        pool.deposit(address(dai), _stakeAmount, address(this), 0); //deposit DAI into pool
        numOfStakes = numOfStakes + 1;
        emit DoneStakeEvent(msg.sender);
    }
*/

    function aDaiBalance() external view returns (uint) {
        return aDai.balanceOf(address(this));
    }
    function daiBalance() external view returns (uint) {
        return dai.balanceOf(address(this));
    }

}
