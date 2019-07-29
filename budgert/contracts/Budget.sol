pragma solidity ^0.5.0;

import "./ERC20.sol";

contract Budget is ERC20 {

    address public owner;

    event votedEvent(uint indexed _option_id);

    struct Option{
        uint id;
        string name;
        uint vote_count;
    }

    mapping(uint => Option) public options;
    mapping(address => bool) public voters;
    uint public option_count;

    constructor(address _owner) public {
        owner = _owner;
        add_option("Yes");
        add_option("No");

        //Test
        //transferFrom(0x1d91a4c2F20e037a7F00F78318AE49346361B28C, owner, 1 ether);
    }

    function add_option(string memory _name) private {
        options[option_count] = Option(option_count, _name, 0);
        option_count++;
    }

    function vote(uint _option_id) public {
        require(!voters[msg.sender], "user already voted");
        require(_option_id >= 0 && _option_id < option_count, "invalid option");
        voters[msg.sender] = true;
        options[_option_id].vote_count++;
        emit votedEvent(_option_id);
    }
}
