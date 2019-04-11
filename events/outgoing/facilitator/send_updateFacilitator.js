/* tells facilitator that a player is ready */

const eventId = "server send updateFacilitator";
module.exports = function(server, game) {
	
	return {
		id: eventId,
		func: function(gameID, userID) {
			let currentGame = game['games'][gameID];
			let facilitatorID = currentGame.facilitatorID;

			let username = server.openSockets[userID].user.username; 

			server.emit(facilitatorID, "player ready", {username: username}, null);
		}
	};
	
};