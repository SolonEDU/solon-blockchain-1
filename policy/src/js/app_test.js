abi = [{
  "constant": true,
  "inputs": [
    {
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "options",
  "outputs": [
    {
      "name": "id",
      "type": "uint256"
    },
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "vote_count",
      "type": "uint256"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
},
{
  "constant": true,
  "inputs": [
    {
      "name": "",
      "type": "address"
    }
  ],
  "name": "voters",
  "outputs": [
    {
      "name": "",
      "type": "bool"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
},
{
  "constant": true,
  "inputs": [],
  "name": "option_count",
  "outputs": [
    {
      "name": "",
      "type": "uint256"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "constructor"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "name": "_option_id",
      "type": "uint256"
    }
  ],
  "name": "votedEvent",
  "type": "event"
},
{
  "constant": false,
  "inputs": [
    {
      "name": "_option_id",
      "type": "uint256"
    }
  ],
  "name": "vote",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}];

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  policies: [[]],
  history: [],

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

    // return App.intermediate();
    return App.initContract();
  },

  create_contract: function() {
    $("#button-click").on("click", function() {
      console.log("intermediate");
      console.log(App.contracts);
      App.contracts.PolicyCreator.deployed().then(function(instance) {
        instance.add_contract();
        return instance.policies(App.policies.length);
      }).then(function(address) {
        App.policies.push(address);
        console.log(web3.eth.contract(abi).at(address));
      });
    });
    return App.render();
  },

  initContract: function () {
    $.getJSON("PolicyCreator.json", function (policy) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.PolicyCreator = TruffleContract(policy);
      // Connect provider to interact with contract
      App.contracts.PolicyCreator.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.intermediate();
    });
  },

  render: function () {
    var policy_creator;
    var loader = $("#loader");
    var content = $("#content");
    var voted = $("#voted");
    var timer = $("#timer");

    App.countdown(timer, new Date("Jul 25, 2019"));

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

    App.contracts.PolicyCreator.deployed().then(function(creator) {
      policy_creator = creator;
      return policy_creator.policies(0);
    }).then(function(first_address) {
      return web3.eth.contract(abi).at(first_address);
    }).then(function(first_policy) {
      first_policy.vote(0, function(error, result) {
        if(!error) {
          console.log(result);
        }
        else {
          console.log(error);
        }
      });
    });
    // Load contract data
    // App.contracts.PolicyCreator.deployed().then(function (instance) {
    //   policy_instance = instance;
    //   return policy_instance.option_count();
    // }).then(function (option_count) {
    //   var option_results = $("#option_results");
    //   option_results.empty();

    //   var option_select = $("#option_select");
    //   option_select.empty();

    //   for (var i = 0; i < option_count; i++) {
    //     policy_instance.options(i).then(function (option) {
    //       var id = Number(option[0]) + 1;
    //       var name = option[1];
    //       var vote_count = option[2];

    //       var option_template = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + vote_count + "</td></tr>"
    //       option_results.append(option_template);

    //       var option_option = "<option value='" + id + "' >" + name + "</option"
    //       option_select.append(option_option);
    //     });
    //   }
    //   return policy_instance.voters(App.account);
    // }).then(function (hasVoted) {
    //   if (hasVoted) {
    //     $('form').hide();
    //   }
    //   voted.hide();
    //   loader.hide();
    //   content.show();
    //   timer.show();
    // }).catch(function (error) {
    //   console.warn(error);
    // });
  },

  castVote: function () {
    var option_id = $('#option_select').val() - 1;
    App.contracts.PolicyCreator.deployed().then(function (instance) {
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
    App.contracts.PolicyCreator.deployed().then(function (instance) {
      instance.NewContract({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        // App.render();
      });
    });
  },

  countdown: function (timer, date) {
    var x = setInterval(function () {
      timer.empty();
      var now = new Date().getTime();
      var distance = date - now;

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timer.append(days + "d " + hours + "h "+ minutes + "m " + seconds + "s ");

      if (distance < 0) {
        clearInterval(x);
        //App.history.push(App.policies[]);
        //App.policies.pull()
        console.log(web3.eth.contract(abi).at(address));
        timer.append("the vote is over");
        $('form').hide();
      }
    })
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});