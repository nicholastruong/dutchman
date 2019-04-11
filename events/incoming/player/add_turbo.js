/*
	For when a player gets the turbo
*/

const eventID = "add turbo";
module.exports = function(socket, server, game){
	socket.on("add turbo", function(data){
		let gameID = socket.user.gameID;
		let userID = socket.user.userID;

		game.addResource(gameID, userID, "turbo");
		server.trigger['update resources'](gameID, userID);
		// server.trigger['server send updateFacilitator']();

	});
}