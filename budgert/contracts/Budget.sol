pragma solidity ^0.5.0;

contract Budget {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Voting
    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    event votedEvent (
        uint indexed _candidateId
    );

    // Read/write candidate
    mapping(uint => Candidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;

    // Add Candidate
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Constructor
    address public creator;
    string public name;
    uint public counter;

    constructor(string memory _name, uint _daysAfter) public {
        addCandidate("Yes");
        addCandidate("No");

        creator = msg.sender;
        name = _name;
        counter = _daysAfter * 1 days;
    }

    // Timer

    function countdown() public {
        counter = counter - 1000;
    }

    // Transaction

    function winner() public returns (string memory winner) {
    
        if (candidates[1].voteCount > candidates[2].voteCount) {
            return candidates[1].name;
        }

        else {
            return candidates[2].name;
        }
    }


}