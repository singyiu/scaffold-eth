// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //"https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "./ILendingPool.sol";

contract LmContract is Ownable {
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F); //mainnet
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3); //mainnet
    ILendingPool pool = ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    struct Membership {
        address owner;
        string title;
        string description;
        string imageUrl;
        string linkUrl;
        uint stakePrice;
        uint numOfMembers; //only store the number of members, this contract won't store a list of all members subscribed
        bool isActive;
    }

    struct MembershipDetail {
        address owner;
        address beneficiary;
        uint stakeSum;
        uint createMStakePrice;
        uint yieldSum;
    }

    struct UserJoinDetail {
        uint joinAt;
        uint stakePrice;
    }

    mapping(uint => Membership) public mpMap; //map (membership.id) => (Membership program) for storing all membership programs
    mapping(uint => MembershipDetail) private mpDetailMap; //map (membership.id) => (Membership program private detail)
    mapping(address => uint[]) private mpListMap; //map (owner.address) => (array of membership.id created) for storing a list of membership program for each service provider, private

    mapping(address => mapping(uint => UserJoinDetail)) private ujMap; //map (user.address)(membership.id) => (UserJoinDetail)
    mapping(address => uint[]) private ujListMap; //map (user.address) => (array of membership.id joined) for storing a list of memberships for each user, private

    uint public createMStakePrice = 1e18; //amount a service provider need to stake to create one membership program
    uint public numOfMP = 0; //membership programs counter
    uint public numOfAllMembers = 0; //member counter

    uint private allMembershipStakeSum = 0;
    uint private allCreateMStakeSum = 0;
    uint public allYieldSum = 0;

    uint public lastYieldCollectedAt = 0;

    event MembershipCreateEvent(uint mId, address owner, string title); //a new membership program is created
    event MembershipJoinEvent(uint mId); //user join a membership program
    event MembershipUnsubscribeEvent(uint mId); //user unsubscribe a membership program
    event StakeEvent(uint amount); //deposit to pool
    event UnStakeEvent(uint amount); //withdraw from pool
    event YieldCollectEvent(uint amount);

    constructor() public {
        lastYieldCollectedAt = block.timestamp;
    }

    function aDaiBalance() external view returns (uint) {
        return aDai.balanceOf(address(this));
    }

    function daiBalance() external view returns (uint) {
        return dai.balanceOf(address(this));
    }

    function stakeAndCreateMembership(address _beneficiary, string calldata _title, string calldata _description, string calldata _imageUrl, string calldata _linkUrl, uint _stakePrice) external returns (uint) {
        require(bytes(_title).length > 0, "Title should not be empty"); //require title length > 0
        require(_stakePrice > 0, "Stake price should not be 0"); //require _stakePrice > 0
        require(dai.transferFrom(msg.sender, address(this), createMStakePrice), "Transfer DAI to contract failed"); //transfer createMStakePrice DAI to this contract
        require(dai.approve(address(pool), createMStakePrice), "approve DAI for stake pool failed"); //approve DAI to be deposited into pool
        pool.deposit(address(dai), createMStakePrice, address(this), 0); //deposit DAI into pool

        //create new membership
        //assign membership obj to the membership program map with updated index
        uint mId = ++numOfMP;
        mpMap[mId] = Membership(msg.sender, _title, _description, _imageUrl, _linkUrl, _stakePrice, 0, true);
        mpDetailMap[mId] = MembershipDetail(msg.sender, _beneficiary, 0, createMStakePrice, 0);
        mpListMap[msg.sender].push(mId);
        allCreateMStakeSum += createMStakePrice;

        emit MembershipCreateEvent(numOfMP, msg.sender, _title); //emit MembershipCreateEvent
        emit StakeEvent(createMStakePrice); //emit StakeEvent
        return mId;
    }

    /*
    function withdrawAndDisableMembership(uint _mId) external {
        Membership memory m = mpMap[_mId];
        require(m.owner == msg.sender, "Not owner of the target membership program");
    }
    //setCreateMembershipProgramStakePrice
    */

    function stakeAndJoinMembership(uint _mId) external {
        Membership memory m = mpMap[_mId];
        require(m.isActive, "Target membership is inactive"); //require target membership to be active
        require(ujMap[msg.sender][_mId].joinAt == 0, "Already a member of this membership program"); //require user had not joined the target membership yet
        require(dai.transferFrom(msg.sender, address(this), m.stakePrice), "Transfer DAI to contract failed"); //require the target stake price of this membership to be transfered to this contract
        require(dai.approve(address(pool), m.stakePrice), "approve DAI for stake pool failed"); //require the target amount to be approved for the pool
        pool.deposit(address(dai), m.stakePrice, address(this), 0); //deposit the target amount to pool

        //add user to join the target membership
        ujMap[msg.sender][_mId] = UserJoinDetail(block.timestamp, m.stakePrice);
        ujListMap[msg.sender].push(_mId);
        mpMap[_mId].numOfMembers++;
        numOfAllMembers++;
        mpDetailMap[_mId].stakeSum += m.stakePrice;
        allMembershipStakeSum += m.stakePrice;

        emit MembershipJoinEvent(_mId);
        emit StakeEvent(m.stakePrice); //emit StakeEvent
    }

    function withdrawAndUnsubscribeFromMembership(uint _mId) external {
        uint originalStakePrice = ujMap[msg.sender][_mId].stakePrice;
        require(originalStakePrice > 0, "Not a member of this membership program"); //require user to be a member of the target membership program
        delete ujMap[msg.sender][_mId]; //delete user membership record

        //mId stays in ujListMap as a list of history, where ujMap is the source of truth of user membership

        if (mpDetailMap[_mId].stakeSum >= originalStakePrice) {
            mpDetailMap[_mId].stakeSum -= originalStakePrice;
        }
        if (allMembershipStakeSum >= originalStakePrice) {
            allMembershipStakeSum -= originalStakePrice;
        }
        if (mpMap[_mId].numOfMembers > 0) {
            mpMap[_mId].numOfMembers--; //subtract numOfMembers count of the target membership program
        }
        if (numOfAllMembers > 0) {
            numOfAllMembers--; //subtract numOfAllMembers count
        }

        //N.B. approving aDai but withdraw dai from pool        
		require(aDai.approve(address(pool), originalStakePrice), "approve aDAI for stake pool failed"); //approve pool to consume aDAI from this contract
        pool.withdraw(address(dai), originalStakePrice, msg.sender); //withdraw DAI from pool and transfer to user

        emit MembershipUnsubscribeEvent(_mId);
        emit UnStakeEvent(originalStakePrice);
    }

    function collectYield() external { //onlyOwner
        uint totalStake = allMembershipStakeSum + allCreateMStakeSum;
        uint aDaiBalance = aDai.balanceOf(address(this));
        if (aDaiBalance > totalStake) {
            uint totalYield = aDai.balanceOf(address(this)) - totalStake;
            require(aDai.approve(address(pool), totalYield)); //approve the totalYield to be withdraw by the pool
            //loop through each active membership program, calculate and transfer the yield
            for(uint i=1; i<=numOfMP; i++) {
                MembershipDetail memory md = mpDetailMap[i];
                if (mpMap[i].isActive) {
                    uint y = totalYield * md.stakeSum / totalStake;
                    pool.withdraw(address(dai), y, md.beneficiary);
                    mpDetailMap[i].yieldSum += y;
                } 
            }
            //TODO: collect yeild for contract owner
            allYieldSum += totalYield;
            lastYieldCollectedAt = block.timestamp;
            emit YieldCollectEvent(totalYield);
        }
    }

    function getMyMembershipProgramIdList() external view returns (uint[] memory) {
        return mpListMap[msg.sender];
    }

    function getMyUserMembershipIdList() external view returns (uint[] memory) {
        return ujListMap[msg.sender];
    }

    function isUserAMember(address _userAddress, uint _membershipProgramId) external view returns (bool) {
        return (ujMap[_userAddress][_membershipProgramId].joinAt > 0);
    }
}
