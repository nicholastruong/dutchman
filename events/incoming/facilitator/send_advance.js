const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		let currentGame = game['games']['0'];
		let players = currentGame['players'];

		currentGame['day'] += 1;
		//for each player, update resource count in game state
		//query game state for resources and send to each socket
		var facilitatorWeatherReport = game.weather[currentGame['day']];
		for (socketID in players) {
			
			var newResources = players[socketID]['resources'];
			var currentLocation = players[socketID]['currentLocation'];
			var playerWeatherReport = game.getWeather(currentLocation, currentGame['day']);
			game.updateResources(0, socketID, currentGame['day']); //0 is gameID
			var colocatedPlayers = game.getColocatedPlayers(0, socketID);
			console.log('colocated Players');
			console.log(colocatedPlayers);

			server.trigger['server send updateDay'](socketID, newResources, playerWeatherReport, currentGame, colocatedPlayers);

			if (true) { // currentGame['day'] == 5 || currentGame['day'] == 10 || currentGame['day'] == 15) { // sends weather info everday for debugging
				var weatherForecast = game.getWeatherForecast(currentGame['day']);

				server.trigger['server send forecast'](socketID, weatherForecast);
			}
		}

		if(currentGame['day'] === 20) {
			server.trigger['end game'](socket, server, game);
		}

		//send all updated player status to facilitator
		server.trigger['server update player states'](socket, server, game);
		server.trigger['update server weather'](socket, server, game, facilitatorWeatherReport)
		
	});
}