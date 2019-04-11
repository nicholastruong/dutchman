/*
	Sending the trade results to involved party
*/

const eventID = "server send giveTradeResults";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(gameID, userID, tradeResults) {
			console.log("server send giveTradeResults");
			server.emit(userID, eventID,
				{
					tradeResults: tradeResults
				},
				null
			);
			server.trigger['update resources'](gameID, userID);
		}
	};
}