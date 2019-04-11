/*
	For when a player says that he/she is ready for the next day
*/
const eventID = "ready";
module.exports = function(socket, server, game){
	socket.on("ready", function(data){
		let gameID = socket.user.gameID;
		let userID = socket.user.userID;
		let currentGame = game['games'][gameID];

		game.setNextLocation(socket.user.gameID, data['currentSpace'], data['currentCoords'], userID);
		server.trigger['server send updateFacilitator'](gameID);

	});
}