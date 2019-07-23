var Policy = artifacts.require("./Policy.sol");

contract("Policy", function(accounts) {
    var policy_instance;

    it("initializes with two options", function() {
        return Policy.deployed().then(function(instance) {
            return instance.option_count();
        }).then(function(count) {
            assert.equal(count, 2);
        });
    });

    it("it initializes the options with the correct values", function() {
        return Policy.deployed().then(function(instance) {
            policy_instance = instance;
            return policy_instance.options(0);
        }).then(function(option) {
            assert.equal(option[0], 0, "contains the correct id");
            assert.equal(option[1], "Yes", "contains the correct name");
            assert.equal(option[2], 0, "contains the correct vote count");
            return policy_instance.options(1);
        }).then(function(option) {
            assert.equal(option[0], 1, "contains the correct id");
            assert.equal(option[1], "No", "contains the correct name");
            assert.equal(option[2], 0, "contains the correct vote count");
        });
    });

    it("allows a voter to cast a vote", function() {
        return Policy.deployed().then(function(instance) {
            policy_instance = instance;
            option_id = 0;
            return policy_instance.vote(option_id, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
            assert.equal(receipt.logs[0].args._option_id.toNumber(), option_id, "the option id is correct");
            return policy_instance.voters(accounts[0]);
        }).then(function(voted) {
            assert(voted, "the voter was marked as voted");
            return policy_instance.options(option_id);
        }).then(function(option) {
            var vote_count = option[2];
            assert.equal(vote_count, 1, "increments the option's vote count");
        });
    });

    it("throws an exception for invalid options", function() {
        return Policy.deployed().then(function(instance) {
            policy_instance = instance;
            return policy_instance.vote(99, {from: accounts[0]});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return policy_instance.options(0);
        }).then(function(option0) {
            var vote_count = option0[2];
            assert.equal(vote_count, 1, "option 0 did not receive any votes");
            return policy_instance.options(1);
        }).then(function(option1) {
            var vote_count = option1[2];
            assert.equal(vote_count, 0, "option 1 did not receive any votes");
        });
    });

    it("throws an exception for double voting", function() {
        return Policy.deployed().then(function(instance) {
            policy_instance = instance;
            option_id = 1;
            policy_instance.vote(option_id, {from: accounts[1]});
            return policy_instance.options(option_id);
        }).then(function(option) {
            var vote_count = option[2];
            assert.equal(vote_count, 1, "accepts first vote");
            return policy_instance.vote(option_id, {from: accounts[1]});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return policy_instance.options(0);
        }).then(function(option0) {
            var vote_count = option0[2];
            assert.equal(vote_count, 1, "candidate 1 did not receive any votes");
            return policy_instance.options(1);
        }).then(function(option1) {
            var vote_count = option1[2];
            assert.equal(vote_count, 1, "candidate 1 did not receive any votes");
        });
    });
});