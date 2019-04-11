/*
	* @event player send cancelTrade
*/

const eventID = "player send cancelTrade";
module.exports = function(socket, server, game) {
	socket.on(eventID, function(params, response) {
		let gameID = socket.user.gameID;
		// Get proposer ID from socket
		let proposerID = socket.user.userID;
		console.log("cancelTrade");
		
		console.log(params);
		console.log(game.checkTradeExists(gameID, proposerID));
		if (game.checkTradeExists(gameID, proposerID)) {
			game.cancelTrade(gameID, proposerID);
			server.trigger["server send tradeCancelled"](proposerID, params.targetID);
		}
	});	
}