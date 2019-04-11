//sends updates to of next day to all the clients

const eventID = "end game";
module.exports = function(server, game) {
	
	return {
		id: eventID,
		func: function(gameID) {
			let currentGame = game['games'][gameID];
			let players = currentGame['players'];
			for (playerID in players) {
				server.emit(playerID, eventID,{}, null);
			}
			server.emit(currentGame.facilitatorID, eventID, {}, null);
			
		}
	};
}
