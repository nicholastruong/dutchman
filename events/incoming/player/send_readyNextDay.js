
    
/*
	For when a player says that he/she is ready for the next day
*/

const eventID = "ready";
module.exports = function(socket, server, game){
	socket.on("ready", function(data){

		let currentGame = game['games']['0'];
		game.setNextLocation(0, data['currentSpace'], socket['id']);
		server.trigger['server send updateFacilitator']();

	});
}