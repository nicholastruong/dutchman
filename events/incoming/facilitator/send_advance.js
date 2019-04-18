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

		if(currentGame['day'] === 21) {
			server.trigger['end game'](gameID);
		}
		else {
			var playersOutOfResources = [];

			game.clearTrades(gameID);

			for (playerUserID in players) {
		
				var hasEnoughResources = server.trigger['server send updateDay'](gameID, playerUserID);
				server.trigger['update resources'](gameID, playerUserID);

				server.trigger['server send forecast'](gameID, playerUserID);
				
				//notifies player and facilitator that they are out of resources
				if(!hasEnoughResources) {
					server.trigger['player out of resources'](playerUserID);
					playersOutOfResources.push(players[playerUserID]['username']);
				}
				
			}
			if (playersOutOfResources.length !== 0) {
				server.trigger['update server player out of resources'](gameID, playersOutOfResources);
			}

			//send all updated player status to facilitator
			server.trigger['server update player states'](gameID, false);
			server.trigger['update server weather'](gameID, currentGame['facilitatorID']);
		}
			
	});
}