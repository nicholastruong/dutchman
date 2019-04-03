/* tells facilitator whomst is out of resources */

const eventID = "update server player out of resources";
module.exports = function(socket, server, game, config) {
	
	return {
		id: eventID,
		func: function(server, game, playersOutOfResources) {
			//array of players in the game
			let currentGame = game['games']['0'];
			let facilitatorID = currentGame.facilitatorID;
			server.emit(facilitatorID, "out of resources", playersOutOfResources, null, true);

		}
	};
	
};