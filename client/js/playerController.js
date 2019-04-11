var PlayerController = function() 
{
  let scope = this;

  console.log(getUrlVars());
  let token = getUrlVars()['token'];
  //open socket
  let socket = scope.socket = io(document.location.hostname + ":3000?token=" + token);
  console.log(socket);
  if (socket['connected'] == false) {
    window.location.href = '/';
  }

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();

  //swindow.location.href = "login.html";
}

weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]};

var weatherForecast;
var forecastAvailable = false;
var teamname = "";
var stayDay1 = false;
var stayDay2 = false;
var curr_day = 0;
var resources = new Object();
var colocated_players = [];
var alert_queue = [];
var socket;
var reqObj = new Object();
var offerObj = new Object();


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
    })
    .on('hidden.bs.modal', function (e) {
       onModal = false;
    });

});


PlayerController.prototype = {
  /**
   * Register handlers for incoming events sent by the server.
   */
  _RegisterSocketHandlers: function()
  {
    let scope = this;
    let socket = this.socket;

    socket.on('redirect', function() {
      console.log("hey im redirecting");
      window.location.href = '/';
    });

    socket.on('facilitator broadcast', function(msg) {
      $('#messages').append($('<li>').text(msg));
    });

    socket.on('day zero', function(d) {
      teamname = d['username'];
      $('#team_name').text("Team " + teamname);
      enableMove = false;
      colocated_players = d['colocated_players'];
      console.log(colocated_players);
    });

    socket.on('server send updateDay', function(d) {
      curr_day = d['day'];
      if (curr_day == 1) {
        $("#weatherdetails").attr("hidden", false);
        $("#canyonstatus").attr("hidden", false);
      }
      
      colocated_players = d['colocated_players'];
      $('#day').text("Day: " + d['day']);

      if (curr_day % 5 == 0) { 
        forecastAvailable = false; 
      }

      if (d['resourcesExpended'] != undefined && curr_day != 1) { 
        updateAlert(d['weather'], d['resourcesExpended'], curr_day); 
      }

      updateWeather(d['weather']);
      
      floodCanyon(d['weather'][1] == "flooded");


      hasMadeMove = false;
      enableMove = !((curr_day == 1 && stayDay1) || (curr_day == 2 && stayDay2))
      $('#readybutton').prop('disabled', false);
    });

    socket.on('server send forecast', function(d) {
      weatherForecast = d['forecast'];
    });

    socket.on('update resources', function(d) {
      resources = d;
      if (curr_day != 0 && !forecastAvailable) { // disables the weather forecast button if not enough batteries available
        $("#forecastButton").attr("disabled", resources['batteries'] < 1 || curr_day % 5 != 0);
      }
      updateResources(d);
    }); 


    socket.on('server send giveTradeResults', function(d){
      console.log(d['tradeResults']);
      if (d['tradeResults']['accepted']){
        customAlert("The trade was accepted!");
        console.log(d['tradeResults']);
        updateResources(d['tradeResults']['resources']);
      } else {
        customAlert("The trade was declined.");
      }
    });


    socket.on('server send giveTradeOffer', function(d){
      
      
      var reqObj = d['requested_resources'];
      var offerObj = d['offered_resources'];
      
      var request = "";
      var offer = "";

      for (let resource in reqObj) {
        if ( reqObj[resource] > 0){
          request += String(reqObj[resource]) + " " + String(resource) + ", ";
        }
        if ( offerObj[resource] > 0){
          offer += String(offerObj[resource]) + " " + String(resource) + ", ";
        }
      }
      /*
      let trade = {
        proposerID : d['proposerID'],
        targetID : d['targetID'],
        offered_resources : JSON.stringify(Array.from(offerResource)),
        requested_resources : JSON.stringify(Array.from(requestResource))
      }
*/

      let alertMsg = "Hey " + d['proposerID'] + " wants to trade with you! Do you want to give " +
      request + "in exchange for " + offer + " ?"
      customConfirm(alertMsg, function(r){
        if (checkTrade(reqObj)){
          socket.emit('player send tradeResponse', {accepted: r, trade: d});
        } else {
          customAlert("Trade could not be completed due to insufficient funds.")
          socket.emit('player send tradeResponse', {accepted: false, trade: d});
        }
      }, true);
    });

    socket.on('server send tradeCanceled', function(d){
      customAlert("Trade was cancelled.");
      console.log("yo the trade was cancelled");
    })

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

    var forecastButton = document.getElementById("forecastButton");
    forecastButton.addEventListener('click', function() {
      if (forecastAvailable) {
        $('#forecastModal').modal('show');
      }
      else {
        customConfirm("Do you want to use one of your batteries to get the weather forecast?", function() {
          if (weatherForecast != null) { updateWeatherForecast(); }

          // update number of batteries available
          this.resources["batteries"] -= 1;
          socket.emit('server send updateResources', {resources: this.resources});
         
          forecastAvailable = true;
          $('#forecastModal').modal('show');
        });
      }
    });

    var readyButton = document.getElementById("ready");
    readyButton.addEventListener('click', function(){
      if (hasMadeMove) {
        customConfirm("Are you sure you're finished with your turn?", reallyReady);
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
        "order to retrieve as much gold from the mine as possible.</p>" + 
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
  }
};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function checkTrade(request){
  currResource = this.resources;
  for ( resource in request){
    if ( currResource[resource] - request[resource] < 0){
      return false;
    }
  }
  return true;
}

function updateResourceTrading(add, subtract){
  currentResources = this.resources;
  for (amount in add){
      currentResources[amount] += add[amount];
      currentResources[amount] -= subtract[amount];
  }
  updateResources(currentResources);
}

function reallyReady() {
  if (curr_day == 0) { $("#videoTurboButton").attr("disabled", true); }
  if (curr_day % 5 == 0 && !forecastAvailable) { $("#forecastButton").attr("disabled", true); }
  $('#readybutton').prop('disabled', true);
  enableMove = false;
  onModal = false;

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
      
      this.resources["turbo"] -= 1;
      socket.emit('server send updateResources', {resources: this.resources});
    });
  } 
}


