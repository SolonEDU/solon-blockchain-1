var PolicyCreator = artifacts.require("./PolicyCreator.sol");

contract("PolicyCreator", function(accounts) {
    var policy_creator; 

    it("creates creator", function() {
        return PolicyCreator.deployed().then(function(instance) {
            return instance.contract_count();
        }).then(function(count) {
            assert.equal(count, 0);
        });
    });

    it("creates a new contract", function() {
        return PolicyCreator.deployed().then(function(instance) {
            policy_creator = instance;
            return policy_creator.add_contract("name", "Desc", "creation", "deadline");
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            return policy_creator.contract_count();
        }).then(function(count){
            assert.equal(count,1);
        });
    });

    it("can interact with new contract", function() {
        return PolicyCreator.deployed().then(function(instance) {
            policy_creator = instance;
            return policy_creator.policies(0);
        }).then(function(policy_instance) {
            console.log(policy_instance.policies(0));
        });
    });
});