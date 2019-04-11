const eventID = "facilitator broadcast";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, msg) {
			let currentGame = game['games'][gameID];
			let players = currentGame['players'];
			for (playerID in players){
				server.emit(playerID, eventID, msg, null);
			}
			
		}
	};
}
