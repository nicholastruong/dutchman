//sends weather forecast info to all players with batteries

const eventID = "server send forecast";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(socketID, weatherForecast) {
			server.emit(socketID, eventID, 
				{
					forecast: weatherForecast 
  				},
  				null,
  				false
  			);
		}
	};
}