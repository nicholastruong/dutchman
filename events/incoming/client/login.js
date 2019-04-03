module.exports = function(socket, server, game, config) {
	socket.on("client login", function(params, response) {
		if (params.username == "jffa" && params.password == "pass") {		
			let token = "atoken";
			response({ success: true, isFacilitator: false, token: token});
			server.authenticatedUsers[token] = {
				userID: 0,
				isFacilitator: false
			};
		}
		else if (params.username == "jffb" && params.password == "pass") {
			let token = "btoken";
			response({ success: true, isFacilitator: false, token: token});
			server.authenticatedUsers[token] = {
				userID: 1,
				isFacilitator: false
			};
		}
		else if (params.username == "fack" && params.password == "pass") {
			let token = "token";
			response({ success: true, isFacilitator: true, token: token});
			server.authenticatedUsers[token] = {
				userID: 2,
				isFacilitator: true
			};
		}
		else {
			console.log("sad");
		}
	});
}