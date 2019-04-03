var myMap = new Map([["Supplies", 7],["Fuel", 7], ["Batteries", 7], ["Tents", 7], ["Spare Tires", 7]]);
var amountBuy = new Map();

var amountSell = new Map();
var constMapOfValues = new Map([["Supplies", 20],["Fuel", 10], ["Batteries", 10], ["Tents", 10], ["Spare Tires", 30]]);
function sellTableBuilder(){

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
for ( let [r, a] of myMap){
   
    table+= `
            <tr>
                <th scope="row">
                `
    table+= String(r);
    table+= `
            </th>
                <td><button type="button" class="refresher btn btn-light" onClick = "addItemSell('`
    table += String(r);
    table +=    `')">+</button></td>
                <td><button type="button" class="refresher btn btn-light" onClick = "subtractItemSell('`
    table += String(r);
    table += `')">-</button></td>
                <td>
            `;
    table += String(a); //Current Amount
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
function buyTableBuilder(){
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
                table += String(r);
                table +=`')">+</button></td>
                <td><button type="button" class="btn btn-light" onClick = "subtractItemBuy('`; 
                table+= String(r);
                table+=`')">-</button></td>
                <td>`
                table += String(amountBuy.get(r));//amount
                table += `</td>
                <td>
                `
                table += String(a); // value
                
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
for ( let [r,a] of myMap){
    amountSell.set(String(r), 0);
    amountBuy.set(String(r), 0);
}

sellTable = sellTableBuilder();
buyTable = buyTableBuilder();

document.getElementById("provTable").innerHTML += sellTable;
document.getElementById("buyTable").innerHTML += buyTable
}

function teamTradeManager(){
    for ( let [r,a] of myMap){
        amountSell.set(String(r), 0);
        amountBuy.set(String(r), 0);
    }
    offerTable = sellTableBuilder();
    requestTable = buyTableBuilder();

document.getElementById("offerTable").innerHTML += offerTable;
document.getElementById("requestTable").innerHTML += requestTable

}

function addItemBuy(resourceName){
    amountBuy.set(resourceName, amountBuy.get(resourceName) + 1);
    
    var tableContainer = document.getElementById("buyTable");
    tableContainer.innerHTML= buyTableBuilder();
}

function subtractItemBuy(resourceName){
    if (amountBuy.get(resourceName) > 0){
        amountBuy.set(resourceName, amountBuy.get(resourceName) - 1);
    
    var tableContainer = document.getElementById("buyTable");
    tableContainer.innerHTML= buyTableBuilder(); 
    
    }
}

function addItemSell(resourceName){
    if (amountSell.get(resourceName) < myMap.get(resourceName)){
   amountSell.set(resourceName, amountSell.get(resourceName) + 1);
   var tableContainer = document.getElementById("provTable");
    tableContainer.innerHTML= sellTableBuilder(); 
    }
}

function subtractItemSell(resourceName){
    if (amountSell.get(resourceName) > 0){
    amountSell.set(resourceName, amountSell.get(resourceName) - 1);
    
    var tableContainer = document.getElementById("provTable");
    tableContainer.innerHTML= sellTableBuilder(); 
    }
}