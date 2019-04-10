var PlayerController = function() 
{
  let scope = this;

  console.log(getUrlVars());
  let token = getUrlVars()['token'];
  //open socket
  let socket = scope.socket = io(document.location.hostname + ":3000?token=" + token);
  console.log("hey look at my socket");
  console.log(socket);

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();

  //swindow.location.href = "login.html";
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]};

var weatherForecast;
var teamname = "";
var stayDay1 = false;
var stayDay2 = false;
var curr_day = 0;
var resources = new Object();
var colocated_players = [];
var alert_queue = [];
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
  $('#videoModal')
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

       if (weatherForecast != null && curr_day % 5 == 0) {
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

    socket.on('day zero', function(d) {
      $('#day').text("Day: " + '0');
      enableMove = false;
      colocated_players = d['colocated_players'];
      updateWeather(['no weather']);
    });

    socket.on('server send updateDay', function(d) {
      curr_day = d['day'];
      
      colocated_players = d['colocated_players'];
      $('#day').text("Day: " + d['day']);

      $("#videoTurboButton").attr("disabled", (curr_day != 0));

      if (d['resourcesExpended'] != undefined) {
        updateAlert(d['weather'], d['resourcesExpended'], curr_day);
      }

      updateWeather(d['weather']);
      
      floodCanyon(d['weather'][1] == "flooded");


      hasMadeMove = false;
      // console.log("curr_day:" + curr_day + " stayDay1:" + stayDay1 + " stayDay2:" + stayDay2);
      enableMove = !((curr_day == 1 && stayDay1) || (curr_day == 2 && stayDay2))
      $('#readybutton').prop('disabled', false);
    });

    socket.on('server send forecast', function(d) {
      weatherForecast = d['forecast'];

    });

    socket.on('update resources', function(d) {
      resources = d;
      updateResources(d);
    }); 

    socket.on('out of resources', function(d){
      console.log('out of resources');

      /*
        
        BUG: Can't figure out why this is triggered when resources are still valid. Cannot figure out where this is being triggered from.
        Tried printing from out_of_resources.js but to no avail.

      */
      //$('#messages').append($('<li>').text("You're out of resources. Use your beacon!"));
    });

    socket.on('end game', function(d){
      $('#messages').append($('<li>').text("Game has ended!"));
      //Disable buttons and movement here
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
            if (curr_day == 0) {
              customConfirm("Are you ready to begin the game?", reallyReady);
            }
            else if ((curr_day == 1 && stayDay1) || (curr_day == 2 && stayDay2)) {
              customConfirm("Are you sure you're finished with your turn?", reallyReady);
            }
            else {
              customConfirm("Are you sure you want to stay in Apache Junction for another day?", reallyReady);
            }
         }
         if (curr_space == 20) {
            customConfirm("Are you sure you want to stay in the Lost Dutchman Goldmine?", reallyReady);
         }
         if (curr_space != 0 && curr_space != 20) {
            customConfirm("Are you sure you want to stay in the same space?", reallyReady);
         }
      }
    });

    var instructionButton = document.getElementById("instructionblock");
    instructionButton.addEventListener('click', function(){
      customAlert("Welcome to The Search for The Lost Dutchman's Gold Mine." + 
        "</p>The main objective of this game is to work with your team and plan out your resources in " + 
        "order to retrieve as much gold from the mine as possible.</p>You are not competing" + 
        " against the other teams going to the mine, so work with them in order to maximize success.</p>" + 
        " Learn more about each different resource by mousing over them.</br></br>" + 
        "Gameplay</br> - Click on the board space you wish to travel that day.</br> - Click the 'Ready for Next Day' button when " + 
        "you have completed all desired actions for that day.</br> - Click the 'Team Trade' button when your team is on the same " + 
        "game space as another team in order to trade resources with them.</br> - Click the 'Provisioner Trade' button when " +
        "your team is at Apache Junction or any other trading post to trade resources with the provisioner.</br>" + 
        " - Click the 'Weather Forecast' button on any fifth day in order to use one of your batteries and receive " + 
        "a weather forecast about the next five days.</br></br>" +
        "Rules</br>1. Your team may not return to Apache Junction on the same path that you took to the mine.</br>" + 
        "2. Your team receives one gold for each day you are able to stay at the mine before returning.");
    });

    // var videoTurboButton = document.getElementById("videoTurboButton");
    // videoTurboButton.addEventListener('click', function(){
    //   // customAlert("You received 3 turbos");
    //   socket.emit('add turbo');
    // });


  }
};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function reallyReady() {
  $('#readybutton').prop('disabled', true)
  enableMove = false;
  onModal = false;
  console.log("curr_space: " + curr_space + " car: " + car.x + "," + car.y);
  socket.emit('ready', 
    {
       currentSpace: curr_space,
       currentCoords: [0,0]
    }
  );

  if (curr_space == 4 && !$("#turboRow").attr("hidden") && $('#turbo').text() != "0 Turbo Boost") {
    customConfirm("Do you wish to activate your Turbos?", function() { 
      hasTurbos = true; 
      onModal = false;
      $('#turbo').text($('#turbo').text() + " (IN USE)");
    });
  } 
}

