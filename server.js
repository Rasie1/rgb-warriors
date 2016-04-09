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
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'getX', 'getY', 'getId', 'kill', 'updateState',
											'updateHP', 'createItem', 'activateItem', 'pickUpItem']});

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
	console.log("handshake()")
	console.log("enemy="+id)
	var enemy
	for (var c in clients) if (clients[c].id==id) enemy=clients[c]
	for (var c in clients) if (clients[c].id!=id) clients[c].remote.spawnEnemy(id,x,y)			// я это
	for (var c in clients) if (clients[c].id!=id) {
		console.log("ОТПРАВИЛИ: "+clients[c].lastX+" - "+clients[c].lastY)
		enemy.remote.spawnEnemy(clients[c].id,clients[c].lastX,clients[c].lastY)	// починю
		console.log("clients[c].alreadyId="+clients[c].id+" getId="+clients[c].remote.getId()) // аще непонятно почему
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
		console.log("handleKeys laststate.x="+clients[c].laststate.x)
		clients[c].lastX = x
		clients[c].lastY = y
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

eurecaServer.exports.createItem = function(x, y, elementForDrop)
{
	for (var c in clients)
		clients[c].remote.createItem(x, y, elementForDrop);
}

eurecaServer.exports.activateItem = function(index, x, y)
{
	for (var c in clients)
		clients[c].remote.activateItem(index, x, y);
}
/*
eurecaServer.exports.pickUpItem = function(itemSprite)
{
	for (var c in clients)
		clients[c].remote.pickUpItem(itemSprite);
}
*/
server.listen(8000);
