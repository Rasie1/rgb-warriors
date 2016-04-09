var mapX   = 0;
var mapWidth  =  2000;
var mapY    = 0;
var mapHeight =  2000;

var cameraDeadzoneWidth = 0.25;
var cameraDeadzoneHeight = 0.25; 

var playerSpeedX = 300;
var playerSpeedY = 300;

var maxGameWidth = 3000; 
var maxGameHeight = 3000;

var itemX;
var itemY;
var elementForDrop;

var itemsList = [];
var itemIdCounter = 0;

var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));
// app.use(express.static("./js/phaser.js"));
// app.use(express.static("./js/tanks.js"));

//we'll keep clients data here
var clients = {};
  
//get EurecaServer class
var Eureca = require('eureca.io');

//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:[
	'setId', 
	'spawnEnemy', 
	'getX', 
	'getY', 
	'getId', 
	'kill',
	'respawnPlayer',
	'updateState',
	'updateRotation',
	'updateHP', 
	'makeItem', 
	'dropItem',
	'pickUpItem',
	'createObstacles'
]
});

//attach eureca.io to our http server
eurecaServer.attach(server);




//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
	
	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	clients[conn.id] = {id:conn.id, remote:remote}

	//here we call setId (defined in the client side)
	shuffle(obstaclesPositions);
	var isOccupied = true;
	var i = 0;
	var x,y;
	while(isOccupied==true){
		//console.log(obstaclesPositions,i)
		if(!obstaclesPositions[i].occupied){
			isOccupied=false;
			x = obstaclesPositions[i].x;
			y = obstaclesPositions[i].y;
		}
		i++
	}
	remote.setId(conn.id,x,y);	

	if(itemsList.length){
		for(i=0;i<itemsList.length;i++){	
			if(typeof itemsList[i] != 'undefined'){
				clients[conn.id].remote.makeItem(itemsList[i].x, itemsList[i].y, itemsList[i].element,itemsList[i].id);
			}
		}
	};
	clients[conn.id].remote.createObstacles(obstaclesList);

});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
	
	var removeId = clients[conn.id].id;
	
	delete clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		
		//here we call kill() method defined in the client side
		remote.kill(conn.id);
	}	
});


eurecaServer.exports.handshake = function(id,x,y)
{
	var enemy=clients[id]
	for (var c in clients)
		if (c!=id) {
			clients[c].remote.spawnEnemy(id,x,y)
			enemy.remote.spawnEnemy(c,clients[c].lastX,clients[c].lastY)
		}
	
}


//be exposed to client side
eurecaServer.exports.handleKeys = function (keys,x,y) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);
		//keep last known state so we can send it to new connected clients
		clients[c].laststate = keys;
		clients[c].lastX = x;
		clients[c].lastY = y;
	}
}	
eurecaServer.exports.handleRotation = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		remote.updateRotation(updatedClient.id, keys);
		
		//keep last known state so we can send it to new connected clients
		clients[c].laststate = keys;
	}
}
eurecaServer.exports.killPlayer = function(id)
{
	for (var c in clients)
		clients[c].remote.kill(id);
	setTimeout(function(){
		shuffle(obstaclesPositions);
		var isOccupied = true;
		var i = 0;
		var x,y;
		while(isOccupied==true){
			if(!obstaclesPositions[i].occupied){
				isOccupied=false;
				x = obstaclesPositions[i].x;
				y = obstaclesPositions[i].y;
			}
			i++
		}
		for (var c in clients){
			clients[c].remote.respawnPlayer(id,x,y)
		}
	},3000)
}

eurecaServer.exports.updateHP = function(id, difHP)
{
	for (var c in clients)
		clients[c].remote.updateHP(id, difHP);
}

eurecaServer.exports.dropItem = function(x, y, elementForDrop)
{
	elementForDrop = Math.round(Math.random()*2)+1;
	for (var c in clients){
		clients[c].remote.makeItem(x, y, elementForDrop);
	}
	itemsList.push({
		x:x,
		y:y,
		element:elementForDrop,
		id:itemIdCounter
	});
	itemIdCounter++;
}

eurecaServer.exports.pickUpItem = function(itemID)
{

	for(i=0;i<itemsList.length;i++){
		
		if(typeof itemsList[i] != 'undefined'){
			if(itemID==itemsList[i].id){
				if(typeof itemsList[i].gridPosition !='undefined')
					itemsList[i].gridPosition.occupied = false;
				index = itemsList.indexOf(itemsList[i]);
				itemsList = itemsList.slice(1,index).concat(itemsList.slice(index+1,itemsList.length));
			}
		}
		//console.log(itemsList)
	}
}





//obstacles
var obstaclesPositions = [];
var obstaclesList = [];

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

for (var i = 0; i < Math.round(mapWidth/200); i++) {
    for (var j = 0; j < Math.round(mapHeight/200); j++) {
        obstaclesPositions.push({
            x:i * 200,
            y:j * 200,
            occupied: false
            
        });
    }
};
shuffle(obstaclesPositions)

for(i=0;i<25;i++){
	obstaclesList[i]={};
	obstaclesList[i].x = obstaclesPositions[i].x;
	obstaclesList[i].y = obstaclesPositions[i].y;
	obstaclesList[i].spriteType = i%2;
	if(Math.floor(Math.random()*4)!=0){
		obstaclesList[i].spriteType = 'cactus'+Math.floor(Math.random()*2);
	}
	else{
		obstaclesList[i].spriteType = 'stone';
	}
	obstaclesPositions[i].occupied = true;
}
console.log(obstaclesPositions)

//item spawn
setInterval(function(){
	if(itemsList.length<30){
		shuffle(obstaclesPositions);
		var isOccupied = true;
		var i = 0;
		var gridPosition;
		while(isOccupied==true){
			//console.log(obstaclesPositions,i)
			if(!obstaclesPositions[i].occupied){
				isOccupied=false;
				itemX = obstaclesPositions[i].x;
				itemY = obstaclesPositions[i].y;
				obstaclesPositions[i].occupied = true;
				gridPosition = obstaclesPositions[i];
			}
			i++
		}
		elementForDrop = Math.round(Math.random()*2)+1;
		for (var c in clients){		
			clients[c].remote.makeItem(itemX, itemY, elementForDrop,itemIdCounter);
		};
		itemsList.push({
			x:itemX,
			y:itemY,
			element:elementForDrop,
			id:itemIdCounter,
			gridPosition:gridPosition
		})
		itemIdCounter++;
		//console.log(itemsList,itemIdCounter);
	}
},5000)
server.listen(8000);