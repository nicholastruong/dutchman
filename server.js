var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const crypto = require("crypto"); //TODO: remove

let db_config = {
	host: 'localhost',
	user: 'root',
	password: 'root',
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
	/*game.loadAll(function() {
		console.log("Loaded game states...")
	});	*/

	var salt = crypto.randomFillSync(Buffer.alloc(8)).toString("hex");
	var password = crypto.createHash("sha256");
	password.update("password" + salt);
	console.log("salt: " + salt);
	console.log(password.digest("hex"));

	console.log("oh goody we connected to the database");
}

mysqlConnect(onSqlConnect);

var openSockets = {};

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
		console.log("authenticated user: ");
		console.log(socket.user);
		//if (socket.user == undefined) {
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
	//console.log(socket.handshake.headers.referer);
	let gameID = 0; //HARDODED
	console.log("new connection !");
	console.log("socket ID: " + socket["id"]);
	if (socket.user != undefined) {
		openSockets[socket["id"]] = socket;
		var isFacilitator = socket.user.isFacilitator;

		game.updateSockets(gameID, socket, isFacilitator);
		
		if (!isFacilitator){
			console.log("connection is NOT facilitator");
			trigger['new player connection'](game, socket["id"]);

			// used to send initial grubstake to connecting player on day 1
			let currentGame = game['games']['0'];
			let players = currentGame['players'];
			let currentLocation = players[socket["id"]]['currentLocation'];
			trigger['update resources'](socket['id']);
			trigger['server send updateDay'](
				socket["id"], 
				game.getWeather(currentLocation, currentGame['day']), 
				currentGame['day'],
				game.getColocatedPlayers(gameID, socket["id"])
			);	
			
		}	
	}
});

//load game state
//TODO: load mysql
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