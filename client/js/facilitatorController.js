$(function () {
  var socket = io();

  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  
  socket.on('player ready', function(){
    $('#messages').append($('<li>').text("Player is ready for the next day"));
  });
  
  socket.on('update day', function(d){
    console.log(d);
    $('#day').text("Day: " + d['day']);
    $('#weather').text("Weather: " + d['weather']);
  });
});

function nextDay() {
  var socket = io();
  socket.emit('next day');
}