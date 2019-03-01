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

  
});


PlayerController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;


    socket.on('chat message', function(msg) {
      console.log("hi");
    $('#messages').append($('<li>').text("test"));
    });

    socket.on('update day', function(d) {
      console.log(d);
      $('#day').text("Day: " + d['day']);
      $('#weather').text("Weather: " + d['weather']);
    });

    
      
  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    let socket = this.socket;

    var readyButton = document.getElementById("ready");
    readyButton.addEventListener('click', function(){
      socket.emit('ready');
    });
  }

  
};
