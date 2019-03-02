const eventID = 'facilitator send broadcast';
module.exports = function(socket, server, game, config){

	socket.on("facilitator send broadcast", function(msg){
		server.trigger['facilitator broadcast'](msg);
	});


}