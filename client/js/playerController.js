var PlayerController = function() 
{
  let scope = this;

  let token = getUrlVars()['token'];

  let socket = scope.socket = io(document.location.hostname + ":3000?token=" + token);

  scope._RegisterSocketHandlers();
  scope._RegisterOutgoing();
}

/* Hardcoded Weather */
weather = {"sunny": ["sunny and cool", "sunny"], "rainy": ["rainy", "rainy"], "arctic blast": ["arctic blast", "cold"]};

/* Boolean Globals */
var forecastAvailable = false;
var hasTurbos = false;
var stay1Day = false;
var stay2Day = false;

/* Game Globals */
var weatherForecast;
var teamname = "";
var curr_day = 0;
var resources = new Object();
var colocated_players = [];
var reqObj = new Object();
var offerObj = new Object();

/* UI / Connection Globals */
var alertConfirmBox; /* Holds the currently displayed confirm box or alert msg */
var bigModal; /* Holds the currently displayed big modal */
var alert_queue = []; /* Holds the queue of things to be displayed */
var socket;

/* player_gameboard Global Variables referenced 
 * onModal
 * enableMove
 * hasMadeMove
 */

window.onload = function () {
  window.controller = new PlayerController();
  $("#provisionerModal").load("provTradeModal.html"); 
  $("#teamTradingModal").load("teamTradeModal.html");
  $("#teamTradeModal").modal('hide');
  $("#provTradeModal").modal('hide');
}

