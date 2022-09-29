var password = '0000';

var mapWidth  =  2000;
var mapHeight =  2000;
var playerSpeed = 200;

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

var scoreBoard = {};

var bounceEnabled = false;

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

//we'll keep clients data here
var clients = {};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 8000, function() {
	console.log('Listening on ' + server.address().port);
});

io.on('connection', function(socket) {
	console.log('Connected %s ', socket.id);

	clients[socket.id] = {
		id: socket.id,
		speed: playerSpeed
	};

	socket.on('createPlayer', function() {
		clients[socket.id] = {
			id: socket.id,
			speed: playerSpeed
		};
	
		//add player to scoreboard
		scoreBoard[socket.id] = {
			id: socket.id,
			kills: 0,
			deaths: 0,
			suicides: 0,
			isBot: false
		}
	
		var color = colors[Math.floor(Math.random() * colors.length)];
		clients[socket.id].color = color;
	
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
	
		if (outOfPlaces) {
			x = 0;
			y = 0;
		}
	
		io.to(socket.id).emit('setId', socket.id, x, y, scoreBoard); 
	
		sendAllItems(socket.id, true);
		io.to(socket.id).emit('createObstacles', obstaclesList);
	
		for(b in bots){
			var bot = bots[b];
			var options = {
				id:bot.id,
				x:bot.x,
				y:bot.y,
				owner:bot.ownerId
			}
			io.to(socket.id).emit('spawnBot', options);
		}
	});

	socket.on('disconnect', function() {
		console.log('Disconnected %s', socket.id);

		var removeId = clients[socket.id].id;

		var botsToKill = [];
		for(b in bots){
			if(bots[b].ownerId == removeId){
				botsToKill.push(bots[b].id)
				delete bots[b]
				delete scoreBoard[b]
			}
		}
		console.log('Killing bots: ', botsToKill);

		delete clients[removeId];
		delete scoreBoard[removeId];

		socket.broadcast.emit('kill', socket.id);
		for(i=0;i<botsToKill.length;i++){
			socket.broadcast.emit('kill', botsToKill[i]);
		}
		socket.broadcast.emit('updateScoreBoard', scoreBoard);
	});

	socket.on('handshake', function(id, x, y) {
		var enemy = clients[id]
		for (var c in clients)
			if (c != id) {
				io.to(c).emit('spawnEnemy', {
					id: id, 
					x: x, 
					y: y
				});

				var cl = clients[c];
				io.to(enemy.id).emit('spawnEnemy', {
					id: c, 
					x: cl.lastX, 
					y: cl.lastX, 
					speed: cl.speed
				});
					
				io.to(c).emit('updateScoreBoard', scoreBoard);
			}
		io.to(enemy.id).emit('toggleBounce', bounceEnabled);
	});

	socket.on('handleKeys', function(keys, x, y, r, g, b, id) {
		for (var c in clients)
		{
			if(c != id)
				io.to(c).emit('updateState', socket.id, keys);

			//keep last known state so we can send it to new connected clients
			clients[c].laststate = keys;
			clients[c].lastX = x;
			clients[c].lastY = y;
			clients[c].r = r;
			clients[c].g = g;
			clients[c].b = b;
		}
	});

	socket.on('killPlayer', function(id, killerId) {
		if(!clients[id] && !bots[id])
			return;

		for (var c in clients)
			io.to(c).emit('kill', id);

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
			for (var c in clients)
				io.to(c).emit('updateScoreBoards', scoreBoard);
		};

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
					io.to(c).emit('respawnPlayer', id, x, y);
				}
			}
			else{
				for (var c in clients){
					io.to(c).emit('respawnPlayer', id, 0, 0);
				}
			}
		}, 3000);
	});

	socket.on('updateHP', function(id, difHP, attackerId, playAnim) {
		if(typeof playAnim == 'undefined')
			var playAnim = false;
		for (var c in clients)
			io.to(c).emit('updateHP', id, difHP, attackerId, playAnim);
	});

	socket.on('dropItem', function(x, y, elementForDrop) {
		elementForDrop = Math.round(Math.random()*2)+1;
		for (var c in clients){
			io.to(c).emit('makeItem', x, y, elementForDrop);
		}
		itemsList.push({
			x:x,
			y:y,
			element:elementForDrop,
			id:itemIdCounter
		});
		itemIdCounter++;
	});

	socket.on('pickUpItem', function(itemID, element, playerId, newSpeed) {
		for (var c in clients)
			io.to(c).emit('pickUpItem', itemID, element, playerId, newSpeed);

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
	});

	socket.on('sendAllItems', function(playerId, isOnconnect) {
		sendAllItems(playerId, isOnconnect);
	});

	socket.on('castProjectile', function(characterId,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,spellPower,tx,ty) {
		for (var c in clients)
			io.to(c).emit('castProjectile', characterId,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,spellPower,tx,ty);
	});

	socket.on('castCloseAttack', function(id, target) {
		for (var c in clients)
			io.to(c).emit('caseCloseAttack', id, target);	
	});

	socket.on('castFreeze', function(id, time, speedMultiplier) {
		for (var c in clients) {
			io.to(c).emit('freezePlayer', id, 0.5);
		}
		setTimeout(function() {
				for (var c in clients) {
					 io.to(c).emit('freezePlayer', id, 1);
				}
			},
			time * 1000)
	});

	socket.on('doLeap', function(id, new_x, new_y, old_x, old_y) {
		for (var c in clients)
        	io.to(c).emit('doLeap', id, new_x, new_y, old_x, old_y);
	});

	socket.on('doSpike', function(id, x, y, time, damage) {
		for (var c in clients)
        	io.to(c).emit('doSpike', id, x, y, time, damage);
	});

	socket.on('addbots', function(owner, num, pass) {
		if(pass !== password)
			return;
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
				suicides:0,
				isBot:true
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
					var options = {
						id:owner+'bot'+botCounter,
						x:x,
						y:y,
						owner:owner
					}
				}
				else{
					var options = {
						id:owner+'bot'+botCounter,
						x:0,
						y:0,
						owner:owner
					}
				}
				io.to(c).emit('spawnBot', options);
				io.to(c).emit('updateScoreBoard', scoreBoard);
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
	});

	socket.on('updateBot', function(botId, ownerId, status) {
		var bot = bots[botId];
		if(bot){
			bot.x = status.x;
			bot.y = status.y;
			bot.rot = status.rot;

			for (var c in clients){
				if(c != ownerId){
					io.to(c).emit('updateBot', botId, status);
				}
			}
		}
	});

	socket.on('toggleBounce', function(pass) {
		if(pass !== password)
			return;
		for (var c in clients)
			io.to(c).emit('toggleBounce', !bounceEnabled);
		bounceEnabled = !bounceEnabled;
	})
});

function sendAllItems(playerId, isOnconnect) {
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
				io.to(playerId).emit('makeItem', itemsToSend);
			else
				io.to(playerId).emit('reMakeItems', itemsToSend);
		}
	};
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
			io.to(c).emit('makeItem', itemsToSend);
		};
	}
}
spawnAnItem(10)
setInterval(function(){
	spawnAnItem(2);
	if(itemsList.length<5)
		spawnAnItem(5)
},5000)