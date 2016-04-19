var mapWidth  =  2000;
var mapHeight =  2000;

var elementForDrop;

var itemsList = [];
var itemIdCounter = 0;

var colors = [
    0x99FFFF,
    0xFF9E9E,
    0xFFFB62,
    0xAFFF87,
    0x9AFFEA,
    0xA9C2FF,
    0xE492FF
];

var botCounter = 0;
var bots = {};

var scoreBoard = [];

var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));
// app.use(express.static("./js/phaser.js"));
// app.use(express.static("./js/tanks.js"));

//we'll keep clients data here
var clients = {};

//get Server class
var Eureca = require('eureca.io');

//create an instance of Server
var Server = new Eureca.Server({allow:[
	'setId',
	'spawnEnemy',
	'kill',
	'respawnPlayer',
	'updateState',
	'updateHP',
	'makeItem',
	'reMakeItems',
	'dropItem',
	'pickUpItem',
	'createObstacles',
	'castProjectile',
	'castCloseAttack',
	'castFreeze',
	'doLeap',
    'doSpike',
    'scaleSpeed',
    'freezePlayer',
    'spawnBot',
    'updateBot'
]
});

//attach eureca.io to our http server
Server.attach(server);




//eureca.io provides events to detect clients connect/disconnect

//detect client connection
Server.onConnect(function (conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = Server.getClient(conn.id);

	//register the client
	clients[conn.id] = {id:conn.id, remote:remote}

	//add player to scoreboard
	scoreBoard[conn.id] = {
		id:conn.id,
		kills:0,
		deaths:0,
		suicides:0
	}

    var color = colors[Math.floor(Math.random()*colors.length)];
    clients[conn.id].color = color;

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

	Server.exports.sendAllItems(conn.id,true);
	clients[conn.id].remote.createObstacles(obstaclesList);
	for(b in bots){
		var bot = bots[b];
		remote.spawnBot(bot.id,bot.x,bot.y,bot.ownerId)
	}

});

//detect client disconnection
Server.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);

	var removeId = clients[conn.id].id;

	var botsToKill = [];
	for(b in bots){
		if(bots[b].ownerId == conn.id){
			botsToKill.push(bots[b].id)
			delete bots[b]
			delete scoreBoard[b]
		}
	}
	console.log('Killing bots: ',botsToKill);

	delete clients[conn.id];
	delete scoreBoard[conn.id];
	for (var c in clients)
	{
		var remote = clients[c].remote;

		//here we call kill() method defined in the client side
		remote.kill(conn.id);

		//kill bots
		
		for(i=0;i<botsToKill.length;i++){
			remote.kill(botsToKill[i]);
		}
	}
});


Server.exports.handshake = function(id,x,y,r,g,b,color)
{
	var enemy=clients[id]
	for (var c in clients)
		if (c!=id) {
			clients[c].remote.spawnEnemy(id,x,y,r,g,b,color)
			var cl = clients[c]
			enemy.remote.spawnEnemy(c,cl.lastX,cl.lastY,cl.r,cl.g,cl.b,clients[c].color)
		}

}


