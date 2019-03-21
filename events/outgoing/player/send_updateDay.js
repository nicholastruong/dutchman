//sends updates to of next day to all the clients

const eventID = "server send updateDay";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(socketID, resources, weather, day) {
			console.log(socketID);
			server.emit(socketID, eventID, 
				{
					day: day,
  					weather: weather,
  					resources: resources 
  				},
  				null,
  				false
  			);
		}
	};
}
