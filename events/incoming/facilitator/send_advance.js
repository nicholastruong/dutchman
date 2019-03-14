const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		let currentGame = game['games']['0'];
		let players = currentGame['players'];

		//for each player, update resource count in game state
		//query game state for resources and send to each socket
		for (socketID in players) {
			//0 is for hardcoded gameID
			var newResources = players[socketID]['resources'];
			game.updateResources(0, socketID);
			server.trigger['server send updateDay'](socketID, newResources);

		}
		
		
	});
}