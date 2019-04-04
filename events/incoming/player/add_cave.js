
    
/*
	For when a player gets the cave
*/

const eventID = "add cave";
module.exports = function(socket, server, game){
	socket.on("add cave", function(data){

		game.addResource(0, socket['id'], "cave");

		let currentGame = game['games']['0'];
		let players = currentGame['players'];
		var newResources = players[socket['id']]['resources'];

		server.trigger['update resources'](socket['id'], newResources);

		server.trigger['server send updateFacilitator']();

	});
}