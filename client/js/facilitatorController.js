var FacilitatorController = function() 
{
  let scope = this;

  //open socket
  let socket = scope.socket = io();

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]}

FacilitatorController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;

    socket.on('new player connection', function(d){
      console.log('New player connected');
      $('#messages').append($('<li>').text(d["socketID"] + " has connected :)"));

      console.log(d); 
    });
    
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

    socket.on('updated player status', function(d) {
      console.log("updated player status");
      console.log(d);
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
      alert("Instructions for facilitator");
    });
  }

  
};