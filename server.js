var mapWidth  =  2000;
var mapHeight =  2000;

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
	'createObstacles',
	'castCloseAttack',
	'castFreeze',
	'doLeap',
    'doSpike',
    'scaleSpeed'
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
	var outOfPlaces=false;
	while(isOccupied==true && !outOfPlaces){
		if(typeof obstaclesPositions[i] != 'undefined'){
			if(!obstaclesPositions[i].occupied){
				isOccupied=false;
				x = obstaclesPositions[i].x;
				y = obstaclesPositions[i].y;
			}
			i++
		}
		else{
			outOfPlaces = true;
		};
	}

	if(!outOfPlaces){
		remote.setId(conn.id,x,y)
	}
	else{
		remote.setId(conn.id,0,0)
	}

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


eurecaServer.exports.handshake = function(id,x,y,r,g,b)
{
	var enemy=clients[id]
	for (var c in clients)
		if (c!=id) {
			clients[c].remote.spawnEnemy(id,x,y,r,g,b)
			var cl = clients[c]
			enemy.remote.spawnEnemy(c,cl.lastX,cl.lastY,cl.r,cl.g,cl.b)
		}

}


//be exposed to client side
eurecaServer.exports.handleKeys = function (keys,x,y,r,g,b) {
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
        clients[c].r = r;
        clients[c].g = g;
        clients[c].b = b;
    }
}

eurecaServer.exports.handleTouchInput = function (input) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients)
    {
        // var remote = clients[c].remote;
        // remote.updateState(updatedClient.id, keys);
        // //keep last known state so we can send it to new connected clients
        // clients[c].laststate = keys;
        // clients[c].lastX = x;
        // clients[c].lastY = y;
        // clients[c].r = r;
        // clients[c].g = g;
        // clients[c].b = b;
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
		var outOfPlaces=false;
		while(isOccupied==true && !outOfPlaces){
			if(typeof obstaclesPositions[i] != 'undefined'){
				if(!obstaclesPositions[i].occupied){
					isOccupied=false;
					x = obstaclesPositions[i].x;
					y = obstaclesPositions[i].y;
				}
				i++
			}
			else{
				outOfPlaces = true;
			};
		}

		if(!outOfPlaces){
			for (var c in clients){
				clients[c].remote.respawnPlayer(id,x,y)
			}
		}
		else{
			for (var c in clients){
				clients[c].remote.respawnPlayer(id,0,0)
			}
		}
	},3000)
}

eurecaServer.exports.updateHP = function(id, difHP, attackerId)
{
	for (var c in clients)
		clients[c].remote.updateHP(id, difHP, attackerId);
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
				//console.log('List lenght: ',itemsList.length,'; Item id: ',itemID,';List: ',itemsList)
				if(typeof itemsList[i].gridPosition !='undefined')
					itemsList[i].gridPosition.occupied = false;
				index = itemsList.indexOf(itemsList[i]);
				itemsList = itemsList.slice(0,index).concat(itemsList.slice(index+1,itemsList.length));
			}
		}
		//console.log(itemsList)
	}
}


eurecaServer.exports.castCloseAttack = function(id, target)
{
	for (var c in clients)
		clients[c].remote.castCloseAttack(id, target);
}
eurecaServer.exports.castFreeze = function(id, time)
{
    for (var c in clients) {
        clients[c].remote.scaleSpeed(id, 0.01)
    }
    setTimeout(function() {
            for (var c in clients) {
                 clients[c].remote.scaleSpeed(id, 100.0)
            }
        },
        time * 1000)
}

eurecaServer.exports.doLeap = function(id, new_x, new_y)
{
    for (var c in clients)
        clients[c].remote.doLeap(id, new_x, new_y);
}

eurecaServer.exports.doSpike = function(id, x, y, time, damage)
{
    for (var c in clients)
        clients[c].remote.doSpike(id, x, y, time, damage);
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
	var possibleOffsetX=0;
	var possibleOffsetY=0;
	if(Math.floor(Math.random()*4)!=0){
		var spriteKind = Math.floor(Math.random()*2);
		if(spriteKind==0){
			possibleOffsetX=200-67;
			possibleOffsetY=200-127;
		}
		else{
			possibleOffsetX=200-66;
			possibleOffsetY=200-67;
		}
		obstaclesList[i].spriteType = 'cactus'+spriteKind;
	}
	else{
		possibleOffsetX=200-143;
		possibleOffsetY=200-128;
		obstaclesList[i].spriteType = 'stone';
	}
	obstaclesList[i].x = obstaclesPositions[i].x+Math.round(Math.random()*possibleOffsetX);
	obstaclesList[i].y = obstaclesPositions[i].y+Math.round(Math.random()*possibleOffsetY);
	obstaclesPositions[i].occupied = true;
}
// console.log(obstaclesPositions)

//item spawn
setInterval(function(){
	if(itemsList.length<30){
		shuffle(obstaclesPositions);
		var isOccupied = true;
		var i = 0;
		var gridPosition;
		var outOfPlaces=false;	
		var itemX,itemY;

		while(isOccupied==true && !outOfPlaces){
			//console.log(obstaclesPositions,i)
			if(typeof obstaclesPositions[i] != 'undefined'){
				if(!obstaclesPositions[i].occupied){
					isOccupied=false;
					itemX = obstaclesPositions[i].x+Math.round(Math.random()*139);
					itemY = obstaclesPositions[i].y+Math.round(Math.random()*139);
					obstaclesPositions[i].occupied = true;
					gridPosition = obstaclesPositions[i];
				}
				i++
			}
			else{
				outOfPlaces=true;
			}
		}
		if(!outOfPlaces){
			elementForDrop = (itemIdCounter+1)%3+1;
			//console.log(elementForDrop)
			for (var c in clients){
				//console.log(itemIdCounter,itemsList.length);
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
			
		}
	}
},1000)
server.listen(8000, '0.0.0.0');
