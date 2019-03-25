/*
	* @event player send tradeResponse
	* For when a player responds (accept/decline) to another team's proposed trade
	*
	* @param accepted Boolean representing whether trade has been accepted
	* @param trade The trade object
	* @param trade.proposerID The user id of the player proposing the trade
	* @param trade.targetID The user id of the player being offered a trade
	* @param trade.offered_resources The resources being offered in the trade
	* @param trade.requested_resources The resources being requested in the trade
*/

const eventID = "player send tradeResponse";
module.exports = function(socket, server, game) {
	socket.on(eventID, function(params, response) {
		console.log("player send tradeResponse");
		// TODO: remove trade from game.js
		// TODO: send information to facilitator as well
		let roomId = '0'; //TODO: socket.user.roomId
		let accepted = params.accepted;
		let trade = params.trade;

		console.log(params.trade);

		if (accepted == true) {
			// Update resources
			game.commitTrade(roomId, params.trade);

			// Send updated resources to proposer
			tradeResultsProposer = {
				accepted: true,
				resources: game['games'][roomId]['players'][trade.proposerID]['resources']
			};
			server.trigger["server send giveTradeResults"](trade.proposerID, tradeResultsProposer);

			// Send updated resources to target
			tradeResultsTarget = {
				accepted: true,
				resources: game['games'][roomId]['players'][trade.targetID]['resources']
			};
			server.trigger["server send giveTradeResults"](trade.targetID, tradeResultsTarget);
		} else {
			// Notify proposer that the trade did not occur
			tradeResultsProposer = {
				accepted: false
			};
			server.trigger["server send giveTradeResults"](trade.proposerID, tradeResultsProposer);
		}
	});
}
