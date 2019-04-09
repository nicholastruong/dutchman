//sends updates of resources after provisioner trading

const eventID = "server send updateResources";

module.exports = function(socket, server, game){
	socket.on("server send updateResources", function(data){
		
		let currentGame = game['games']['0'];
		//gameID, playerID, resources
		game.setResources(0, socket['id'], data['resources']);
		server.trigger['update resources'](socket['id']);
		
	});
}