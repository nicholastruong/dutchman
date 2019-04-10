const eventID = 'facilitator next day';
module.exports = function(socket, server, game, config){
	socket.on("facilitator next day", function(){
		let userID = socket.user.userID;
		let gameID = socket.user.gameID;
		let currentGame = game['games'][gameID];
		let players = currentGame['players'];

		currentGame['day'] += 1;
		//for each player, update resource count in game state
		//query game state for resources and send to each socket
		var facilitatorWeatherReport = game.weather[currentGame['day']];


		var playersOutOfResources = [];

		for (playerUserID in players) {

			var playerWeatherReport = game.getWeather(currentLocation, currentGame['day']);
			//deep copy of old resources
			var oldResources = JSON.parse(JSON.stringify(players[playerUserID]['resources']));
			var currentLocation = players[playerUserID]['currentLocation'];
			//updates resources, and notifies if doesn't have enough resources
			var hasEnoughResources = game.updateResources(gameID, playerUserID, currentGame['day']); //0 is gameID
			var newResources = players[playerUserID]['resources'];

			var resourcesExpended = {};
			for (r in newResources) {
				if (newResources[r] - oldResources[r] !== 0) {
					resourcesExpended[r] = newResources[r] - oldResources[r];
				}
			}

			var colocatedPlayers = game.getColocatedPlayers(gameID, playerUserID);
			server.trigger['server send updateDay'](playerUserID, playerWeatherReport, currentGame['day'], colocatedPlayers, resourcesExpended);
			server.trigger['update resources'](gameID, playerUserID);

			if (true) { // currentGame['day'] == 5 || currentGame['day'] == 10 || currentGame['day'] == 15) { // sends weather info everday for debugging
				var weatherForecast = game.getWeatherForecast(currentGame['day']);

				server.trigger['server send forecast'](playerUserID, weatherForecast);
			}

			//notifies player and facilitator that they are out of resources
			if(!hasEnoughResources) {
				server.trigger['out of resources'](playerUserID);
				playersOutOfResources.push(playerUserID);
			}
		}

		server.trigger['update server player out of resources'](gameID, playersOutOfResources);

		if(currentGame['day'] === 20) {
			server.trigger['end game'](socket, server, game);
		}

		//send all updated player status to facilitator
		server.trigger['server update player states'](gameID);
		server.trigger['update server weather'](gameID, facilitatorWeatherReport)
		
	});
}