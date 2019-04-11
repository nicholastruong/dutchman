//sends updates to of next day to all the clients

const eventID = "day zero";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, userID) {

			var colocatedPlayers = game.getColocatedPlayers(gameID, userID)
			let socket = server.openSockets[userID];

			server.emit(userID, eventID, 
				{
					username: socket.user.username,
  					colocated_players: colocatedPlayers
  				},
  				null
  			);
		}
	};
}
