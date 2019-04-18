var addResourceObject = {
  "supplies": 0,
  "fuel": 0,
  "tents": 0,
  "batteries": 0,
  "tires": 0,
  "cash": 0,
  "caves": 0,
  "turbo": 0,
  "gold": 0
}

var FacilitatorController = function() 
{
  let scope = this;

  //open socket
  console.log(getUrlVars());
  let token = getUrlVars()['token'];

  let socket = scope.socket = io(document.location.hostname + ":3000?token=" + token);
  if (socket['connected'] == false) {
    //window.location.href = '/';
  }

  console.log('socket is ' + socket);

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]}

var playerNames = {};
var readyPlayers = 0;
var numPlayers = 0;

var endGameAlert;
var socket;

window.onload = function() {
  window.controller = new FacilitatorController();
  $("#addResourcesModal").load("addResourceModal.html");
  $("#addResourcesModal").modal('hide');

  $("#endGamesModal").load("endGameModal.html");
  $("#endGamesModal").modal('hide');
}

$(document).ready(function(){
  console.log("documentReady called");
  $('#addResourcesModal')
    .on('show.bs.modal', function (e) {
      console.log("onModal is true from addResourcesModal");
      onModal = true;
    })
    .on('hidden.bs.modal', function (e) {
      console.log("onModal is false from addResourcesModal");
      onModal = false;
    });

  $('#endGamesModal')
    .on('show.bs.modal', function (e) {
      console.log("onModal is true from endGameModal");
      onModal = true;
    })
    .on('hidden.bs.modal', function (e) {
      console.log("onModal is false from endGameModal");
      onModal = false;
    });

});


FacilitatorController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;


    socket.on('disconnect', function() {
      console.log("i have disconnected");
      window.location.href = '/';
    });


    socket.on('new player connection', function(d){
      console.log('New player connected');
      name = d['username'];
      playerNames[d['userID']] = name;

      var date = new Date();
      var time = date.getHours() + ":" + date.getMinutes() + " : ";

      $('#messages').append($('<li>').text(time + name + " has connected."));
      scrollToBottom();

      generateTeamTable(name, d['resources']);

      console.log(d); 

      addNewBoardIcon(name);
      numPlayers++;
    });
    
    socket.on('player ready', function(d){
      // console.log(d);
      var date = new Date();
      var time = date.getHours() + ":" + date.getMinutes() + " : ";

      if ($("#day").text() == "Planning Period") {
        $('#messages').append($('<li>').text(time + "Team " + d['username'] + " is ready to begin the game"));
      }
      else {
        $('#messages').append($('<li>').text(time + "Team " + d['username'] + " is ready for the next day"));
      } 
      
      scrollToBottom();

      readyPlayers++;
      console.log(readyPlayers + " are ready out of " + numPlayers);
      if (readyPlayers >= numPlayers) {
        if ($("#day").text() == "Planning Period") {
          customAlert("All players are ready to begin the game!");
        }
        else {
          customAlert("All players are ready for the next day!");
        }
      }

    });


    socket.on('facilitator weather report', function(d) {
       console.log(d);
       $('#day').text("Day: " + d['day']);
       if (d['day'] >= 1) {
         $(".weather").attr("hidden", false);
         $("#canyonstatus").attr("hidden", false);
         $("#readybutton").text("Start Next Day");
       }

       if (d['weather'] != undefined) {
         updateWeather(d['weather']);
       }
    }); 

    socket.on('updated player status', function(d) {
      console.log("updated player status");

      var date = new Date();
      var time = date.getHours() + ":" + date.getMinutes() + " : ";


      //if first time loading table:
      if (d['isFirstTime']) {
        for (userID in d['players']) {
          name = d['players'][userID]['username'];
          generateTeamTable(name, d['players'][userID]['resources']);
          playerNames[userID] = name;
          $('#messages').append($('<li>').text(time + name + " has connected."));
          scrollToBottom();
          addNewBoardIcon(name);
        }
      }
      else {
        for (userID in d['players']) {
          updateDestinations(playerNames[userID], d['players'][userID]['location'])
          updateResources(playerNames[userID], d['players'][userID]['resources']);
        }
      }
      
    });

    socket.on('end game', function(d){
      endGame();
    });

    socket.on('out of resources', function(d) {
      var date = new Date();
      var time = date.getHours() + ":" + date.getMinutes() + " : ";
      console.log(d);

      for (player in d){
        customAlert("Team " + playerNames[d[player]] + " is out of resources and is stuck!")
        // $('#messages').append($('<li>').text(time + player + " is out of resources"));
        // $('#messages').append($('<li>').text("Adding more resources to " + player + "'s inventory"));

        // scrollToBottom();

      }
    });

    socket.on('update player resource', function(d) {
      updateResources(playerNames[d['userID']], d['resources']);
    });

  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    let socket = this.socket;

    $('form').submit(function(e){
      var date = new Date();
      var time = date.getHours() + ":" + date.getMinutes() + " : ";

      e.preventDefault(); // prevents page reloading
      socket.emit('facilitator send broadcast', $('#m').val());
      $('#messages').append($('<li>').text(time + $('#m').val()));  
      $('#m').val('');

      scrollToBottom();
          
      return false;
    });

    var nextDayButton = document.getElementById("readybutton");
    nextDayButton.addEventListener('click', function(){
      readyPlayers = 0;
      socket.emit('facilitator next day'); 
    });

    var instructionButton = document.getElementById("instructionblock");
    instructionButton.addEventListener('click', function(){
      // alert("Instructions for facilitator");

      customAlert("Instructions for Facilitator</p> - Click any game space to find out which teams" + 
        " are currently located there.</p> - Send messages to all the teams by using the dialog in" + 
        " the bottom right.</p> - View the resources of all the teams in the window on the left.</p>" +
        " - Press the 'Start Next Day' to advance the game for all the teams when they are ready.");
    });

    // endGameAlert = bootbox.dialog({
    //   message: "You have reached the end of the game!",
    //   title: '',
    //   backdrop: true,
    //   onEscape: true,
    //   buttons: {
    //      ok: {
    //         label: "Okay",
    //         className: 'alertButton',
    //         callback: function(){
    //            endGameAlert.modal("hide");
    //            socket.emit('reset game'); // called on endgame
    //            resetGame();
    //         }
    //      },
    //   },
    //   show: false
    // });
  }


  
};


