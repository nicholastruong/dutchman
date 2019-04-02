var PlayerController = function() 
{
  let scope = this;

  //open socket
  let socket = scope.socket = io();
  console.log("hey look at my socket");
  console.log(socket);

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]};

var weatherForecast;
var teamname = "";
var firstDayinMud = false;
var curr_day = 1;

var socket;

$(document).ready(function(){
   console.log("documentReady called");

   $('#teamTradeModal')
      .on('show.bs.modal', function (e) {
         onModal = true;
      })
      .on('hidden.bs.modal', function (e) {
         onModal = false;
      });
   $('#provTradeModal')
      .on('show.bs.modal', function (e) {
         onModal = true;
      })
      .on('hidden.bs.modal', function (e) {
         onModal = false;
      });

   $('#forecastModal')
      .on('shown.bs.modal', function (e) {
         onModal = true;
         // console.log(document.getElementById("low_forecast_txt0"));

         if (weatherForecast != null && curr_day % 5 == 0) { // sends weather forecast everyday for debugging
            for (i = 0; i < 5; i++) {
               $('#low_forecast' + i).text("Day " + (curr_day + i));
               $('#high_forecast' + i).text("Day " + (curr_day + i));

               $('#low_forecast_txt' + i).text(weather[weatherForecast[i]['low']][0]);
               $('#high_forecast_txt' + i).text(weather[weatherForecast[i]['high']][0]);

               $('#low_forecast_img' + i).attr("src", "assets/weather/" + weather[weatherForecast[i]['low']][1] + ".png");
               $('#high_forecast_img' + i).attr("src", "assets/weather/" + weather[weatherForecast[i]['high']][1] + ".png");
            }
         }  
      })
      .on('hidden.bs.modal', function (e) {
         onModal = false;
      });

   // teamname = prompt("Enter a team name of less than 10 characters long:", "Team Awesome");
   // if (teamname == null || teamname == "") {
   //    teamname = "Team null";
   // } 
   // if (teamname.length > 10) {
   //    teamname = teamname.substring(0, 10)
   // }
   teamname = "Team 1";
   $('#team_name').text(teamname);

});


PlayerController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;

    /*
    // INFO: THIS IS TEMP CODE for testing trading backend (melanie)
    socket.on('connect', function(){
      var id = socket.io.engine.id
      let trade = {
        proposerID: id,
        targetID: id,
        offered_resources: {'fuel': 10},
        requested_resources: {'supplies': 10}
      };
      console.log(trade);
      socket.emit('player send tradeOffer', {trade: trade});
    });

    socket.on('server send giveTradeOffer', function(trade) {
      console.log("hey someone sent us a trade, that's kinda cool");
      console.log(trade);
      socket.emit('player send tradeResponse', {trade: trade, accepted: true});
    }); */

    socket.on('facilitator broadcast', function(msg) {
      $('#messages').append($('<li>').text(msg));
    });

    socket.on('server send updateDay', function(d) {
       console.log(d);
       curr_day = d['day'];
       $('#day').text("Day: " + d['day']);

       if (curr_space == 4 && d['resources']['turbo'] > 0) {
          customAlert("Your turbos have been activated!");
          hasTurbos = true;
       }
       if (curr_space == 20) {
          customAlert("You got one gold from the mine!");
       }

       if (d['weather'][1] == "flooded") {
         makeMuddy(true);
       }
       else {
         makeMuddy(false);
       }
       updateWeather_Resources(d['weather'], d['resources']);

       hasMadeMove = false;
       enableMove = true;
       $('#readybutton').prop('disabled', false);
    });

    socket.on('server send forecast', function(d) {
      console.log(d);
      weatherForecast = d['forecast'];

    });

  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    socket = this.socket;

    var readyButton = document.getElementById("ready");
    readyButton.addEventListener('click', function(){
      // var reallyReady = false;
      if (hasMadeMove) {
         reallyReady();
      }
      else {
         if (curr_space == 0) {
            customConfirm("Are you sure you want to stay in Apache Junction for another day?");
         }
         if (curr_space == 20) {
            customConfirm("Are you sure you want to stay in the Lost Dutchman Goldmine?");
         }
         if (curr_space != 0 && curr_space != 20) {
            customConfirm("Are you sure you want to stay in the same space?");
         }
      }
    });

    var instructionButton = document.getElementById("instructionblock");
    instructionButton.addEventListener('click', function(){
      customAlert("Instructions for players");
    });
  }
};

function reallyReady() {
   $('#readybutton').prop('disabled', true)
   enableMove = false;
   socket.emit('ready', 
      {
         currentSpace: curr_space,
         currentCoords: [car.x, car.y]
      }
   ); 
}

function updateWeather_Resources(weatherData, resources) {
   $('#weathertext').text(weatherData[0]);
   $('#weatherimg').attr("src", "assets/weather/" + weather[weatherData[0]][1] + ".png");

   $('#canyonstatus').text("Canyon is " + weatherData[1]);

   $('#fuel').text(resources['fuel'] + " Fuel");
   $('#supplies').text(resources['supplies'] + " Supplies");
   $('#tires').text(resources['tires'] + " Spare Tires");
   $('#cash').text("$" + resources['cash'] + " Cash");
   $('#caves').text(resources['caves'] + " Caves");
   $('#turbo').text(resources['turbo'] + " Turbo Boost");
   $('#tents').text(resources['tents'] + " Tents");
   $('#gold').text(resources['gold'] + " Gold");
}


function customAlert(message) {
   alertBox = bootbox.dialog({
      message: message,
      title: '',
      backdrop: true,
      onEscape: true,
      buttons: {
         ok: {
            label: "Okay",
            className: 'alertButton'
         },
      },
      show: false
   });

   alertBox.on('hidden.bs.modal', function () {
      onModal = false;
      console.log("onModal is false");
   });

   onModal = true;
   console.log("onModal is true");
   alertBox.modal('show');
};

function customConfirm(message) {
   confirmBox = bootbox.confirm({
      message: message,
      title: '',
      buttons: {
         confirm: {
            label: 'Yes',
            className: 'btn-success'
         },
         cancel: {
            label: 'No',
            className: 'btn-danger'
         }
      },
      callback: function (result) {
         console.log("callback with result: " + result);
         if (result) {
            reallyReady();
         }
      },
      show: false
   });

   confirmBox.on('hidden.bs.modal', function () {
      onModal = false;
      console.log("onModal is false");
   });

   onModal = true;
   console.log("onModal is true");
   confirmBox.modal('show');
}

