//sends updates of resources after provisioner trading

const eventID = "server send updateResources";
module.exports = function(server, config)
{
	return {
		id: eventID,
		func: function(playerID, resources) {
			console.log("server send updateResources");
			server.trigger(playerID, eventID, 
				{
                    resources: resources
  				},
  			);
		}
	};
}
