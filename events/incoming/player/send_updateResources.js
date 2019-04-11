//sends updates of resources after provisioner trading

const eventID = "server send updateResources";

module.exports = function(socket, server, game){
	socket.on("server send updateResources", function(data){
		let gameID = socket.user.gameID;
		let userID = socket.user.userID;

		game.setResources(gameID, userID, data['resources']);
		server.trigger['update resources'](gameID, userID);
	});
}