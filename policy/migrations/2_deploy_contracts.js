var PolicyCreator = artifacts.require("./PolicyCreator.sol");
// var Policy = artifacts.require("./Policy.sol");

module.exports = function(deployer) {
    deployer.deploy(PolicyCreator);
    // deployer.deploy(Policy);
};