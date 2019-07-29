pragma solidity ^0.5.0;

import "./Budget.sol";

contract BudgetCreator {
    event NewContract(address indexed _budget_id);

    address public last_sender;

    mapping(uint => Budget) public budgets;
    uint public contract_count;

    function add_contract() public{
        budgets[contract_count] = new Budget(msg.sender);
        emit NewContract(address(budgets[contract_count]));
        contract_count++;
        last_sender = msg.sender;
    }

}