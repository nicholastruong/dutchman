var myObj = new Object();
var amountBuy = new Object();
var targetID="";
var amountSell = new Object();
var constMapOfValues = {
    "supplies": 20, 
    "fuel": 10, 
    "batteries": 10,
    "tents": 10, 
    "tires": 30,
    "cash": 1,
    "caves": 0,
    "turbo": 0,
    "gold": 0};
var buyTotal = 0;
var sellTotal=0;
var showCave = false;

function sellTableBuilder(tableType){
    var buttonClickParam = "";
    if (tableType ==2){
        buttonClickParam = "offerTable"
    } else { buttonClickParam = "sellTable"}

var table = `<thead>
              <tr>
                <th scope="col">Resource</th>
                <th scope="col"></th>
                <th scope="col"></th>
                <th scope="col">Current Amount</th>
                <th scope="col" class = "colorCol">Amount Trading</th>
                <th scope="col">Value</th>
                <th scope="col">Value Trading</th>
              </tr>
            </thead>
            <tbody>`

sellTotal = 0;
var myObj = this.resources;
for ( let r in myObj){
    if ( r =="turbo"){
    } else{
    table+= `
            <tr>
                <th scope="row">
                `
    table+= String(r);
    table+= `
            </th>
                <td><button type="button" class="refresher btn btn-light" onClick = "addItemSell('`
                table += buttonClickParam;
                table += "','";
                table += String(r);
    table +=    `')">+</button></td>
                <td><button type="button" class="refresher btn btn-light" onClick = "subtractItemSell('`
                table += buttonClickParam;
                table += "','";
                table += String(r);
    table += `')">-</button></td>
                <td>
            `;
    table += myObj[r]; //Current Amount
    table += `</td><td class = "colorCol">`;
    table += String(amountSell[r]); //Amount Trading
    table += `</td><td>$`;
    table += String(constMapOfValues[r]);
    table += `</td><td>`;
    var itemTot = amountSell[r] * constMapOfValues[r];
    table += String(itemTot);
    table += `</td></tr>`;
    sellTotal += itemTot;
    }
}

table += `<tr>
            <th scope="row"></th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td id = colorCol>Total $ Trading</td>
            <td id = colorCol>$`

table += sellTotal;
table += `</td>
            </tr>
            </tbody>`
return table;

}
function buyTableBuilder(tableType){
    var buttonClickParam = "";
    if (tableType ==2){
        buttonClickParam = "requestTable"
    } else { buttonClickParam = "buyTable"}
    buyTotal =0;
    var table = `<thead>
              <tr>
                <th scope="col">Resource</th>
                <th scope="col"></th>
                <th scope="col"></th>
                <th class = "colorCol" scope="col">Amount Buying</th>
                <th scope="col">Value</th>
                <th scope="col">Total Value</th>
              </tr>
            </thead>
            <tbody>
            `
            
    for (let r in constMapOfValues){
        if ( r =="turbo"){
        } else{
                table += `<tr>
                <th scope="row">
                `
                table += String(r);// resourceName
                table += `</th>
                <td><button type="button" class="btn btn-light" onClick = "addItemBuy('`;
                table += buttonClickParam;
                table += "','";
                table += String(r);
                table +=`')">+</button></td>
                <td><button type="button" class="btn btn-light" onClick = "subtractItemBuy('`;
                table += buttonClickParam;
                table += "','";
                table+= String(r);
                table+=`')">-</button></td>
                <td class = "colorCol">`
                table += String(amountBuy[r]);//amount
                table += `</td>
                <td>
                `
                table += "$" + String(constMapOfValues[r]); // value
                
                table += `</td>
                <td>
                `
                var itemTot = amountBuy[r] * constMapOfValues[r];
                table += String(itemTot); //tOtal Value
                buyTotal += itemTot;
        }
    }

    table += `<tr>
            <th scope="row"></th>
            <td></td>
            <td></td>
            <td></td>
            <td id = colorCol>Total $ Buying</td>
            <td id = colorCol>$`

    table += buyTotal;

table += `</td>
            </tr>
            </tbody>
            `

    return table;
}
function provTradeManager(){
//INITIALIZE amountAdded map
let myObj = this.resources;
for ( let r in myObj){
    amountSell[r]= 0;
    amountBuy[r]= 0;
}

sellTable = sellTableBuilder(1);
buyTable = buyTableBuilder(1);

if ( document.getElementById("sellTable") != null){
    document.getElementById("sellTable").innerHTML = sellTable;
}
if ( document.getElementById("buyTable") != null){
    document.getElementById("buyTable").innerHTML = buyTable;
}

document.getElementById("buyTable").innerHTML = buyTable;

$('#provTradeModal').modal('show');

}

