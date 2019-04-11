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


  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]}

var playerNames = {};

$(document).ready(function(){
   console.log("documentReady called");

});

FacilitatorController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;
    var teamcount = 1;

    socket.on('disconnect', function() {
      console.log("i have disconnected");
      window.location.href = '/';
    });


    socket.on('new player connection', function(d){
      console.log('New player connected');
      name = "Team " + d['username'];
      playerNames[d['username']] = name;
      $('#messages').append($('<li>').text(name + " has connected :)"));

      var resources = d['resources'];

      var newtable = document.createElement("TABLE");
      newtable.setAttribute("id", "teamtable");
      document.getElementById("resourceblock").appendChild(newtable);

       var table = document.getElementById("teamtable");
       var row = table.insertRow(0);
       var cell1 = row.insertCell(0);
       cell1.innerHTML = name;
       cell1.setAttribute("style","font-size:1.75vw; font-weight: bold; background-color: #492300;");
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
       var crow = table.insertRow(6);
       var clabel = crow.insertCell(0);
       clabel.innerHTML = "Cash";
       var cunits = crow.insertCell(1);
       cunits.setAttribute("id", "cash" + name);
       cunits.innerHTML = resources['cash'];
       var cvrow = table.insertRow(7);
       var cvlabel = cvrow.insertCell(0);
       cvlabel.innerHTML = "Caves";
       var cvunits = cvrow.insertCell(1);
       cvunits.setAttribute("id", "caves" + name);
       cvunits.innerHTML = resources['caves'];
       var tbrow = table.insertRow(8);
       var tblabel = tbrow.insertCell(0);
       tblabel.innerHTML = "Turbo Boost";
       var tbunits = tbrow.insertCell(1);
       tbunits.setAttribute("id", "turbo" + name);
       tbunits.innerHTML = resources['turbo'];
       var grow = table.insertRow(9);
       var glabel = grow.insertCell(0);
       glabel.innerHTML = "Gold";
       var gunits = grow.insertCell(1);
       gunits.setAttribute("id", "gold" + name);
       gunits.innerHTML = resources['gold'];
       teamcount++;

      console.log(d); 

      addNewBoardIcon(name)

    });
    
    socket.on('player ready', function(d){
      console.log(d);
      if ($("#day").text() == "Planning Period") {
        $('#messages').append($('<li>').text("Team " + d['username'] + " is ready to begin the game"));
      }
      else {
        $('#messages').append($('<li>').text("Team " + d['username'] + " is ready for the next day"));
      } 
      // console.log("player is ready");

    });


    socket.on('facilitator weather report', function(d) {
       console.log(d);
       $('#day').text("Day: " + d['day']);
       if (d['day'] == 1) {
         $(".weather").attr("hidden", false);
         $("#canyonstatus").attr("hidden", false);
       }

       $('#lowweathertext').text(d['weather']['low']); 
       $('#lowweatherimg').attr("src", "assets/weather/" + weather[d['weather']['low']][1] + ".png");
       
       $('#highweathertext').text(d['weather']['high']);
       $('#highweatherimg').attr("src", "assets/weather/" + weather[d['weather']['high']][1] + ".png");

       $('#canyonstatus').text("Canyon is " + d['weather']['canyon']);
       if (d['weather']['canyon'] == "flooded") {
         makeMuddy(true);
       }
       else {
         makeMuddy(false);
       }
    }); 

    socket.on('updated player status', function(d) {
      console.log("updated player status");

      for (player in d) {
        updateDestinations(playerNames[player], d[player]['location'])
        updateResources(playerNames[player], d[player]['resources']);
      }
    });

    socket.on('end game', function(d){
      $('#messages').append($('<li>').text("Game has ended"));
    });

    socket.on('out of resources', function(d) {
      for (player in d){
        $('#messages').append($('<li>').text(player + " is out of resources"));
      }
    });

  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    let socket = this.socket;

    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('facilitator send broadcast', $('#m').val());
      $('#messages').append($('<li>').text($('#m').val()));  
      $('#m').val('');
          
      return false;
    });

    var nextDayButton = document.getElementById("ready");
    nextDayButton.addEventListener('click', function(){
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
  }
  
};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
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

