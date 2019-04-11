const eventID = 'reset game';
module.exports = function(socket, server, game, config){
	socket.on("reset game", function(){
		let userID = socket.user.userID;
		let gameID = socket.user.gameID;
		let currentGame = game['games'][gameID];
		let players = currentGame['players'];

		currentGame['day'] = 0;
		
		//remove resources, remove from authenticated users and open sockets 
		for (playerUserID in players) {
			console.log(playerUserID);
			var socketToDelete = server.openSockets[playerUserID];

			for (token in server.authenticatedUsers){
				if(server.authenticatedUsers[token] === socketToDelete.user){
					server.authenticatedUsers[token] = undefined;
				}
			}
			server.openSockets[playerUserID] = undefined;
			socketToDelete.disconnect(true);
			delete players[playerUserID];

		}
		trades = {};
		players = {};
		

		//To do: reset tables in facilitator page
	});
}