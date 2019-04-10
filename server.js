var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const fs = require("fs");
const path = require("path");
const mysql = require("mysql");

let db_config = {
	host: 'localhost',
	user: 'root',
	password: 'friend',
	database: 'lost_dutchman'
};

function mysqlConnect(onConnect)
{
	module.exports.db = mysql.createConnection(db_config);
	
	module.exports.db.connect(function(err) {
		if (err) {
			console.log("Error connecting to database: " + err);
			setTimeout(mysqlConnect, 2000, onConnect);
		} else {
			console.log("Connected to database...");
			if (onConnect !== undefined) onConnect();
		}
	});
	
	module.exports.db.on("error", function(err) {
		console.log("Database error: " + err);
		if (err.code == "PROTOCOL_CONNECTION_LOST") // connection lost, try reconnecting
		{
			mysqlConnect();
		}
		else
		{
			throw err; // unhandled mysql error
		}
	});
}

function onSqlConnect() {
	// Load the game state for all rooms from the database
	game.loadAll(function() {
		console.log("Loaded game states...")
	});	
	//TODO: fix this to actually pull from database

	console.log("oh goody we connected to the database");
}

mysqlConnect(onSqlConnect);

const config = require("./config.js")
var game = require("./game.js")(config);

http.listen(3000, function(){
  console.log('listening on *:3000');
});


app.use(express.static(__dirname + '/client')); // need to do this to give server access to all files in a folder

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/login.html');
});

app.get('/player', function(req, res){
  //let token = req.query.token;
  //TODO: redirect if bad
  res.sendFile(__dirname + '/client/player.html');
})

app.get('/facilitator', function(req, res){
  res.sendFile(__dirname + '/client/facilitator.html');
});

// Authenticate clients
var authenticatedUsers = module.exports.authenticatedUsers = {};
var openSockets = module.exports.openSockets = [];

io.use(function(socket, next)
{
	let noAuth = socket.handshake.query.noAuth !== undefined;
	let token = socket.handshake.query.token;

	if (noAuth) {
		return next(); // continue without authentication
	}
	else {
		socket.user = authenticatedUsers[token];
		//if (socket.user == undefined) { //TODO
			//return next(new Error("authenticationFailure"));
		//}
		//else {
		//	return next();
		//}
	}

	console.log("No auth" + noAuth); 
	return next();
});

io.on("connection", function(socket) {
	console.log("new connection socket ID: " + socket["id"]);
	if (socket.user != undefined) {
		let gameID = socket.user.gameID;
		let userID = socket.user.userID;
		let isFacilitator = socket.user.isFacilitator;

		openSockets[userID] = socket;
		socket.on("disconnect", function(reason) {
			openSockets[socket.user.id] = undefined;
		});

		//TODO: generate error if user connects to game late.
		game.onPlayerSocketConnect(socket);
		
		if (!isFacilitator){
			console.log("connection is NOT facilitator");

			let currentGame = game['games'][gameID];

			//TODO: implement better facilitator front end
			trigger['new player connection'](currentGame, userID); 
			trigger['update resources'](gameID, userID);

			// When a new player connects, update everyone else's co-location
			if (currentGame.day === 0) {
				let players = currentGame['players'];
				for (p in players) { 
					// "p" corresponds to user.id of player
					trigger['day zero'](p, game.getColocatedPlayers(gameID, p));
				}
			}
		}
		else { 
			//TODO: update facilitator with new method
		}	
	}
});

//load game state
game.loadAll(function() {
  console.log("Loaded game states...");
});


// Export an event emitting infrastructure
module.exports.emit = function(socketID, eventID, data, callback, isBroadcast)
{
	console.log(socketID);
	if (socketID){
		let socket = openSockets[socketID];
		socket.emit(eventID, data, callback);
	}
	
	//temporary broadcast if to no one
	else {
		io.emit(eventID, data);
	}
}

// Load events
var trigger = module.exports.trigger = {};
const outgoingEventsPath = "./events/outgoing";
const incomingEventsPath = "./events/incoming";

function loadEvents(path, outgoing)
{
	console.log("loading events");
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

					if (outgoing)
					{

						let outgoingEventModule = require(file)(module.exports, game);
						trigger[outgoingEventModule.id] = outgoingEventModule.func;
					}
					else // incoming
					{
						io.setMaxListeners(io.getMaxListeners() + 1);

						io.on("connection", function(socket) {
							require(file)(socket, module.exports, game, config);
						});
					}
				}
			}
		}
	});
}


loadEvents(outgoingEventsPath, true);
loadEvents(incomingEventsPath, false);