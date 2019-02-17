var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var facilitatorID;
var openSockets = [];
var day = 1;
var ids = 0;
var weather = {
	1: 'sunny',
	2: 'sunny',
	3: 'rainy',
	4: 'sunny',
	5: 'rainy',
	6: 'arctic freeze',
	7: 'sunny',
	8: 'rainy',
	9: 'sunny',
	10: 'rainy',
	11: 'sunny',
	12: 'sunny',
	13: 'rainy',
	14: 'sunny',
	15: 'rainy'
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/player.html');
});

app.get('/facilitator', function(req, res){
  res.sendFile(__dirname + '/client/facilitator.html');
});

app.get('/gameboard', function(req, res){
  res.sendFile(__dirname + '/phaser_test/gameboard.html');
});
app.get('/phaser_test/init_gameboard.js', function(req, res){
  res.sendFile(__dirname + '/phaser_test/init_gameboard.js');
});
app.get('/phaser_test/phaser.min.js', function(req, res){
  res.sendFile(__dirname + '/phaser_test/phaser.min.js');
});
app.get('/phaser_test/assets/gameboard.png', function(req, res){
  res.sendFile(__dirname + '/phaser_test/assets/gameboard.png');
});
app.get('/phaser_test/assets/team_icon.png', function(req, res){
  res.sendFile(__dirname + '/phaser_test/assets/team_icon.png');
})


io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.handshake.headers.referer);
  if (socket.handshake.headers.referer === "http://localhost:3000/"){
  	socket.playerID = ++ids;
  	socket.join('players');
  }
  else {
  	socket.playerID = ++ids;
  	facilitatorID = socket.id;
  	socket.join('facilitator');
  }

  openSockets.push(socket);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
  	console.log('message: ' + msg);
    io.to('players').emit('chat message', msg);
  });

  socket.on('next day', function(){
  	day++;
  	console.log('next day' + day);
  	io.emit('update day', {
  		day: day,
  		weather: weather[day] 
  	});
  });

  socket.on('ready', function(){
  	io.to('facilitator').emit('player ready');
  });

});

