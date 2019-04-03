var myMap = new Map();
var amountBuy = new Map();

var amountSell = new Map();
var constMapOfValues = new Map([["supplies", 20],["fuel", 10], ["batteries", 10], ["tents", 10], ["tires", 30], ["cash", 1], ["caves", 0], ["turbo", 0], ["gold", 0]]);

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
                <th scope="col">Amount Trading</th>
                <th scope="col">Value</th>
                <th scope="col">Value Trading</th>
              </tr>
            </thead>
            <tbody>`

var total = 0;
var myMap = this.resources;
for ( let r in myMap){
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
    table += myMap[r]; //Current Amount
    table += `</td><td>`;
    table += String(amountSell.get(r)); //Amount Trading
    table += `</td><td>$`;
    table += String(constMapOfValues.get(r));
    table += `</td><td>`;
    var itemTot = amountSell.get(r) * constMapOfValues.get(r);
    table += String(itemTot);
    table += `</td></tr>`;
    total += itemTot;
}

table += `<tr>
            <th scope="row"></th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>Total $ Trading</td>
            <td>$`

table += total;
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
    var total =0;
    var table = `<thead>
              <tr>
                <th scope="col">Resource</th>
                <th scope="col"></th>
                <th scope="col"></th>
                <th scope="col">Amount Buying</th>
                <th scope="col">Value</th>
                <th scope="col">Total Value</th>
              </tr>
            </thead>
            <tbody>
            `
            
    for (let [r,a] of constMapOfValues){
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
                <td>`
                table += String(amountBuy.get(r));//amount
                table += `</td>
                <td>
                `
                table += "$" + String(a); // value
                
                table += `</td>
                <td>
                `
                var itemTot = amountBuy.get(r) * constMapOfValues.get(r);
                table += String(itemTot); //tOtal Value
                total += itemTot;
            
    }

    table += `<tr>
            <th scope="row"></th>
            <td></td>
            <td></td>
            <td></td>
            <td>Total $ Buying</td>
            <td>$`

    table += total;

table += `</td>
            </tr>
            </tbody>
            `

    return table;
}
function provTradeManager(){
//INITIALIZE amountAdded map
let myMap = this.resources;
for ( let r in myMap){
    amountSell.set(String(r), 0);
    amountBuy.set(String(r), 0);
}

sellTable = sellTableBuilder(1);
buyTable = buyTableBuilder(1);

document.getElementById("sellTable").innerHTML += sellTable;
document.getElementById("buyTable").innerHTML += buyTable;
}

function teamTradeManager(){
let myMap = this.resources;
    for ( let r in myMap){
        amountSell.set(String(r), 0);
        amountBuy.set(String(r), 0);
    }
    console.log(amountBuy);
    offerTable = sellTableBuilder(2);
    requestTable = buyTableBuilder(2);

document.getElementById("offerTable").innerHTML += offerTable;
document.getElementById("requestTable").innerHTML += requestTable

}

//FUNCTIONS THAT HANDLE BUTTON LOGIC IN TABLES

function addItemSell(tradeType, resourceName){ //LEFT Table offerTable or sellTable
    let myMap = this.resources;
    var type=1;
    if (tradeType=="offerTable"){type=2}
    
    if (amountSell.get(resourceName) < myMap[resourceName]){
   amountSell.set(resourceName, amountSell.get(resourceName) + 1);
   var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= sellTableBuilder(type); 
    }
}

function subtractItemSell(tradeType, resourceName){ //LEFT Table
    var type=1;
    if (tradeType=="offerTable"){type=2}
    if (amountSell.get(resourceName) > 0){
    amountSell.set(resourceName, amountSell.get(resourceName) - 1);
    
    var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= sellTableBuilder(type); 
    }
}

function addItemBuy(tradeType, resourceName){ //RIGHT requestTable or buyTable
   var type=1;
    if (tradeType=="requestTable"){type=2}
    amountBuy.set(resourceName, amountBuy.get(resourceName) + 1);
    
    var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= buyTableBuilder(type);
}

function subtractItemBuy(tradeType, resourceName){ //RIGHT Table
    var type=1;
    if (tradeType=="requestTable"){type=2}
    if (amountBuy.get(resourceName) > 0){
        amountBuy.set(resourceName, amountBuy.get(resourceName) - 1);
    
    var tableContainer = document.getElementById(tradeType);
    tableContainer.innerHTML= buyTableBuilder(type); 
    
    }
}

function initiateTeamTrade(){
    let socket = this.socket;
    socket.on('connect', function(){
        var playerID = socket.io.engine.id;
        let trade = {
            proposerID : id,
            targetID : fillin,
            offered_resources: this.amountBuy,
            requested_resources: this.amountSell
        }
        socket.emit('player send tradeOffer', {trade: trade});
    });
}

function finishProvTrade(){
    let socket = this.socket;
    let myMap = this.resources;
    for ( let buy in myMap){
        myMap[buy] -=amountSell.get(buy);
        myMap[buy] +=amountBuy.get(buy);
    }

    console.log(myMap);
    socket.emit(socket.io.engine.id, 'server send updateResources', myMap);
}
