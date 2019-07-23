pragma solidity ^0.5.0;

import "./Policy.sol";

contract PolicyCreator {
    event NewContract(address indexed _policy_id);

    mapping(uint => Policy) public policies;
    uint public contract_count;

    function add_contract() public {
        policies[contract_count] = new Policy();
        emit NewContract(address(policies[contract_count]));
        contract_count++;
    }

}