var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const fs = require("fs");
const path = require("path");

var facilitatorID;
var openSockets = {};

const config = require("./config.js")
const game = require("./game.js")(config);

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

// Authenticate clients
var openSockets = module.exports.openSockets = [];

io.on("connection", function(socket) {
	console.log(socket.handshake.headers.referer);
	console.log(socket["id"]);
	openSockets[socket["id"]] = socket;

	//hacky way of getting facilitator rn
	if (socket.handshake.headers.referer !== "http://localhost:3000/"){
		facilitatorID = socket["id"];
		console.log(openSockets[facilitatorID]);
	}
	
});

//load game state
//TODO: load mysql
game.loadAll(function() {
  console.log("Loaded game states...");
});


// Export an event emitting infrastructure
module.exports.emit = function(isFacilitator, eventID, data, callback)
{
	console.log(facilitatorID);
	if (isFacilitator){
		let socket = openSockets[facilitatorID];
		socket.emit(eventID, data, callback);
	}
	/*
	if (socket)
	{
		socket.emit(eventID, data, callback);
	}*/

	//temporary broadcast if not facilitator
	else {
		io.emit(eventID);
	}
}

// Load events
var trigger = module.exports.trigger = {};
const outgoingEventsPath = "./events/outgoing";
const incomingEventsPath = "./events/incoming";

function loadEvents(path, outgoing)
{
	fs.readdir(path, function(err, files) {
		if (err) {
			console.error("Error loading events: " + err.stack); // non-fatal
		} else {
			for (var i in files)
			{
				let file = path + "/" + files[i];				
				if (fs.statSync(file).isDirectory())
				{ // recursively search the subdirectory
					loadEvents(file, outgoing);
				}
				else if (file.endsWith(".js"))
				{ // it is a JS file

					console.log(outgoing);
					if (outgoing)
					{

						console.log(file);
						let outgoingEventModule = require(file)(module.exports);
						trigger[outgoingEventModule.id] = outgoingEventModule.func;
					}
					else // incoming
					{
						io.setMaxListeners(io.getMaxListeners() + 1);

						io.on("connection", function(socket) {
							require(file)(socket, module.exports);
						});
					}
				}
			}
		}
	});
}

loadEvents(outgoingEventsPath, true);
loadEvents(incomingEventsPath, false);


