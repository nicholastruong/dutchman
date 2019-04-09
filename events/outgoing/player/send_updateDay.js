//sends updates to of next day to all the clients

const eventID = "server send updateDay";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(socketID, weather, day, colocatedPlayers, resourcesExpended) {
			console.log("server send updateDay");
			server.emit(socketID, eventID, 
				{
					day: day,
  					weather: weather,
  					colocated_players: colocatedPlayers,
  					resourcesExpended: resourcesExpended
  				},
  				null,
  				false
  			);
		}
	};
}