function watchVideo(video) {
  $('#videoModal').modal('hide');

  if (video == "turbos") {
    customConfirm("Are you sure you want to stay another day?", function() {
      $("#tortillaflatsButton").attr("disabled", true);
      $("#turboRow").attr("hidden", false);
      // socket.emit('add turbo');
      customAlert("You received 3 turbos!");
      this.resources["turbo"] += 3;
      socket.emit('server send updateResources', {resources: this.resources});

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
      // socket.emit('add cave');
      customAlert("You received 12 caves!");
      this.resources["caves"] += 12;
      socket.emit('server send updateResources', {resources: this.resources});

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

function updateWeatherForecast() {
  for (i = 0; i < 5; i++) {
     $('#low_forecast' + i).text("Day " + (curr_day + i));
     $('#high_forecast' + i).text("Day " + (curr_day + i));

     $('#low_forecast_txt' + i).text(weather[weatherForecast[i]['low']][0]);
     $('#high_forecast_txt' + i).text(weather[weatherForecast[i]['high']][0]);

     $('#low_forecast_img' + i).attr("src", "assets/weather/" + weather[weatherForecast[i]['low']][1] + ".png");
     $('#high_forecast_img' + i).attr("src", "assets/weather/" + weather[weatherForecast[i]['high']][1] + ".png");
  }
}

function updateResources(resources) {
   $('#fuel').text(resources['fuel'] + " Fuel");
   $('#supplies').text(resources['supplies'] + " Supplies");
   $('#tires').text(resources['tires'] + " Spare Tires");
   $('#cash').text("$" + resources['cash'] + " Cash");
   $('#batteries').text(resources['batteries'] + " Batteries");
   $('#caves').text(resources['caves'] + " Caves");
   // $('#turbo').text(resources['turbo'] + " Turbos");
   if (hasTurbos) { $('#turbo').text(resources['turbo'] + " Turbos (IN USE)"); }
   else { $('#turbo').text(resources['turbo'] + " Turbos"); }

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
        // console.log("customAlert - onModal is false");
      }
   });

   if (!onModal) {
      onModal = true;
      // console.log("customAlert - onModal is true");
      alertBox.modal('show');
   }
   else {
      alert_queue.push(alertBox);
   }
};

function customConfirm(message, callbackFunc, ifTrade) {

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
            callbackFunc(result);
         }
         else if (ifTrade != undefined && ifTrade){
           callbackFunc(result);
         }

         if (alert_queue.length > 0) {
            alert_queue.shift().modal('show');
         }
         else {
            onModal = false;
            // console.log("customConfirm - onModal is false");
         }
      },
      show: false
   });

   onModal = true;
   // console.log("customConfirm - onModal is true");
   confirmBox.modal('show');
}

