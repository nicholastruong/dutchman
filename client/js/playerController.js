var PlayerController = function() 
{
  let scope = this;

  //open socket
  let socket = scope.socket = io();
  console.log("hey look at my socket");
  console.log(socket);

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

$(document).ready(function(){
   console.log("documentReady called");

   $('#teamTradeModal')
      .on('show.bs.modal', function (e) {
         onModal = true;
      })
      .on('hidden.bs.modal', function (e) {
         onModal = false;
      });
   $('#provTradeModal')
      .on('show.bs.modal', function (e) {
         onModal = true;
      })
      .on('hidden.bs.modal', function (e) {
         onModal = false;
      });

   teamname = prompt("Enter a team name of less than 10 characters long:", "Team Awesome");
   if (teamname == null || teamname == "") {
      teamname = "Team null";
   } 
   if (teamname.length > 10) {
      teamname = teamname.substring(0, 10)
   }
   $('#team_name').text(teamname)

});

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]}
var teamname = ""

PlayerController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;

    /*
    // INFO: THIS IS TEMP CODE for testing trading backend (melanie)
    socket.on('connect', function(){
      var id = socket.io.engine.id
      let trade = {
        proposerID: id,
        targetID: id,
        offered_resources: {'fuel': 10},
        requested_resources: {'supplies': 10}
      };
      console.log(trade);
      socket.emit('player send tradeOffer', {trade: trade});
    });

    socket.on('server send giveTradeOffer', function(trade) {
      console.log("hey someone sent us a trade, that's kinda cool");
      console.log(trade);
      socket.emit('player send tradeResponse', {trade: trade, accepted: true});
    }); */


    socket.on('facilitator broadcast', function(msg) {
      $('#messages').append($('<li>').text(msg));
    });

    socket.on('server send updateDay', function(d) {
       console.log(d);
       $('#day').text("Day: " + d['day']);
       $('#weathertext').text(d['weather'][0]);
       $('#weatherimg').attr("src", "assets/" + weather[d['weather']][1] + ".png");
       //to find if canyon is flooded: d['weather'][1]
       var resources = d['resources'];


       $('#fuel').text(resources['fuel'] + " Fuel");
       $('#supplies').text(resources['supplies'] + " Supplies");
       $('#tires').text(resources['tires'] + " Spare Tires");
       $('#cash').text("$" + resources['cash'] + " Cash");
       $('#caves').text(resources['caves'] + " Caves");
       $('#turbo').text(resources['turbo'] + " Turbo Boost");
       $('#tents').text(resources['tents'] + " Tents");

       enableMove = true;
       $('#readybutton').prop('disabled', false);

    });

  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    let socket = this.socket;

    var readyButton = document.getElementById("ready");
    readyButton.addEventListener('click', function(){
      var reallyReady = false;
      if (!enableMove) {
         reallyReady = true;
      }
      else {
         if (curr_space == 0 && confirm("Are you sure you want to stay in Apache Junction for another day?")) {
            reallyReady = true;
         }
         if (curr_space == 20 && confirm("Are you sure you want to stay in the Lost Dutchman Goldmine?")) {
            reallyReady = true;
         }
         if (curr_space != 0 && curr_space != 20 && confirm("Are you sure you want to stay in the same space?")) {
            reallyReady = true;
         }
      }

      if (reallyReady) {
         $('#readybutton').prop('disabled', true)
         enableMove = false;
         socket.emit('ready', 
            {
               currentSpace: curr_space,
               currentCoords: [car.x, car.y]
            }
         ); 
      }
    });

    var instructionButton = document.getElementById("instructionblock");
    instructionButton.addEventListener('click', function(){
      alert("Instructions for players");
    });
  }
}
