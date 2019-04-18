//sends to client that player it out of resources

const eventID = "player out of resources";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(userID) {
			console.log(userID + ' is out of resources');
			server.emit(userID, eventID, null, null);
		}
	};
}
