/*
	* @event player send tradeOffer
	* For when a player sends a trade offer to another team
	*
	* @param trade The trade object, as defined below
	* @param trade.proposerID The user id of the player proposing the trade
	* @param trade.targetID The user id of the player being offered a trade
	* @param trade.offered_resources The resources being offered in the trade
	* @param trade.requested_resources The resources being requested in the trade
*/

const eventID = "player send tradeOffer";
module.exports = function(socket, server, game) {
	socket.on(eventID, function(params, response) {
		// TODO: store trades in game.js and have them be cancellable
		let gameID = socket.user.gameID;
		let currentGame = game['games'][gameID];

<<<<<<< HEAD
		
		
		let trade = params.trade;
		
=======
		let trade = params.trade;

		console.log("player send tradeOffer");

>>>>>>> 9f7350884c39cae4d725e240dfc7fd3a59d0cfa3
		server.trigger["server send giveTradeOffer"](trade);
	});	

}