var Policy = artifacts.require("./Policy.sol");

module.exports = function(deployer) {
    deployer.deploy(Policy);
};