abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "creator",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
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
    "name": "candidatesCount",
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
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
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
        "name": "voteCount",
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
    "name": "counter",
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
    "inputs": [
      {
        "name": "_name",
        "type": "string"
      },
      {
        "name": "_daysAfter",
        "type": "uint256"
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
        "name": "_candidateId",
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
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "countdown",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "winner",
    "outputs": [
      {
        "name": "winner",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  budgets: [],
  budget_count: 0,

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
    web3.eth.getCoinbase(function (err, account) { //turn off privacy mode for this to work with MetaMask
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    $.getJSON("BudgetCreator.json", function (budget) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.BudgetCreator = TruffleContract(budget);
      // Connect provider to interact with contract
      App.contracts.BudgetCreator.setProvider(App.web3Provider);

      App.listenForNewContract();

      return App.create_contract();
    });
  },

  create_contract: function () {
    $("#button-click").on("click", function () {
      App.contracts.BudgetCreator.deployed().then(function (instance) {
        instance.add_contract(/*document.getElementById('proposal_name').value, document.getElementById('proposal_description').value, new Date().toString(), document.getElementById('deadline').value*/);
        // App.listenForNewContract();
      });
    });
    //return App.get_data();
  },

  get_data: function () {
    var budget_creator;
    var budget_address;
    App.contracts.BudgetCreator.deployed().then(function (instance) {
      budget_creator = instance;
      return budget_creator.contract_count();
    }).then(function (count) {
      App.budget_count = count;
      for (var i = 0; i < count; i++) {
        budget_creator.budgets(i).then(function (address) {
          budget_address = address;
          return web3.eth.contract(abi).at(address);
        }).then(function (contract) {
          var data = []
          contract.name(function (error, result) {
            if (!error) { data.push(result); }
            else { console.log(error); }
          });
          contract.description(function (error, result) {
            if (!error) { data.push(result); }
            else { console.log(error); }
          });
          data.push(budget_address);
          contract.creation(function (error, result) {
            if (!error) { data.push(result); }
            else { console.log(error); }
          });
          contract.deadline(function (error, result) {
            if (!error) { data.push(result); }
            else { console.log(error); }
          });
          var push_data = setInterval(function () {
            if (data.length == 5) {
              App.budgets.push(data);
              clearInterval(push_data);
            }
          }, 1000);
        });
      }
    }).then(function () {
      var x = setInterval(function () {
        if (App.budgets.length == App.budget_count) {
          App.render();
          clearInterval(x);
        }
      }, 1000);
    });
  },

  render: function () {
    // var loader = $("#loader");
    // var content = $("#content");
    // var voted = $("#voted");
    var display = $("#display");
    for (var id = 0; id < App.budgets.length; id++) {

      var address = App.budgets[id][0];
      var name = App.budgets[id][1];
      var description = App.budgets[id][2];
      var creation_date = App.budgets[id][3];
      var deadline = App.budgets[id][4];

      var timer = "<p class=\"timer" + id + "\"> </p>";

      var header = "<div class=\"modal-header\"><h2 class=\"modal-title\">" + name + "</h2><button class=\"close\" type=\"button\" data-dismiss=\"modal\">x</button></div>"
      var outside = "<div class=\"p-3 mb-2 bg-light text-dark\"><h4><a href=\"#\" data-toggle=\"modal\" data-target=\"#" + "modal" + id + "\">" + name + "</a></h4>"+ timer + "</div>"

      var table = "<table class=\"table\"><thead><tr><th scope=\"col\">#</th><th scope=\"col\">Option</th><th scope=\"col\">Votes</th></tr></thead><tbody id=\"option_results" + id + "\"></tbody></table>"
      var button = "<button type=\"submit\" class=\"btn btn-primary\">Vote</button>"
      var form = "<form id=\"form" + id + "\" onSubmit=\"App.castVote(" + id + "); return false;\"><div class=\"form-group\"><label for=\"option_select" + id + "\">Select Option</label><select class=\"form-control\" id=\"option_select" + id + "\"></select></div>" + button + "<hr/></form>"
      var body = "<div class=\"modal-body\"><p>" + description + "</p>" + timer + table + form + "</div>"

      var budget_box = "<div class=\"col-sm-3\"><div class=\"container\"><div class=\"modal\" id=\"" + "modal" + id + "\"><div class=\"modal-dialog\"><div class=\"modal-content\">" + header + body + "</div></div></div>" + outside + "</div></div>";
      display.append(budget_box);
      App.countdown(new Date(creation_date), deadline, id);
      App.create_table(id);
    }

    // loader.show();
    // content.hide();
    // voted.hide();

    // Load account data

  },

  create_table: function (budget_id) {
    var budget;
    App.contracts.BudgetCreator.deployed().then(function (creator) {
      return creator.budgets(Number(budget_id));
    }).then(function (address) {
      return web3.eth.contract(abi).at(address);
    }).then(function (instance) {
      budget = instance;
      var option_results = $("#option_results" + budget_id)
      option_results.empty()
      var option_select = $("#option_select" + budget_id)
      option_select.empty()
      for (var i = 0; i < 2; i++) {
        instance.options(i, function (error, option) {
          if (!error) {
            var id = Number(option[0]) + 1;
            var name = option[1];
            var vote_count = option[2];

            var option_template = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + vote_count + "</td></tr>"
            option_results.append(option_template);

            var option_options = "<option value='" + id + "'>" + name + "</option"
            option_select.append(option_options);
          }
          else { console.log(error) }
        });
      }
      budget.voters(App.account, function (error, hasVoted) {
        if (!error) {
          if (hasVoted) {$("#form" + budget_id).hide();}
        }
        else { console.log(error) }
      });
    }).catch(function (error) {
      console.warn(error);
    });
  },

  castVote: function (budget_id) {
    var option_id = $("#option_select" + budget_id).val() - 1;
    App.contracts.BudgetCreator.deployed().then(function (creator) {
      return creator.budgets(Number(budget_id));
    }).then(function (address) {
      return web3.eth.contract(abi).at(address);
    }).then(function (budget) {
      budget.vote(option_id, function (error, result) {
        if (!error) {
          App.listenForNewVote(budget_id);
        }
        else { console.log(error) }
      });
    });
  },

  listenForNewContract: function () {
    var creator;
    App.contracts.BudgetCreator.deployed().then(function (instance) {
      creator = instance;
      instance.NewContract({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        $("#newbudget").modal('hide');
      });
      console.log(creator.last_sender.balance);
    });
  },

  listenForNewVote: function (budget_id) {
    App.contracts.BudgetCreator.deployed().then(function (creator) {
      return creator.budgets(Number(budget_id));
    }).then(function (address) {
      return web3.eth.contract(abi).at(address);
    }).then(function (budget) {
      budget.votedEvent({}, {
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        $("#modal" + budget_id).modal('hide');
        $("#display").empty();
        App.render();
        $("#modal" + budget_id).modal('show');
      });
    });
  },

  countdown: function (proposal_creation, deadline, id) {
    var timer = $(".timer" + id.toString());
    var end = new Date();
    end.setDate(proposal_creation.getDate() + Number(deadline));
    end.setHours(proposal_creation.getHours());
    end.setMinutes(proposal_creation.getMinutes());
    end.setSeconds(proposal_creation.getSeconds());
    var x = setInterval(function () {
      timer.empty();
      var now = new Date().getTime();
      var distance = end.getTime() - now;

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timer.append(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");

      if (distance < 0) {
        clearInterval(x);
        //App.history.push(App.budgets[]);
        //App.budgets.pull()
        timer.empty();
        timer.append("the vote is over");
        $('#form' + id).hide();
      }
    })
  }
};

$(function () {
  $(window).on('load', function () {
    App.init();
  });
});