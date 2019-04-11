/*
	Sending the trade offer to the intended player
*/

const eventID = "server send giveTradeOffer";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(trade) {
			console.log("trading with: " + trade.targetID);
			server.emit(trade.targetID, eventID,
				{
					proposerID: trade.proposerID,
					targetID: trade.targetID,
					offered_resources: trade.offered_resources,
					requested_resources: trade.requested_resources
				},
				null
			);
		}
	};
}

