const eventID = "facilitator broadcast";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(msg) {
			isFacilitator = false;
			server.emit(null, eventID, msg, null, true);
		}
	};
}
