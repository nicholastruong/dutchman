/* tells facilitator about a new player connection*/

const eventId = "new player connection";
module.exports = function(server, config) {
	
	return {
		id: eventId,
		func: function(game, socketID) {
			let currentGame = game['games']['0'];
			let players = currentGame['players'];

			let facilitatorID = currentGame.facilitatorID;
			var newPlayerInfo = {
				socketID: socketID,
				resources: players[socketID]['resources'],
				currentLocation: players[socketID]['currentLocation']
			};
			
			server.emit(facilitatorID, "new player connection", newPlayerInfo, null, false);
		}
	};
	
};