const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){

	socket.on("facilitator next day", function(socket){
		let currentGame = game['games']['0'];
		let players = currentGame['players'];

		currentGame['day'] += 1;
		//for each player, update resource count in game state
		//query game state for resources and send to each socket
		var facilitatorWeatherReport = game.weather[currentGame['day']];


		var playersOutOfResources = [];

		for (socketID in players) {

			var playerWeatherReport = game.getWeather(currentLocation, currentGame['day']);
			//deep copy of old resources
			var oldResources = JSON.parse(JSON.stringify(players[socketID]['resources']));
			var currentLocation = players[socketID]['currentLocation'];
			//updates resources, and notifies if doesn't have enough resources
			var hasEnoughResources = game.updateResources(0, socketID, currentGame['day']); //0 is gameID
			var newResources = players[socketID]['resources'];

			var resourcesExpended = {};
			for (r in newResources) {
				if (newResources[r] - oldResources[r] !== 0) {
					resourcesExpended[r] = newResources[r] - oldResources[r];
				}
			}

			var colocatedPlayers = game.getColocatedPlayers(0, socketID);
			server.trigger['server send updateDay'](socketID, newResources, playerWeatherReport, currentGame, colocatedPlayers, resourcesExpended);

			if (true) { // currentGame['day'] == 5 || currentGame['day'] == 10 || currentGame['day'] == 15) { // sends weather info everday for debugging
				var weatherForecast = game.getWeatherForecast(currentGame['day']);

				server.trigger['server send forecast'](socketID, weatherForecast);
			}

			//notifies player and facilitator that they are out of resources
			if(!hasEnoughResources) {
				server.trigger['out of resources'](socketID);
				playersOutOfResources.push(socketID);
			}

		}

		server.trigger['update server player out of resources'](server, game, playersOutOfResources);

		if(currentGame['day'] === 20) {
			server.trigger['end game'](socket, server, game);
		}

		//send all updated player status to facilitator
		server.trigger['server update player states'](socket, server, game);
		server.trigger['update server weather'](socket, server, game, facilitatorWeatherReport)
		
	});
}