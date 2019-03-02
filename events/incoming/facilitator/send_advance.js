const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		server.trigger['server send updateDay']();
	});


}