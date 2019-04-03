//sends to client that player it out of resources

const eventID = "out of resources";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(socketID) {
			server.emit(socketID, eventID, {}, false, false);
		}
	};
}
