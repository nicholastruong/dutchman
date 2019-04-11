//sends weather forecast info to all players with batteries

const eventID = "server send forecast";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, userID) {

			let currentGame = game['games'][gameID];
			var weatherForecast = game.getWeatherForecast(currentGame['day']);

			server.emit(userID, eventID, 
				{
					forecast: weatherForecast 
  				},
  				null
  			);
		}
	};
}