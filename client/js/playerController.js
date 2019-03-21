var PlayerController = function() 
{
  let scope = this;

  //open socket
  let socket = scope.socket = io();
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
});

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]}

PlayerController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;


    socket.on('facilitator broadcast', function(msg) {
      $('#messages').append($('<li>').text(msg));
    });

    socket.on('server send updateDay', function(d) {
       console.log(d);
       $('#day').text("Day: " + d['day']);
       $('#weathertext').text(weather[d['weather']][0]);
       $('#weatherimg').attr("src", "assets/" + weather[d['weather']][1] + ".png");

       var resources = d['resources'];

       $('#fuel').text(resources['fuel'] + " Fuel");
       $('#supplies').text(resources['supplies'] + " Supplies");
       $('#tires').text(resources['tires'] + " Spare Tires");
       $('#cash').text("$" + resources['cash'] + " Cash");
       $('#caves').text(resources['caves'] + " Caves");
       $('#turbo').text(resources['turbo'] + " Turbo Boost");
       $('#tents').text(resources['tents'] + " Tents");

       enableMove = true;
    });

  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    let socket = this.socket;

    var readyButton = document.getElementById("ready");
    readyButton.addEventListener('click', function(){
      console.log("currently in space " + curr_space);
      socket.emit('ready', 
         {currentSpace: curr_space}
      );
    });

    var instructionButton = document.getElementById("instructionblock");
    instructionButton.addEventListener('click', function(){
      alert("Instructions for players");
    });
  }
}
function ready() {
  var socket = io();
  socket.emit('ready');
}
