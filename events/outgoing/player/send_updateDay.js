//sends updates to of next day to all the clients

//TODO: CHANGE HARDCODED WEATHER
var day = 1;
var weather = {
	1: 'sunny',
	2: 'sunny',
	3: 'rainy',
	4: 'sunny',
	5: 'rainy',
	6: 'arctic freeze',
	7: 'sunny',
	8: 'rainy',
	9: 'sunny',
	10: 'rainy',
	11: 'sunny',
	12: 'sunny',
	13: 'rainy',
	14: 'sunny',
	15: 'rainy'
}

const eventID = "server send updateDay";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function() {
			isFacilitator = false;
			server.emit(false, eventID, 
				{
					day: ++day,
  					weather: weather[day] 
  				}
  			);
		}
	};
}
