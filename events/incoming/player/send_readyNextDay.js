
    
/*
	For when a player says that he/she is ready for the next day
*/

const eventID = "ready";
module.exports = function(socket, server, game){
	socket.on("ready", function(socket){
		server.trigger['server send updateFacilitator']();

	});
}