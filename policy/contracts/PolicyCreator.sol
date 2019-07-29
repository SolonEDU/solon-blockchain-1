pragma solidity ^0.5.0;

import "./Policy.sol";

contract PolicyCreator {
    event NewContract(address indexed _policy_id);

    mapping(uint => Policy) public policies;
    uint public contract_count;

    function add_contract(string memory _name, string memory _description, string memory _creation, string memory _deadline) public {
        policies[contract_count] = new Policy(_name, _description, _creation, _deadline);
        emit NewContract(address(policies[contract_count]));
        contract_count++;
    }

}