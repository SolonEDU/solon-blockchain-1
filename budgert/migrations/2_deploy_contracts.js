var Budget = artifacts.require("./Budget.sol");

module.exports = function(deployer) {
  deployer.deploy(Budget);
};