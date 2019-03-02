const eventID = "facilitator broadcast";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(msg) {
			isFacilitator = false;
			server.emit(false, eventID, msg);
		}
	};
}
