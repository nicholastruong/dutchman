/* tells facilitator that a player is ready */

const eventId = "server send updateFacilitator";
module.exports = function(server, game) {
	
	return {
		id: eventId,
		func: function(gameID) {
			let currentGame = game['games'][gameID];
			let facilitatorID = currentGame.facilitatorID;

			server.emit(facilitatorID, "player ready", {}, null);
		}
	};
	
};