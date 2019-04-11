/* tells facilitator status of all the players on a new day */

const eventId = "server update player states";
module.exports = function(server, game) {
	return {
		id: eventId,
		func: function(gameID, isFirstTime) {
			//array of players in the game
			let currentGame = game['games'][gameID];
			let facilitatorID = currentGame.facilitatorID;
			let players = currentGame['players'];
			
			var update = {};

			//notifies if this is when facilitator logs on for first time or not
			update['isFirstTime'] = isFirstTime;

			//object of all players and resources
			var playerStatuses = {};

			for (playerID in players) {

				playerStatuses[playerID] = {
					username : players[playerID].username,
					location : players[playerID]['currentLocation'],
					resources : players[playerID]['resources']
				}
				
				
			}

			update['players'] = playerStatuses;

			server.emit(facilitatorID, "updated player status", update, null);
		}
	};
	
};