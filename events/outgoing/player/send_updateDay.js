//sends updates to of next day to all the clients

const eventID = "server send updateDay";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(socketID, resources, weather, game) {
			console.log("server send updateDay");
			server.emit(socketID, eventID, 
				{
					day: game['day'],
  					weather: weather,
  					resources: resources 
  				},
  				null,
  				false
  			);
		}
	};
}
