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

		var playersOutOfResources = [];

		for (playerUserID in players) {
	
			var hasEnoughResources = server.trigger['server send updateDay'](gameID, playerUserID);
			server.trigger['update resources'](gameID, playerUserID);

			if (true) { // currentGame['day'] == 5 || currentGame['day'] == 10 || currentGame['day'] == 15) { // sends weather info everday for debugging
				server.trigger['server send forecast'](gameID, playerUserID);
			}
			
			//notifies player and facilitator that they are out of resources
			if(!hasEnoughResources) {
				console.log(playerUserID +  ' out of resources');

				var beaconResources = calculateNewResources(players[playerUserID]['resources']);
				
				game.setResources(gameID, playerUserID, beaconResources);
				server.trigger['update resources'](gameID, playerUserID);
				
				server.trigger['out of resources'](playerUserID);
				playersOutOfResources.push(playerUserID);
			}
			
		}
		server.trigger['update server player out of resources'](gameID, playersOutOfResources);

		//send all updated player status to facilitator
		server.trigger['server update player states'](gameID, false);
		server.trigger['update server weather'](gameID, currentGame['facilitatorID']);
		if(currentGame['day'] === 21) {
			server.trigger['end game'](gameID);
		}

		function calculateNewResources(oldResources) {
			for (r in oldResources) {
				oldResources[r] += 5;
 			}
 			return oldResources;
		}
		
		
	});
}