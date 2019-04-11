/* tells facilitator about a new player connection*/

const eventId = "new player connection";
module.exports = function(server, game) {
	return {
		id: eventId,
		func: function(gameID, userID) {
			console.log("new player connection");
			let currentGame = game['games'][gameID];
			let newPlayer = currentGame['players'][userID];
			console.log(newPlayer);
			let facilitatorID = currentGame.facilitatorID;

			var newPlayerInfo = {
				userID: userID,
				username: newPlayer.username,
				resources: newPlayer['resources'],
				currentLocation: newPlayer['currentLocation']
			};
			
			server.emit(facilitatorID, "new player connection", newPlayerInfo, null);
		}
	};
	
};