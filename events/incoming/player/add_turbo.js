
    
/*
	For when a player gets the turbo
*/

const eventID = "add turbo";
module.exports = function(socket, server, game){
	socket.on("add turbo", function(data){

		game.addResource(0, socket['id'], "turbo");

		let currentGame = game['games']['0'];
		let players = currentGame['players'];
		var newResources = players[socket['id']]['resources'];

		server.trigger['update resources'](socket['id'], newResources);

		server.trigger['server send updateFacilitator']();

	});
}