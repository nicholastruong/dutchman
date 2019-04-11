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
		let gameID = socket.user.gameID;
		let trade = params.trade;
		trade['proposerID'] = socket.user.userID;
		console.log("player send trade offer trade object:");
		console.log(trade);

		game.createTradeRequest(gameID, trade);

		server.trigger["server send giveTradeOffer"](trade);
	});	

}