$(document).ready(function(){
  console.log("documentReady called");

  $('#teamTradingModal')
    .on('show.bs.modal', function (e) {
      bigModal = $('#teamTradingModal');
      console.log("teamTradeModal shown");
      onModal = true;
    })
    .on('hidden.bs.modal', function (e) {
      console.log("teamTradeModal hidden");
      onModal = false;
    });

  $('#provisionerModal')
    .on('show.bs.modal', function (e) {
      bigModal = $('#provisionerModal');
      console.log("provTradeModal shown");
    })
    .on('hidden.bs.modal', function (e) {
      console.log("provTradeModal hidden");
      bigModal = undefined;
    });

  $('#videoModal')
    .on('show.bs.modal', function (e) {
      bigModal = $('#videoModal');
      console.log("videoModal shown");
    })
    .on('hidden.bs.modal', function (e) {
      console.log("videoModal hidden");
      bigModal = undefined;
    });

  $('#forecastModal')
    .on('shown.bs.modal', function (e) {
      console.log("forecastModal shown");
      bigModal = $('#forecastModal');
    })
    .on('hidden.bs.modal', function (e) {
      console.log("forecastModal hidden");
      bigModal = undefined;
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

    /* If the socket is ever disconnected, redirect to the login page */
    socket.on('disconnect', function() {
      window.location.href = '/';
    });

    socket.on('facilitator broadcast', function(msg) {
      var d = new Date();
      var time = d.getHours() + ":" + d.getMinutes() + " ";
      $('#messages').append($('<li>').text(time + msg));
      scrollToBottom();
    });

    socket.on('day zero', function(d) {
      teamname = d['username'];
      $('#team_name').text("Team " + teamname);
      enableMove = false;
      colocated_players = d['colocated_players'];
      $("#teamTradeButton").attr("disabled", colocated_players.length < 1);
    });

    socket.on('server send updateDay', function(d) {
      console.log("server send updateDay");

      curr_day = d['day'];
      if (curr_day >= 1) {
        $("#weatherdetails").attr("hidden", false);
        $("#canyonstatus").attr("hidden", false);
        $("#readybutton").text("Ready for Next Day");
      }
      
      $('#day').text("Day: " + d['day']);
      colocated_players = d['colocated_players'];
      $("#teamTradeButton").attr("disabled", colocated_players.length < 1);
      $("#provTradeButton").attr("disabled", !(trading_posts.includes(curr_space)));

      if (curr_day % 5 == 0) { 
        forecastAvailable = false; 
      }

      if (d['resourcesExpended'] != undefined && curr_day != 1) { 
        updateAlert(d['weather'], d['resourcesExpended'], curr_day); 
      }

      if (d['weather'] != undefined) {
        updateWeather(d['weather']);
      }

      hasMadeMove = false;
      enableMove = !stay1Day && !stay2Day;
      console.log("enableMove is " + enableMove);
      $('#readybutton').prop('disabled', false);

      /* Remove all confirmations from queue */
      removeConfirmsFromQueue();
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
        $('#cancelTradeModal').modal('hide');
        console.log(d['tradeResults']);
      } 
      else {
        console.log("trade cancelled.");
        $('#cancelTradeModal').modal('hide');
        bootbox.hideAll();
        // dialog.modal('hide');
        customAlert("The trade was declined.");
      }
    });


    socket.on('server send giveTradeOffer', function(d){
      $('#teamTradeModal').modal('hide');
      console.log(d);
      
      var reqObj = d['requested_resources'];
      var offerObj = d['offered_resources'];
      
      var request = "";
      var offer = "";

      for (let resource in reqObj) {
        if ( reqObj[resource] > 0){
          request += "&nbsp&nbsp&nbsp&nbsp" + String(reqObj[resource]) + " " + String(resource) + "\n";
        }
        if ( offerObj[resource] > 0){
          offer += "&nbsp&nbsp&nbsp&nbsp" + String(offerObj[resource]) + " " + String(resource) + "\n";
        }
      }


      let alertMsg = d['proposer'] + " wants to trade with you! Would you like to give:<br>" 
        + offer 
        + "<br>in exchange for:<br>" 
        + request;
      customConfirm(alertMsg, function(r) {
        if (checkTrade(reqObj)){
          socket.emit('player send tradeResponse', {accepted: r, trade: d});
          if (r && offerObj["turbo"] > 0) {
            $("#turboRow").attr("hidden", false);
          }
          if (r && offerObj["caves"] > 0) {
            $("#caveRow").attr("hidden", false);
          }
        } 
        else {
          customAlert("Trade could not be completed due to insufficient funds.")
          socket.emit('player send tradeResponse', {accepted: false, trade: d});
        }
      }, true);
    });

    socket.on('server send tradeCancelled', function(d){
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
      endGame();
    });

  },

  _RegisterOutgoing: function() 
  {
    let scope = this;
    socket = this.socket;

    document.getElementById("provTradeButton").onclick = function () { 
      provClicked = true;
      provTradeManager() 
    };
    document.getElementById("teamTradeButton").onclick = function () { 
      teamClicked = true;
      teamTradeManager() 
    };

    document.getElementById("forecastButton").onclick = function() {
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
    };

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
            else if (stay1Day || stay2Day) {
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
  if (curr_day % 5 == 0 && !forecastAvailable) { $("#forecastButton").attr("disabled", true); }
  $('#readybutton').attr('disabled', true);
  enableMove = false;

  if (curr_day > 0 && stay2Day) { 
    stay2Day = false; 
  }
  else if (curr_day > 0 && stay1Day) { 
    stay1Day = false; 
  }

  socket.emit('ready', 
    {
       currentSpace: curr_space,
       currentCoords: [0,0]
    }
  );

  if (curr_space == 4 && !$("#turboRow").attr("hidden") && $('#turbo').text() != "0 Turbo Boost") {
    customAlert("Your turbos have been activated!");
    hasTurbos = true;
    resources["turbo"] -= 1;
    socket.emit('server send updateResources', {resources: resources});
  } 
}

function watchVideo(video) {
  $('#videoModal').modal('hide');

  if (video == "turbos") {
    customConfirm("Are you sure you want to stay another day?", function() {
      watchVideoResult("#tortillaflatsButton", "#goldmineButton", "#turboRow", "turbo", 3);
    });
  }
  if (video == "caves") {
    customConfirm("Are you sure you want to stay another day?", function() {
      watchVideoResult("#goldmineButton", "#tortillaflatsButton", "#caveRow", "caves", 12)
    });
  }
}

function watchVideoResult(resourceButton, otherButton, resourceRow, resource, amount) {
  $(resourceButton).attr("disabled", true);
  $(resourceRow).attr("hidden", false);
  customAlert("Go see the Expedition Leader regarding the new resource you received");
  this.resources[resource] += amount;
  socket.emit('server send updateResources', {resources: this.resources});
  enableMove = false;
  stay2Day = stay1Day;
  stay1Day = true;
  $("#videoExplaination").text("You can watch the remaining video, but you will have to stay in Apache Junction until day 3.");
  if ($(otherButton).attr("disabled")) {
    $("#videoExplaination").text("You have watched both of the videos already.");
  }
}

function scrollToBottom() {
   var message = document.getElementById('messages');
   message.scrollTop = message.scrollHeight;
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
    alert += "You got <br><br><h2><b>1 GOLD</b></h2><br> resource from the mine!<br><br>And you used the following resources:<br>";
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

  floodCanyon(weatherData[1] == "flooded");
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
   toInsert = bootbox.dialog({
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

   toInsert.on('hidden.bs.modal', function () {
      alertConfirmBox = undefined;
      checkAlertConfirmQueue();
   });

   //TODO: cancel trade window.
   //push that to the front of the queue
   toInsert.on('show.bs.modal', function () {
      console.log("alert closed");
   });

   alert_queue.push({
      type: 'ALERT',
      modal: toInsert
   });
   checkAlertConfirmQueue();
};

function customConfirm(message, callbackFunc, ifTrade) {
   toInsert = bootbox.confirm({
      message: message,
      closeButton: false,
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
      },
      show: false
   });

   toInsert.on('show.bs.modal', function() {
      /* Hide the larger modal */
      if (bigModal != undefined) {
        bigModal.modal('hide');
      }
   });

   toInsert.on('hide.bs.modal', function() {
      alertConfirmBox = undefined;
      checkAlertConfirmQueue();
   });

   alert_queue.push({
      type: 'CONFIRM',
      modal: toInsert
   });
   checkAlertConfirmQueue();
}

function checkAlertConfirmQueue() {
  if (alertConfirmBox != undefined || alert_queue.length == 0) return;
  else {
    alertConfirmBox = alert_queue.shift();
    alertConfirmBox.modal.modal('show');
  }
}

function removeConfirmsFromQueue() {
  for (var i = alert_queue.length-1; i >= 0; i--) {
    if (alert_queue[i].type == 'CONFIRM') {
      delete alert_queue[i];
    }
  }
  if (alertConfirmBox != undefined && alertConfirmBox.type == 'CONFIRM') {
    alertConfirmBox.modal.modal('hide');
  }
}


function endGame() {
  $('#messages').append($('<li>').text("Game has ended!"));
  // disable buttons and movement
  $("#teamTradeButton").attr('disabled', true);
  $("#provTradeButton").attr('disabled', true);
  $("#videoTurboButton").attr('disabled', true);
  $("#forecastButton").attr('disabled', true);
  $("#readybutton").attr('disabled', true);
  enableMove = false;

  //Popup of amount of gold
  if (curr_space == 0) {
    if (resources['gold'] > 0) {
      customAlert("<h2>Congratulations!</h2><br><br>You reached the end of the game and you made it back to Apache Junction " +
        "and mined <h2>" + resources['gold'] + "</h2> gold!");
    }
    else {
      customAlert("You reached the end of the game and you made it back to Apache Junction! <br><br>" +
        "But unfortunately you did not manage to mine any gold...");
    }
  }
  else {
    customAlert("You reached the end of the game but unfortunately " +
      "you did not make it back to Apache Junction in time...");
  }
}

