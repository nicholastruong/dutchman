//sends updates to of next day to all the clients

const eventID = "day zero";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(socketID, colocatedPlayers) {
			server.emit(socketID, eventID, 
				{
  					colocated_players: colocatedPlayers
  				},
  				null,
  				false
  			);
		}
	};
}
