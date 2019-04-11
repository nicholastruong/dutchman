const eventID = "server send tradeCancelled";
module.exports = function(server, game)
{
	return {
		id: eventID,
		func: function(proposerID, targetID) {
			console.log("hello i am cancelling the trade");
			console.log(targetID);
			server.emit(targetID, eventID,
				{
					proposerID: proposerID,
					targetID: targetID
				},
				null
			);
		}
	}
}