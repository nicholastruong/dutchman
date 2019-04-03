//sends updates to of next day to all the clients

const eventID = "end game";
module.exports = function(socket, server, game, config) {
	
	return {
		id: eventID,
		func: function(socket, server, game) {
			console.log("end game");
			server.emit(null, eventID, 
				{},
  				null,
  				false
  			);
		}
	};
}
