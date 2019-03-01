$(document).ready(function(){
   console.log("documentReady called");

   $('#ready').click(ready());
});

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic freeze": ["arctic freeze", "cold"]}

$(function () {
  var socket = io();

  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('update day', function(d) {
    console.log(d);
    $('#day').text("Day: " + d['day']);
    $('#weathertext').text(weather[d['weather']][0]);
    $('#weatherimg').attr("src", "assets/" + weather[d['weather']][1] + ".png");
  });
});

function ready() {
  var socket = io();
  socket.emit('ready');
}