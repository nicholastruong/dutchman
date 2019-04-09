//sends to client list of updated resources

const eventID = "update resources";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(socketID) {

			let currentGame = game['games']['0'];
			let players = currentGame['players'];
			var resources = players[socketID]['resources'];

			server.emit(socketID, eventID, resources, false, false);
		}
	};
}
