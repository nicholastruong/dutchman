const crypto = require("crypto");

module.exports = function(socket, server, game, config) {
	socket.on("client login", function(params, response) {
		console.log("client login params: ");
		console.log(params);
		// Check if missing username or password
		if (params.username === undefined || params.password === undefined) {
			return response({ success:false, error: "Missing username or password." });
		}

		server.db.query(
			"SELECT u.*, g.game_id as game_player_id, t.game_id as game_admin_id FROM users u " +
				"LEFT JOIN games g ON u.user_id=g.facilitator_id " +
				"LEFT JOIN team_states t ON u.user_id=t.user_id " +
				"WHERE username = ?",
			[params.username],
			function(error, results, fields) {
				if (error) {
					return response({ success: false, error: "Error accessing database."});
				}
				else if (results[0] === undefined) {
					return response({ success: false, error: "Username does not exist."});
				}
				else {
					let record = results[0];
					// check password
					var passwordCheck = crypto.createHash("sha256");
					passwordCheck.update(params.password + record.salt);
					if (passwordCheck.digest("hex") == record.password)
					{ // valid login
						// Check if already logged in
						for (let token in server.authenticatedUsers)
						{
							let user = server.authenticatedUsers[token];
							if (user !== undefined && user.id == record.id) {
								server.authenticatedUsers[token] = undefined; // log out the older session
							}
						}
						
						// Generate token
						let token = crypto.randomFillSync(Buffer.alloc(8)).toString("hex");

						// Get the game ID based on whether or not user is an admin or not
						//TODO: error checking if neither of these exists
						let gameID = (record.is_admin) ? record.game_admin_id : record.game_player_id;

						server.authenticatedUsers[token] = {
							userID: record.user_id,
							username: record.username,
							isFacilitator: record.is_admin,
							gameID: gameID
						};
						
						console.log(server.authenticatedUsers[token]);
						
						return response({ success: true, isFacilitator: record.is_admin, token: token}); 
					}
					else // Invalid login
					{ 
						return response({ success: false, error: "Invalid login."});
					}
				}
			}
		);
	});
}