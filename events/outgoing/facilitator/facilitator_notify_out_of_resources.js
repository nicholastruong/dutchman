/* tells facilitator whomst is out of resources */

const eventID = "update server player out of resources";
module.exports = function(server, game) {
	return {
		id: eventID,
		func: function(gameID, playersOutOfResources) { //TODO: dont even need game ID, can get it ourselves via socket.user.gameID
			//array of players in the game
			let currentGame = game['games'][gameID];
			let facilitatorID = currentGame.facilitatorID;
			server.emit(facilitatorID, "out of resources", playersOutOfResources, null, true);
		}
	};
	
}