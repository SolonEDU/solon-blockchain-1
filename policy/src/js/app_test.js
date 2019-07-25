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
  policies: [],
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

  initContract: function () {
    $.getJSON("PolicyCreator.json", function (policy) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.PolicyCreator = TruffleContract(policy);
      // Connect provider to interact with contract
      App.contracts.PolicyCreator.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.create_contract();
    });
  },

  create_contract: function() {
    $("#button-click").on("click", function() {
      App.contracts.PolicyCreator.deployed().then(function(instance) {
        console.log(instance);
        instance.add_contract();
        return instance.policies(App.policies.length - 1);
      }).then(function(address) {
        console.log(address);
        var contract_data = [document.getElementById('proposal_name').value, document.getElementById('proposal_description').value, address, document.getElementById('proposal_time').value, new Date()];
        App.policies.push(contract_data);
      });
    });
    return App.render();
  },

  render: function () {
    var policy_creator;
    var loader = $("#loader");
    var content = $("#content");
    var voted = $("#voted");
    //var timer = $("#timer");
    

    //trying to display proposal info
    
    var display = $("#display");

    for (var id = 0; id < App.policies.length; id++) {
      var policy_name = "Test";
      var policy_time = "x";
      var policy_box = "<div class=\"col-sm-3\"> <div class=\"container\"> <div class=\"modal\" id=\"mymodal\"> <div class=\"modal-dialog\"> <div class=\"modal-content\"> <div class=\"modal-header\"> <h2 class=\"modal-title\">" + policy_name + "</h2> <button class=\"close\" type=\"button\" data-dismiss=\"modal\">x</button> </div> <div class=\"modal-body\"> <p> Proposal Information</p> </div> </div> </div> </div> <div class=\"p-3 mb-2 bg-light text-dark\"> <h4 id=\"name\"><a href=\"#\" data-toggle=\"modal\" data-target=\"#mymodal\">" + policy_name + "</a></h4> Submitted " + policy_time + " days ago </div> </div> </div>";

      display.append(policy_box);
    }

    //App.countdown(timer, new Date("Jul 25, 2019"));

    loader.show();
    content.hide();
    voted.hide();
    // timer.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) { //turn off privacy mode for this to work with MetaMask
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // App.contracts.PolicyCreator.deployed().then(function(creator) {
    //   policy_creator = creator;
    //   return policy_creator.policies(0);
    // }).then(function(first_address) {
    //   return web3.eth.contract(abi).at(first_address);
    // }).then(function(first_policy) {
    //   first_policy.vote(0, function(error, result) {
    //     if(!error) {
    //       console.log(result);
    //     }
    //     else {
    //       console.log(error);
    //     }
    //   });
    // });
    
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

  // countdown: function (date_creation, date_end) {
  //   var x = setInterval(function () {
  //     timer.empty();
  //     var now = new Date().getTime();
  //     var distance = date_end.getTime() - date_creation.getTime();

  //     var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  //     var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //     var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  //     var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  //     timer.append(days + "d " + hours + "h "+ minutes + "m " + seconds + "s ");

  //     if (distance < 0) {
  //       clearInterval(x);
  //       //App.history.push(App.policies[]);
  //       //App.policies.pull()
  //       console.log(web3.eth.contract(abi).at(address));
  //       timer.append("the vote is over");
  //       $('form').hide();
  //     }
  //   })
  // }
};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});