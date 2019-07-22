App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Policy.json", function (policy) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Policy = TruffleContract(policy);
      // Connect provider to interact with contract
      App.contracts.Policy.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  render: function () {
    var policy_instance;
    var loader = $("#loader");
    var content = $("#content");
    var voted = $("#voted");
    var timer = $("#timer");

    timer.append(new Date().getTime())

    loader.show();
    content.hide();
    voted.hide();
    timer.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) { //turn off privacy mode for this to work with MetaMask
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Policy.deployed().then(function (instance) {
      policy_instance = instance;
      return policy_instance.option_count();
    }).then(function (option_count) {
      var option_results = $("#option_results");
      option_results.empty();

      var option_select = $("#option_select");
      option_select.empty();

      for (var i = 0; i < option_count; i++) {
        policy_instance.options(i).then(function (option) {
          var id = Number(option[0]) + 1;
          var name = option[1];
          var vote_count = option[2];

          // Render candidate Result
          var option_template = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + vote_count + "</td></tr>"
          option_results.append(option_template);

          var option_option = "<option value='" + id + "' >" + name + "</option"
          option_select.append(option_option);
        });
      }
      return policy_instance.voters(App.account);
    }).then(function (hasVoted) {
      if (hasVoted) {
        $('form').hide();
      }
      voted.hide();
      loader.hide();
      content.show();
      timer.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  castVote: function () {
    var option_id = $('#option_select').val();
    App.contracts.Policy.deployed().then(function (instance) {
      return instance.vote(option_id, { from: App.account });
    }).then(function (result) {
      $("#content").hide();
      $("#voted").append("Your vote has been recorded. Refresh the page to see your vote.");
      $("#voted").show();
    }).catch(function (err) {
      console.error(err);
    });
  },

  listenForEvents: function () {
    App.contracts.Policy.deployed().then(function (instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
      });
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});