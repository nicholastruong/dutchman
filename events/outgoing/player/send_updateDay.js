//sends updates to of next day to all the clients

const eventID = "server send updateDay";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, userID) {
			console.log("server send updateDay");

			let currentGame = game['games'][gameID];
			let players = currentGame['players'];
			let currentLocation = players[userID]['currentLocation'];
			var colocatedPlayers = game.getColocatedPlayers(gameID, userID);

			var resourcesExpended = calculateExpendedResources();
			var weather = game.getWeather(currentLocation, currentGame['day']);

			server.emit(userID, eventID, 
				{
					day: currentGame['day'],
  					weather: weather,
  					colocated_players: colocatedPlayers,
  					resourcesExpended: resourcesExpended
  				},
  				null
  			);


  			function calculateExpendedResources() {
  				//deep copy of old resources
				var oldResources = JSON.parse(JSON.stringify(players[playerUserID]['resources']));
				
				//updates resources, and notifies if doesn't have enough resources
				var hasEnoughResources = game.updateResources(gameID, playerUserID, currentGame['day']); //0 is gameID
				var newResources = players[playerUserID]['resources'];

				var resourcesExpended = {};
				for (r in newResources) {
					if (newResources[r] - oldResources[r] !== 0) {
						resourcesExpended[r] = newResources[r] - oldResources[r];
					}
				}
				return resourcesExpended;
  			};
		}
	};
}