//be exposed to client side
Server.exports.handleKeys = function (keys,x,y,r,g,b,id) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients)
    {
        var remote = clients[c].remote;
        if(c != id)
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

Server.exports.handleTouchInput = function (input) {
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
Server.exports.killPlayer = function(id,killerId)
{
	if(!clients[id] && !bots[id])
		return;
	if(scoreBoard[id] && scoreBoard[killerId]){
		var victim = scoreBoard[id];
		var killer = scoreBoard[killerId];
		victim.deaths++;
		if(killer.id == victim.id){
			victim.kills--;
			victim.suicides++;
		}
		else{
			killer.kills++;
		};
		var realScoreBoard = [];
		var i = 0;
		for(p in scoreBoard){
			realScoreBoard[i] = [];
			for(e in scoreBoard[p])
				realScoreBoard[i][e] = scoreBoard[p][e];
			i++;
		}
		realScoreBoard = realScoreBoard.sort(function (a, b) {
		  if (a.kills < b.kills) {
		    return 1;
		  }
		  if (a.kills > b.kills) {
		    return -1;
		  }
		  if (a.deaths < b.deaths) {
		    return -1;
		  }
		  if (a.deaths > b.deaths) {
		    return 1;
		  }
		  if (a.suicides < b.suicides) {
		    return -1;
		  }
		  if (a.suicides > b.suicides) {
		    return 1;
		  }
		  return 0;
		});
		console.log('-------------Scoreboard-------------')
		for(p=0;p<realScoreBoard.length;p++){
			console.log(realScoreBoard[p].id+': '+realScoreBoard[p].kills+'/'+realScoreBoard[p].deaths+' '+realScoreBoard[p].suicides)
		}
		console.log('------------------------------------')
	};

	for (var c in clients)
		clients[c].remote.kill(id);
	setTimeout(function(){
		if(!clients[id] && !bots[id])
			return;
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

Server.exports.updateHP = function(id, difHP, attackerId,playAnim)
{
	if(typeof playAnim == 'undefined')
		var playAnim = false;
	for (var c in clients)
		clients[c].remote.updateHP(id, difHP, attackerId,playAnim);
}

Server.exports.dropItem = function(x, y, elementForDrop)
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

Server.exports.pickUpItem = function(itemID,element,playerId)
{
	for (var c in clients)
		clients[c].remote.pickUpItem(itemID,element,playerId);
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
Server.exports.sendAllItems = function(playerId,isOnconnect){
	if(itemsList.length){
		var itemsToSend = [];
		for(i=0;i<itemsList.length;i++){
			if(typeof itemsList[i] != 'undefined'){
				itemsToSend.push({
					x:itemsList[i].x,
					y:itemsList[i].y,
					element:itemsList[i].element,
					id:itemsList[i].id
				})
			}
		}
		if(itemsToSend.length){
			if(isOnconnect)
				clients[playerId].remote.makeItem(itemsToSend)
			else
				clients[playerId].remote.reMakeItems(itemsToSend)
		}
	};
}

Server.exports.castProjectile = function(characterId,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,spellPower,tx,ty){
	for (var c in clients)
		clients[c].remote.castProjectile(characterId,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,spellPower,tx,ty);
}
Server.exports.castCloseAttack = function(id, target)
{
	for (var c in clients)
		clients[c].remote.castCloseAttack(id, target);
}
Server.exports.castFreeze = function(id, time,speedMultiplier)
{
    for (var c in clients) {
        clients[c].remote.freezePlayer(id,0.5)
    }
    setTimeout(function() {
            for (var c in clients) {
                 clients[c].remote.freezePlayer(id,1)
            }
        },
        time * 1000)
}

Server.exports.doLeap = function(id, new_x, new_y, old_x, old_y)
{
    for (var c in clients)
        clients[c].remote.doLeap(id, new_x, new_y, old_x, old_y);
}

Server.exports.doSpike = function(id, x, y, time, damage)
{
    for (var c in clients)
        clients[c].remote.doSpike(id, x, y, time, damage);
}
Server.exports.addbots = function(owner,num){
	for(j=0;j<num;j++){
		bots[owner+'bot'+botCounter] = {
			ownerId:owner,
			botId:botCounter,
			id:owner+'bot'+botCounter,
			velocityX:0,
			velocityY:0
		}
		scoreBoard[owner+'bot'+botCounter] = {
			id:owner+'bot'+botCounter,
			kills:0,
			deaths:0,
			suicides:0
		}
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

		for (var c in clients){
			if(!outOfPlaces){
				clients[c].remote.spawnBot(owner+'bot'+botCounter,x,y,owner)
			}
			else{
				clients[c].remote.spawnBot(owner+'bot'+botCounter,0,0,owner)
			}
		}
		if(!outOfPlaces){
			bots[owner+'bot'+botCounter].x = x;
			bots[owner+'bot'+botCounter].y = y;

		}
		else{
			bots[owner+'bot'+botCounter].x = 0;
			bots[owner+'bot'+botCounter].y = 0;
		}
		botCounter++;

	}

}
Server.exports.updateBot = function(botId,ownerId,status){
	var bot = bots[botId];
	if(bot){
		bot.x = status.x;
		bot.y = status.y;
		bot.rot = status.rot;

		for (var c in clients){
			if(c != ownerId){
				clients[c].remote.updateBot(botId,status)
			}
		}
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
		obstaclesList[i].spriteType = 'cactus'+1;//spriteKind;
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
function spawnAnItem(num){
	var itemsToSend = [];
	if(typeof num == 'undefined')
		num = 1;
	for(j = 0;j<num;j++){
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
				//console.log(itemsToSend)
				itemsToSend.push({
					x:itemX,
					y:itemY,
					element:elementForDrop,
					id:itemIdCounter
				})
				//console.log(elementForDrop)

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
	};
	//console.log(itemsToSend.length)
	if(itemsToSend.length){
		for (var c in clients){
			//console.log(itemIdCounter,itemsList.length);
			clients[c].remote.makeItem(itemsToSend);
		};
	}
}
spawnAnItem(10)
setInterval(function(){
	spawnAnItem(2);
	if(itemsList.length<5)
		spawnAnItem(5)
},5000)
server.listen(8000, '0.0.0.0');
