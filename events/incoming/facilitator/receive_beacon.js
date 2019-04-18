const eventID = 'beacon';
module.exports = function(socket, server, game, config){
	socket.on("beacon", function(carePackage){
		let userID = socket.user.userID;
		let gameID = socket.user.gameID;
		let currentGame = game['games'][gameID];
		let players = currentGame['players'];

		var teamName = carePackage['team'];
		var resources = carePackage['resources'];
		
		for (playerUserID in players) {
			if (teamName === players[playerUserID]['username']) {
				game.setResources(gameID, playerUserID, resources);
				server.trigger['update beacon resources'](gameID, playerUserID);
			}	
		}
		
		
	});
}