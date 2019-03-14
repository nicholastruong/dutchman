/* tells facilitator that a player is ready */

const eventId = "server send updateFacilitator";
module.exports = function(server, config) {
	
	return {
		id: eventId,
		func: function() {
			debugger;	
			server.emit(null, "player ready", {}, null, true);
		}
	};
	
};