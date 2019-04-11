/* tells facilitator both weather updates */

const eventId = "update server weather";
module.exports = function(server, game) {
	return {
		id: eventId,
		func: function(gameID, facilitatorID) {
			//array of players in the game
			let currentGame = game['games'][gameID];
			var weatherReport = game.weather[currentGame['day']];

			var report = {
				day: currentGame['day'],
				weather: weatherReport
			};

			server.emit(facilitatorID, "facilitator weather report", report, null);
		}
	};
};