function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function generateTeamTable(name, resources){
  var newtable = document.createElement("TABLE");
  newtable.setAttribute("id", "teamtable");
  document.getElementById("resourceblock").appendChild(newtable);

   var table = document.getElementById("teamtable");
   var row = table.insertRow(0);
   var cell1 = row.insertCell(0);
   cell1.innerHTML = name;
   cell1.setAttribute("style","font-size:1.75vw; font-weight: bold; background-color: #492300;");
  
   var cell2 = row.insertCell(1);
   cell2.innerHTML = `<button id="rescue_button" type="button" class="refresher btn btn-light">Help Team</button>`;
   cell2.setAttribute("style","text-align:center;");
   cell2.onclick = function(){
     addTeamResources(name, resources);
   }
  
   var srow = table.insertRow(1);
   var slabel = srow.insertCell(0);
   slabel.innerHTML = "Supplies";
   var sunits = srow.insertCell(1);
   sunits.setAttribute("id", "supplies" + name);
   sunits.innerHTML = resources['supplies'];
   var frow = table.insertRow(2);
   var flabel = frow.insertCell(0);
   flabel.innerHTML = "Fuel";
   var funits = frow.insertCell(1);
   funits.setAttribute("id", "fuel" + name);
   funits.innerHTML = resources['fuel'];
   var trow = table.insertRow(3);
   var tlabel = trow.insertCell(0);
   tlabel.innerHTML = "Tents";
   var tunits = trow.insertCell(1);
   tunits.setAttribute("id", "tents" + name);
   tunits.innerHTML = resources['tents'];
   var brow = table.insertRow(4);
   var blabel = brow.insertCell(0);
   blabel.innerHTML = "Batteries";
   var bunits = brow.insertCell(1);
   bunits.setAttribute("id", "batteries" + name);
   bunits.innerHTML = resources['batteries'];
   var strow = table.insertRow(5);
   var stlabel = strow.insertCell(0);
   stlabel.innerHTML = "Spare Tires";
   var stunits = strow.insertCell(1);
   stunits.setAttribute("id", "tires" + name);
   stunits.innerHTML = resources['tires'];
   var grow = table.insertRow(6);
   var glabel = grow.insertCell(0);
   glabel.innerHTML = "Gold";
   var gunits = grow.insertCell(1);
   gunits.setAttribute("id", "gold" + name);
   gunits.innerHTML = resources['gold'];
   var crow = table.insertRow(7);
   var clabel = crow.insertCell(0);
   clabel.innerHTML = "Cash";
   var cunits = crow.insertCell(1);
   cunits.setAttribute("id", "cash" + name);
   cunits.innerHTML = resources['cash'];
   var cvrow = table.insertRow(8);
   var cvlabel = cvrow.insertCell(0);
   cvlabel.innerHTML = "Caves";
   var cvunits = cvrow.insertCell(1);
   cvunits.setAttribute("id", "caves" + name);
   cvunits.innerHTML = resources['caves'];
   var tbrow = table.insertRow(9);
   var tblabel = tbrow.insertCell(0);
   tblabel.innerHTML = "Turbo Boost";
   var tbunits = tbrow.insertCell(1);
   tbunits.setAttribute("id", "turbo" + name);
   tbunits.innerHTML = resources['turbo'];
}


