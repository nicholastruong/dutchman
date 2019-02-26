var fs = require("fs");
var path = require("path");
var mysql = require("mysql");

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//TODO (melanie) add game.js
const config = require("./config.js");  

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


app.use(express.static(__dirname + '/client')); // need to do this to give server access to all files in a folder

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/player.html');
});

app.get('/facilitator', function(req, res){
  res.sendFile(__dirname + '/client/facilitator.html');
});


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
