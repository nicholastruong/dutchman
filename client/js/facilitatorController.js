weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic freeze": ["arctic freeze", "cold"]}

$(function () {
  var socket = io();

  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#messages').append($('<li>').text($('#m').val()));
    $('#m').val('');
    return false;
  });
  
  socket.on('player ready', function(){
    $('#messages').append($('<li>').text("Player is ready for the next day"));
  });
  
  socket.on('update day', function(d){
    console.log(d);
    $('#day').text("Day: " + d['day']);
    $('#weathertext').text(weather[d['weather']][0]);
    $('#weatherimg').attr("src", "assets/" + weather[d['weather']][1] + ".png");
  });
});

function nextDay() {
  var socket = io();
  socket.emit('next day');
}