//sends updates to of next day to all the clients

const eventID = "day zero";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(userID, colocatedPlayers) {
			server.emit(userID, eventID, 
				{
  					colocated_players: colocatedPlayers
  				},
  				null
  			);
		}
	};
}
