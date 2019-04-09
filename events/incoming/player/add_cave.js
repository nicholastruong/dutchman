
    
/*
	For when a player gets the cave
*/

const eventID = "add cave";
module.exports = function(socket, server, game){
	socket.on("add cave", function(data){

		game.addResource(0, socket['id'], "cave");
		server.trigger['update resources'](socket['id']);
		server.trigger['server send updateFacilitator']();

	});
}