// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //"https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "./ILendingPool.sol";

contract LmContract is Ownable {
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F); //mainnet
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3); //mainnet
    ILendingPool pool =
        ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    struct Membership {
        address owner;
        string title;
        string description;
        string imageUrl;
        string linkUrl;
        uint256 stakePrice;
        uint256 numOfMembers; //only store the number of members, this contract won't store a list of all members subscribed
        bool isActive;
    }

    struct MembershipDetail {
        address owner;
        address beneficiary;
        uint256 stakeSum;
        uint256 createMStakePrice;
        uint256 yieldSum;
    }

    struct UserJoinDetail {
        uint256 joinAt;
        uint256 stakePrice;
    }

    mapping(uint256 => Membership) public mpMap; //map (membership.id) => (Membership program) for storing all membership programs
    mapping(uint256 => MembershipDetail) public mpDetailMap; //map (membership.id) => (Membership program private detail)
    mapping(address => uint256[]) public mpListMap; //map (owner.address) => (array of membership.id created) for storing a list of membership program for each service provider, private

    mapping(address => mapping(uint256 => UserJoinDetail)) public ujMap; //map (user.address)(membership.id) => (UserJoinDetail)
    mapping(address => uint256[]) public ujListMap; //map (user.address) => (array of membership.id joined) for storing a list of memberships for each user, private

    uint256 public createMStakePrice = 1e18; //amount a service provider need to stake to create one membership program
    uint256 public numOfMP = 0; //membership programs counter
    uint256 public numOfAllMembers = 0; //member counter

    uint256 public allMembershipStakeSum = 0;
    uint256 public allCreateMStakeSum = 0;
    uint256 public allYieldSum = 0;

    uint256 public lastYieldCollectedAt = 0;

    event MembershipCreateEvent(uint256 mId, address owner, string title); //a new membership program is created
    event MembershipJoinEvent(uint256 mId); //user join a membership program
    event MembershipUnsubscribeEvent(uint256 mId); //user unsubscribe a membership program
    event StakeEvent(uint256 amount); //deposit to pool
    event UnStakeEvent(uint256 amount); //withdraw from pool
    event YieldCollectEvent(uint256 amount);

    constructor() public {
        lastYieldCollectedAt = block.timestamp;
    }

    function aDaiBalance() external view returns (uint256) {
        return aDai.balanceOf(address(this));
    }

    function daiBalance() external view returns (uint256) {
        return dai.balanceOf(address(this));
    }

    function stakeAndCreateMembership(
        address _beneficiary,
        string calldata _title,
        string calldata _description,
        string calldata _imageUrl,
        string calldata _linkUrl,
        uint256 _stakePrice
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title should not be empty"); //require title length > 0
        require(_stakePrice > 0, "Stake price should not be 0"); //require _stakePrice > 0
        require(
            dai.transferFrom(msg.sender, address(this), createMStakePrice),
            "Transfer DAI to contract failed"
        ); //transfer createMStakePrice DAI to this contract
        require(
            dai.approve(address(pool), createMStakePrice),
            "approve DAI for stake pool failed"
        ); //approve DAI to be deposited into pool
        pool.deposit(address(dai), createMStakePrice, address(this), 0); //deposit DAI into pool

        //create new membership
        //assign membership obj to the membership program map with updated index
        uint256 mId = ++numOfMP;
        mpMap[mId] = Membership(
            msg.sender,
            _title,
            _description,
            _imageUrl,
            _linkUrl,
            _stakePrice,
            0,
            true
        );
        mpDetailMap[mId] = MembershipDetail(
            msg.sender,
            _beneficiary,
            0,
            createMStakePrice,
            0
        );
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

    function stakeAndJoinMembership(uint256 _mId) external {
        Membership memory m = mpMap[_mId];
        require(m.isActive, "Target membership is inactive"); //require target membership to be active
        require(
            ujMap[msg.sender][_mId].joinAt == 0,
            "Already a member of this membership program"
        ); //require user had not joined the target membership yet
        require(
            dai.transferFrom(msg.sender, address(this), m.stakePrice),
            "Transfer DAI to contract failed"
        ); //require the target stake price of this membership to be transfered to this contract
        require(
            dai.approve(address(pool), m.stakePrice),
            "approve DAI for stake pool failed"
        ); //require the target amount to be approved for the pool
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

    function withdrawAndUnsubscribeFromMembership(uint256 _mId) external {
        uint256 originalStakePrice = ujMap[msg.sender][_mId].stakePrice;
        require(
            originalStakePrice > 0,
            "Not a member of this membership program"
        ); //require user to be a member of the target membership program
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
        require(
            aDai.approve(address(pool), originalStakePrice),
            "approve aDAI for stake pool failed"
        ); //approve pool to consume aDAI from this contract
        pool.withdraw(address(dai), originalStakePrice, msg.sender); //withdraw DAI from pool and transfer to user

        emit MembershipUnsubscribeEvent(_mId);
        emit UnStakeEvent(originalStakePrice);
    }

    function collectYield() external {
        //onlyOwner
        uint256 totalStake = allMembershipStakeSum + allCreateMStakeSum;
        uint256 aDaiBalance = aDai.balanceOf(address(this));
        if (aDaiBalance > totalStake) {
            uint256 totalYield = aDai.balanceOf(address(this)) - totalStake;
            require(aDai.approve(address(pool), totalYield)); //approve the totalYield to be withdraw by the pool
            //loop through each active membership program, calculate and transfer the yield
            for (uint256 i = 1; i <= numOfMP; i++) {
                MembershipDetail memory md = mpDetailMap[i];
                if (mpMap[i].isActive) {
                    uint256 y = (totalYield * md.stakeSum) / totalStake;
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

    function getMembershipProgramIdList(address _serviceProviderAddress)
        external
        view
        returns (uint256[] memory)
    {
        return mpListMap[_serviceProviderAddress];
    }

    function getUserMembershipIdList(address _userAddress)
        external
        view
        returns (uint256[] memory)
    {
        return ujListMap[_userAddress];
    }

    function isUserAMember(address _userAddress, uint256 _membershipProgramId)
        external
        view
        returns (bool)
    {
        return (ujMap[_userAddress][_membershipProgramId].joinAt > 0);
    }
}
