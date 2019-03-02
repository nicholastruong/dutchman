const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		// console.log(game.test());
		server.trigger['server send updateDay']();
	});
}