const eventID = 'facilitator send broadcast';
module.exports = function(socket, server, game, config){

	socket.on("facilitator send broadcast", function(msg){

		let gameID = socket.user.gameID;
		server.trigger['facilitator broadcast'](gameID, msg);
	});


}