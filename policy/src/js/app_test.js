abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "creation",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "deadline",
    "outputs": [
      {
        "name": "",
        "type": "string"
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
    "inputs": [],
    "name": "description",
    "outputs": [
      {
        "name": "",
        "type": "string"
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
    "inputs": [
      {
        "name": "_name",
        "type": "string"
      },
      {
        "name": "_description",
        "type": "string"
      },
      {
        "name": "_creation",
        "type": "string"
      },
      {
        "name": "_deadline",
        "type": "string"
      }
    ],
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
  }
];

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  policies: [],

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

  create_contract: function () {
    $("#button-click").on("click", function () {
      App.contracts.PolicyCreator.deployed().then(function (instance) {
        //passes info to the policy creator contract 
        instance.add_contract(document.getElementById('proposal_name').value, document.getElementById('proposal_description').value, new Date().toString(), document.getElementById('deadline').value);
      });
    });
    return App.render();
  },

  get_data: function () {
    var policy_creator;
    var policy_address; 
    App.contracts.PolicyCreator.deployed().then(function (instance) {
      policy_creator = instance;
      return policy_creator.contract_count();
    }).then(function (count) {
      for (var i = 0; i < count; i++) {
        //for each policy in the contract count, retrieve the policy and get the data to push into a javascript array 
        //would it be better if we just went from blockchain straight to display?
        //or should we get from blockchain, to js array, and then to display 

        policy_creator.policies(i).then(function (address) {
          policy_address = address;
          return web3.eth.contract(abi).at(address);
        }).then(function (contract) {
          var data = []
          contract.name(function (error, result) {
            if (!error) { data.push(result); }
            else {console.log(error); }
          });
          contract.description(function(error, result) {
            if(!error) {data.push(result);}
            else {console.log(error);}
          });
          data.push(policy_address);
          contract.creation(function(error, result) {
            if(!error) {data.push(result);}
            else {console.log(error);}
          });
          contract.deadline(function(error, result) {
            if(!error) {data.push(result);}
            else {console.log(error);}
          });
          App.policies.push(data);
        });
      }
    });
  },


  render: function () {
    // var loader = $("#loader");
    // var content = $("#content");
    // var voted = $("#voted");
    // var timer = $("#timer");
    var display = $("#display");

    App.get_data();

    console.log(App.policies.length);
    //a problem i encountered was that the js array was still registering as having a length of 0 even after pushing data into it 
    //this is bc of latency 
    //this set interval function was meant to prevent the rest of the function from running before the length registered to at least be greater
    //than 0. but, this falls apart when there is more than one proposal because it will clear the interval for the 1st contract but continue
    //running without the data from the other proposals.
    
    var x = setInterval(function() {
      if(App.policies.length > 0) {
        clearInterval(x);
        for (var id = 0; id < App.policies.length; id++) {
          console.log(App.policies[id]);
          var policy_name = "Test";
          var policy_time = "x";
          var policy_box = "<div class=\"col-sm-3\"> <div class=\"container\"> <div class=\"modal\" id=\"mymodal\"> <div class=\"modal-dialog\"> <div class=\"modal-content\"> <div class=\"modal-header\"> <h2 class=\"modal-title\">" + policy_name + "</h2> <button class=\"close\" type=\"button\" data-dismiss=\"modal\">x</button> </div> <div class=\"modal-body\"> <p> Proposal Information</p> </div> </div> </div> </div> <div class=\"p-3 mb-2 bg-light text-dark\"> <h4 id=\"name\"><a href=\"#\" data-toggle=\"modal\" data-target=\"#mymodal\">" + policy_name + "</a></h4> Submitted " + policy_time + " days ago </div> </div> </div>";
          display.append(policy_box);
        }
      }
    });

    // loader.show();
    // content.hide();
    // voted.hide();
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
        $("#newpolicy").modal('hide');
      });
    });
  },

  countdown: function (proposal_creation, deadline) {
    var end = new Date();
    end.setDate(proposal_creation.getDate() + Number(deadline));
    var x = setInterval(function () {
      // if(timer.hasChildNodes()) {}
      var now = new Date().getTime();
      var distance = end.getTime() - now;

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timer.append(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");

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
  $(window).on('load', function () {
    App.init();
  });
});