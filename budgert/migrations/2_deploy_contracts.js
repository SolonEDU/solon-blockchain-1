var Budget = artifacts.require("./BudgetCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(Budget);
};