function teamTradeManager(){
let colocated_players = this.colocated_players;
let myObj = this.resources;
let teamHTML = "<select>";

for ( n in colocated_players){
    teamHTML += "<option value ='";
    teamHTML += colocated_players[n].username;
    teamHTML += "'>";
    teamHTML += String(colocated_players[n].username);
    teamHTML += "</option>";
}
teamHTML += "</select>";
document.getElementById("teamPickerTitle").innerHTML += teamHTML;
    for ( let r in myObj){
        amountSell[r] = 0;
        amountBuy[r] =0;
    }
    
    offerTable = sellTableBuilder(2);
    requestTable = buyTableBuilder(2);

document.getElementById("offerTable").innerHTML += offerTable;
document.getElementById("requestTable").innerHTML += requestTable
$('#cancelTradeModal').modal('hide');
}

//FUNCTIONS THAT HANDLE BUTTON LOGIC IN TABLES

function addItemSell(tradeType, resourceName){ //LEFT Table offerTable or sellTable
    let myObj = this.resources;
    var type=1;
    if (tradeType=="offerTable"){type=2}
    
    if (amountSell[resourceName] < myObj[resourceName]){
   amountSell[resourceName]++;
   var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= sellTableBuilder(type); 
    }
}

function subtractItemSell(tradeType, resourceName){ //LEFT Table
    var type=1;
    if (tradeType=="offerTable"){type=2}
    if (amountSell[resourceName] > 0){
    amountSell[resourceName]--;
    
    var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= sellTableBuilder(type); 
    }
}

function addItemBuy(tradeType, resourceName){ //RIGHT requestTable or buyTable
   var type=1;
    if (tradeType=="requestTable"){type=2}
    amountBuy[resourceName]++;
    
    var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= buyTableBuilder(type);
}

function subtractItemBuy(tradeType, resourceName){ //RIGHT Table
    var type=1;
    if (tradeType=="requestTable"){type=2}
    if (amountBuy[resourceName] > 0){
        amountBuy[resourceName]--;
    
    var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= buyTableBuilder(type); 
    
    }
}

function initiateTeamTrade(){
    let socket = this.socket;
    let id = socket.io.engine.id;
    targetID = $('#teamPickerTitle').find(":selected").text();
    
    let trade = {
        proposerID : id,
        targetID : targetID,
        offered_resources: this.amountSell,
        requested_resources: this.amountBuy}
        
    socket.emit('player send tradeOffer', {trade: trade}, function(){
        //REVERT ALL OBJs HOLDING RESOURCE STATUS TO 0
    
    Object.keys(amountBuy).forEach(v => myObj[v] = 0);
    Object.keys(amountSell).forEach(v => myObj[v] = 0);
    });

    $('#teamTradeModal').modal('hide');
    $('#cancelTradeModal').modal('show');

    var tableContainerBuy = document.getElementById("requestTable");
    tableContainerBuy.innerHTML= buyTableBuilder(2); 
    var tableContainerSell = document.getElementById("offerTable");
    tableContainerSell.innerHTML= sellTableBuilder(2); 
    
}

function cancelTrade(){
    socket.emit('player send cancelTrade', {proposerID: socket.io.engine.id, targetID: targetID});
    $('#cancelTradeModal').modal('hide');
}

function finishProvTrade(){
    let socket = this.socket;
    let myObj = this.resources;
    if (this.buyTotal <= this.sellTotal && (sellTotal> 0) && (buyTotal>0)){
    for ( let buy in myObj){
        myObj[buy] -=amountSell[buy];
        myObj[buy] +=amountBuy[buy];
    }
   
    socket.emit('server send updateResources', {resources: myObj});
    
    socket.on('connect', function(){
        var id = this.id;
    socket.emit(id, 'server send updateResources', myObj);
    });

    //REVERT ALL MAPS HOLDING RESOURCE STATUS TO 0
    Object.keys(amountBuy).forEach(v => myObj[v] = 0);
    Object.keys(amountSell).forEach(v => myObj[v] = 0);

    var tableContainerBuy = document.getElementById("buyTable");
    tableContainerBuy.innerHTML= buyTableBuilder(1); 
    var tableContainerSell = document.getElementById("sellTable");
    tableContainerSell.innerHTML= sellTableBuilder(1); 
    $('#provTradeModal').modal('hide');}
    else if (sellTotal == 0){
        $("#tradeWarning").html("You must trade something!");
    }
    else{
        $("#tradeWarning").html("Amount selling must be equal or greater than amount buying.");
    }
}



