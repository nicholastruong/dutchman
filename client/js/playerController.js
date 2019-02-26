$(document).ready(function(){
   console.log("documentReady called");

   $('#ready').click(ready());
});

$(function () {
  var socket = io();

  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('update day', function(d) {
    console.log(d);
    $('#day').text("Day: " + d['day']);
    $('#weather').text("Weather: " + d['weather']);
  });
});

function ready() {
  var socket = io();
  socket.emit('ready');
}