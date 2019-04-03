
module.exports = function(socket, server, game, config){
	socket.on("disconnect", function(d){
		//gameID = 0, socketID
		game.removeSocket(0, socket['id']);
		
	});
}