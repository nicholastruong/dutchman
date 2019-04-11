/*
	For when a player gets the cave
*/

const eventID = "add cave";
module.exports = function(socket, server, game){
	socket.on("add cave", function(data){
		let gameID = socket.user.gameID;
		let userID = socket.user.userID;
		
		game.addResource(gameID, userID, "cave");
		server.trigger['update resources'](gameID, userID);
		// server.trigger['server send updateFacilitator']();
	});
}