function addTeamResources(name, resources){

  Object.keys(addResourceObject).forEach(v => myObj[v] = 0);

  if ( document.getElementById("teamResourceTitle") != null){
    document.getElementById("teamResourceTitle").innerHTML = "Team " + name;
  }

  var table = `<thead>
              <tr>
                <th scope="col">Resources</th>
                <th class = "colorCol" scope="col">Amount</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>`
            
    for (let r in resources) {
            table += `<tr>
            <th scope="row">
            `
            table += String(r);// resourceName
            table += `</th><td class = "colorCol" id = "addResource-` + String(r) + `">`
            table += String(resources[r]);//amount
            table += `</td>`
            table += `<td><button type="button" class="btn btn-light" onClick = "addItem('`;
            table += String(r);
            table += "','";
            table += String(r);
            table +=`')">+</button></td>
            <td><button type="button" class="btn btn-light" onClick = "subtractItem('`;
            table += String(r);
            table += "','";
            table+= String(r);
            table+=`')">-</button></td>`
            this.addResourceObject[String(r)] = resources[r];
    }
    console.log(this.addResourceObject);

    table += `</tbody>`

  document.getElementById("addResourceTable").innerHTML = table;
  $('#addResourceModal').modal('show');
}

function addResources(){
  let socket = window.controller.socket;
  var name = document.getElementById("teamResourceTitle").innerText;
  name = name.slice(5);
  var carePackage = {
    team : name,
    resources : this.addResourceObject
  }
  socket.emit('beacon', carePackage);
  $('#addResourceModal').modal('hide');
};

function subtractItem(resources){
  document.getElementById("addResource-" + resources).textContent--;
  this.addResourceObject[resources]--;
}
function addItem(resources){
  document.getElementById("addResource-" + resources).textContent++;
  this.addResourceObject[resources]++;
}



function customAlert(message) {
   alertBox = bootbox.dialog({
      message: message,
      title: '',
      backdrop: true,
      onEscape: true,
      buttons: {
         ok: {
            label: "Okay",
            className: 'alertButton'
            // callback: function(){
            //    alertBox.modal("hide");
            // }
         },
      },
      show: false
   });

   alertBox.on('hidden.bs.modal', function () {
      onModal = false;
      console.log("onModal is false");
   });

   onModal = true;
   console.log("onModal is true");
   alertBox.modal('show');
};


function updateWeather(weatherData) {
  $('#lowweathertext').text(weatherData['low']); 
  $('#lowweatherimg').attr("src", "assets/weather/" + weather[weatherData['low']][1] + ".png");

  $('#highweathertext').text(weatherData['high']);
  $('#highweatherimg').attr("src", "assets/weather/" + weather[weatherData['high']][1] + ".png");

  $('#canyonstatus').text("Canyon is " + weatherData['canyon']);
  floodCanyon(weatherData['canyon'] == "flooded");
}

function updateResources(teamname, resources) {
    //console.log("update " + teamname + " resources " + resources['supplies'] + resources['fuel']);
    var supplies = document.getElementById('supplies' + teamname);
    supplies.innerHTML = resources['supplies'];
    var fuel = document.getElementById('fuel' + teamname);
    fuel.innerHTML = resources['fuel'];
    var tents = document.getElementById('tents' + teamname);
    tents.innerHTML = resources['tents'];
    var batteries = document.getElementById('batteries' + teamname);
    batteries.innerHTML = resources['batteries'];
    var tires = document.getElementById('tires' + teamname);
    tires.innerHTML = resources['tires'];
    var cash = document.getElementById('cash' + teamname);
    cash.innerHTML = resources['cash'];
    var caves = document.getElementById('caves' + teamname);
    caves.innerHTML = resources['caves'];
    var turbo = document.getElementById('turbo' + teamname);
    turbo.innerHTML = resources['turbo'];
    var gold = document.getElementById('gold' + teamname);
    gold.innerHTML = resources['gold'];
}

function scrollToBottom() {
   var message = document.getElementById('messages');
   message.scrollTop = message.scrollHeight;
}


function endGame() {
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + " : ";
  $('#messages').append($('<li>').text(time + "Game has ended"));
  scrollToBottom();

  // show endGameAlert
  // endGameAlert.modal('show');
}

function resetGame() {
  onModal = false;
  $("#messages").empty();
  $(".weather").attr("hidden", true);
  $("#canyonstatus").attr("hidden", true);
  $("#readybutton").text("Start Game");
  $("#day").text("Planning Period");
  $("#resourceblock").empty();
  $("#board").empty();

  resetGameBoard();
}

