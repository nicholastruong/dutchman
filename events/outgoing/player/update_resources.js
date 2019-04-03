//sends to client list of updated resources

const eventID = "update resources";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(socketID, newResources) {
			server.emit(socketID, eventID, newResources, false, false);
		}
	};
}
