/* tells facilitator about a new player connection*/

const eventId = "new player connection";
module.exports = function(server, game) {
	return {
		id: eventId,
		func: function(currentGame, userID) {
			console.log("new player connection");
			let newPlayer = currentGame['players'][userID];
			let facilitatorID = currentGame.facilitatorID;

			var newPlayerInfo = {
				socketID: userID, //TODO remove this
				userID: userID,
				username: newPlayer['username'],
				resources: newPlayer['resources'],
				currentLocation: newPlayer['currentLocation']
			};
			
			server.emit(facilitatorID, "new player connection", newPlayerInfo, null, false);
		}
	};
	
};