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
	'updateState',
	'updateRotation',
	'updateHP', 
	'makeItem', 
	'dropItem',
	'pickUpItem']
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
	remote.setId(conn.id);	
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
	console.log("handshake()");
	console.log("enemy="+id);
	var enemy=clients[id];
	for (var c in clients){
		if (c!=id){
			clients[c].remote.spawnEnemy(id,x,y);
			enemy.remote.spawnEnemy(c,clients[c].lastX,clients[c].lastY)
		}
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
}

eurecaServer.exports.updateHP = function(id, difHP)
{
	for (var c in clients)
		clients[c].remote.updateHP(id, difHP);
}

eurecaServer.exports.dropItem = function(x, y, elementForDrop)
{
	elementForDrop = Math.round(Math.random()*2)+1;
	for (var c in clients)
		clients[c].remote.makeItem(x, y, elementForDrop);
}

/*
eurecaServer.exports.pickUpItem = function(itemSprite)
{
	for (var c in clients)
		clients[c].remote.pickUpItem(itemSprite);
}
*/



setInterval(function(){
	itemX = Math.random() * mapWidth;
	itemY = Math.random() * mapHeight;
	elementForDrop = Math.round(Math.random()*2)+1;
	for (var c in clients){		
		clients[c].remote.makeItem(itemX, itemY, elementForDrop);
	}
},5000)
server.listen(8000);

