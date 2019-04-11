//sends to client list of updated resources

const eventID = "update resources";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, userID) {
			let currentGame = game['games'][gameID];
			let players = currentGame['players'];
			let resources =  players[userID]['resources'];
			//update the player
			server.emit(userID, eventID, resources, null);

			var playerResource = {
				userID : userID,
				resources : resources
			}

			//update the facilitator
			server.emit(currentGame.facilitatorID, "update player resource", playerResource, null);
		}
	};
}
