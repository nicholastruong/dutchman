
    
/*
	For when a player gets the turbo
*/

const eventID = "add turbo";
module.exports = function(socket, server, game){
	socket.on("add turbo", function(data){

		game.addResource(0, socket['id'], "turbo");
		server.trigger['update resources'](socket['id']);
		server.trigger['server send updateFacilitator']();

	});
}