/* tells facilitator status of all the players on a new day */

const eventId = "update server weather";
module.exports = function(socket, server, game, config) {
	
	return {
		id: eventId,
		func: function(socket, server, game, weatherReport) {
			//array of players in the game
			let currentGame = game['games']['0'];
			let players = currentGame['players'];
			var report = {
				day: currentGame['day'],
				weather: weatherReport
			};

			let facilitatorID = currentGame.facilitatorID;

			server.emit(facilitatorID, "facilitator weather report", report, null, false);
		}
	};
	
};