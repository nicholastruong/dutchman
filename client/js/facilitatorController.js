var FacilitatorController = function() 
{
  let scope = this;

  //open socket
  let socket = scope.socket = io();
  console.log(socket);

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic freeze": ["arctic freeze", "cold"]}

FacilitatorController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;
    
    socket.on('player ready', function(d){
      console.log(d['currentSpace']);
      $('#messages').append($('<li>').text("Player is ready for the next day"));
      console.log("player is ready");
    });

    socket.on('server send updateDay', function(d) {
       console.log(d);
       $('#day').text("Day: " + d['day']);
       $('#weathertext').text(weather[d['weather']][0]);
       $('#weatherimg').attr("src", "assets/" + weather[d['weather']][1] + ".png");
    }); 
  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    let socket = this.socket;

    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });

    var nextDayButton = document.getElementById("ready");
    nextDayButton.addEventListener('click', function(){
      socket.emit('facilitator next day');
    });

    var instructionButton = document.getElementById("instructionblock");
    instructionButton.addEventListener('click', function(){
      alert("Instructions for facilitator");
    });
  }

  
};