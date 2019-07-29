var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "mixture monkey liberty legal gravity loan frame trust author render summer kingdom";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    }
    // rinkeby: {
    //   provider: function() {
    //     return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/06648fac12b143e6bd45537cdd9b756f");
    //   },
    //   network_id: "*"
    // }
  }
};
