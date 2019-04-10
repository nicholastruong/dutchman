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
		
		let trade = params.trade;
		
		server.trigger["server send giveTradeOffer"](trade);
	});	

}