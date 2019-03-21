const eventID = 'facilitator next day';
var day = 1;
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		let currentGame = game['games']['0'];
		let players = currentGame['players'];

		++day;
		//for each player, update resource count in game state
		//query game state for resources and send to each socket
		var weather = game.weather[day];
		for (socketID in players) {
			
			var newResources = players[socketID]['resources'];

			console.log(newResources);
			game.updateResources(0, socketID, day); //0 is gameID
			server.trigger['server send updateDay'](socketID, newResources, weather, day);

		}
		
		
	});
}