function watchVideo(video) {
  $('#videoModal').modal('hide');

  if (video == "turbos") {
    customConfirm("Are you sure you want to stay another day?", function() {
      $("#tortillaflatsButton").attr("disabled", true);
      $("#turboRow").attr("hidden", false);
      socket.emit('add turbo');
      customAlert("You received 3 turbos!");

      enableMove = false;
      stayDay2 = stayDay1;
      stayDay1 = true;
      $("#videoExplaination").text("You can watch the remaining video, but you will have to stay in Apache Junction until day 3.");
      if ($("#goldmineButton").attr("disabled")) {
        $("#videoExplaination").text("You have watched both of the videos already.");
      }
    });
  }
  if (video == "caves") {
    customConfirm("Are you sure you want to stay another day?", function() {
      $("#goldmineButton").attr("disabled", true);
      $("#caveRow").attr("hidden", false);
      socket.emit('add cave');
      customAlert("You received 12 caves!");

      enableMove = false;
      stayDay2 = stayDay1;
      stayDay1 = true;
      $("#videoExplaination").text("You can watch the remaining video, but you will have to stay in Apache Junction until day 3.");
      if ($("#tortillaflatsButton").attr("disabled")) {
        $("#videoExplaination").text("You have watched both of the videos already.");
      }
    });
  }
}


function updateAlert(weatherData, changedResources, day) {
  var alert = "";
  if (weatherData[0] == "arctic blast") {
    alert += "Because of the cold weather, you used more resources than normal...<br><br>";
  }
  if (weatherData[0] == "rainy" && lowCountry_path.includes(curr_space)) {
    alert += "Because of the mud on the low country path, you used more resources than normal...<br><br>";
  }

  if (curr_space == 20) {
    alert += "You got 1 gold resource from the mine!<br><br>And you used the following resources:<br>";
  }
  else {
    alert += "You used the following resources on day " + (day - 1) + ":<br>";
  }

  for (resource in changedResources) {
    if (changedResources[resource] < 0) {
      alert += "<br>" + (changedResources[resource] * -1) + " ";
      if (resource == "tents") alert += "tent";
      else if (resource == "caves") alert += "cave";
      else alert += resource;
    }
  }

  customAlert(alert);
}

function updateWeather(weatherData) {
  if (weatherData[0] !== 'no weather') {

   $('#weatherimg').attr("src", "assets/weather/" + weather[weatherData[0]][1] + ".png");

   $('#canyonstatus').text("Canyon is " + weatherData[1]);
  }
  $('#weathertext').text(weatherData[0]);
   
}

function updateResources(resources) {

  console.log(resources);
   $('#fuel').text(resources['fuel'] + " Fuel");
   $('#supplies').text(resources['supplies'] + " Supplies");
   $('#tires').text(resources['tires'] + " Spare Tires");
   $('#cash').text("$" + resources['cash'] + " Cash");
   $('#batteries').text(resources['batteries'] + " Batteries");
   $('#caves').text(resources['caves'] + " Caves");
   $('#turbo').text(resources['turbo'] + " Turbos");
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
      if (alert_queue.length > 0) {
        alert_queue.shift().modal('show');
      }
      else {
        onModal = false;
      }
   });

   if (!onModal) {
      onModal = true;
      alertBox.modal('show');
   }
   else {
      alert_queue.push(alertBox);
   }
};

function customConfirm(message, callbackFunc) {
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
            callbackFunc();
         }
         else {
            onModal = false;
            console.log("onModal is false");
         }
      },
      show: false
   });

   // confirmBox.on('hidden.bs.modal', function () {
   //    onModal = false;
   //    console.log("onModal is false");
   // });

   onModal = true;
   confirmBox.modal('show');
}

