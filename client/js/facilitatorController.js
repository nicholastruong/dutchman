var FacilitatorController = function() 
{
  let scope = this;

  //open socket
  let socket = scope.socket = io();

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

    socket.on('new player connection', function(d){
      console.log('New player connected');
      name = "Team " + teamcount;
      playerNames[d["socketID"]] = name;
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
       sunits.setAttribute("id", "supplies" + teamcount);
       sunits.innerHTML = resources['supplies'];
       var frow = table.insertRow(2);
       var flabel = frow.insertCell(0);
       flabel.innerHTML = "Fuel";
       var funits = frow.insertCell(1);
       funits.setAttribute("id", "fuel" + teamcount);
       funits.innerHTML = resources['fuel'];
       var trow = table.insertRow(3);
       var tlabel = trow.insertCell(0);
       tlabel.innerHTML = "Tents";
       var tunits = trow.insertCell(1);
       tunits.setAttribute("id", "tents" + teamcount);
       tunits.innerHTML = resources['tents'];
       var brow = table.insertRow(4);
       var blabel = brow.insertCell(0);
       blabel.innerHTML = "Batteries";
       var bunits = brow.insertCell(1);
       bunits.setAttribute("id", "batteries" + teamcount);
       bunits.innerHTML = resources['batteries'];
       var strow = table.insertRow(5);
       var stlabel = strow.insertCell(0);
       stlabel.innerHTML = "Spare Tires";
       var stunits = strow.insertCell(1);
       stunits.setAttribute("id", "tires" + teamcount);
       stunits.innerHTML = resources['tires'];
       var crow = table.insertRow(6);
       var clabel = crow.insertCell(0);
       clabel.innerHTML = "Cash";
       var cunits = crow.insertCell(1);
       cunits.setAttribute("id", "cash" + teamcount);
       cunits.innerHTML = resources['cash'];
       var cvrow = table.insertRow(7);
       var cvlabel = cvrow.insertCell(0);
       cvlabel.innerHTML = "Caves";
       var cvunits = cvrow.insertCell(1);
       cvunits.setAttribute("id", "caves" + teamcount);
       cvunits.innerHTML = resources['caves'];
       var tbrow = table.insertRow(8);
       var tblabel = tbrow.insertCell(0);
       tblabel.innerHTML = "Turbo Boost";
       var tbunits = tbrow.insertCell(1);
       tbunits.setAttribute("id", "turbo" + teamcount);
       tbunits.innerHTML = resources['turbo'];
       teamcount++;

      console.log(d); 

      addNewBoardIcon(name)

    });
    
    socket.on('player ready', function(d){
      console.log(d);
      $('#messages').append($('<li>').text("Player is ready for the next day"));
      console.log("player is ready");
    });


    socket.on('facilitator weather report', function(d) {
       console.log(d);
       $('#day').text("Day: " + d['day']);

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
      console.log(d);

      for (player in d) {
        updateDestinations(playerNames[player], d[player]['location'], d[player]['coords'])
      }
    });

    socket.on('end game', function(d){
      $('#messages').append($('<li>').text("Game has ended"));
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

      customAlert("Instructions for facilitator");
    });
  }
  
};

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

