const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		let currentGame = game['games']['0'];
		let players = currentGame['players'];


		currentGame['day'] += 1;
		//for each player, update resource count in game state
		//query game state for resources and send to each socket
		var weather = game.weather['day'];
		for (socketID in players) {
			
			var newResources = players[socketID]['resources'];

			console.log(newResources);
			game.updateResources(0, socketID, currentGame['day']); //0 is gameID
			server.trigger['server send updateDay'](socketID, newResources, weather, currentGame['day']);

		}

		//send all updated player status to facilitator
		server.trigger['server update player states'](socket, server, game);
		
		
	});
}