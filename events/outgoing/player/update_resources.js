//sends to client list of updated resources

const eventID = "update resources";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, userID) {
			let currentGame = game['games'][gameID];
			let resources = currentGame['players'][userID]['resources'];

			server.emit(userID, eventID, resources, null);
		}
	};
}
