var Server;
var ready = false;
var found = false;
var Client = {};

Client.socket = io.connect();

var SocketClientSetup = function() {
	console.log('ID: ' + Client.socket.id);

	Client.socket.on('setId', function(id, x, y, scoreBoard) {
		//create() is moved here to make sure nothing is created before uniq id assignation
		if(typeof myId != 'undefined'){
			location.href = location.href;
			return
		}
		Object.defineProperty(window, 'myId', {
			value: id,
			writable : false,
			enumerable : true,
			configurable : false
		});
		initialSpawnLocationX = x;
		initialSpawnLocationY = y;
		create();
		player.HUD.updateScoreBoard(scoreBoard);
		Client.handshake(id,initialSpawnLocationX,initialSpawnLocationY);
		ready = true;
	});
		
	Client.socket.on('spawnBot', function(options){
		console.log('Bot spawned ',options.id);
		options.isBot = true;
		charactersList[options.id] = new Character(options);
		if(options.owner == myId)
			charactersList[options.id].initBot()
	});
		
	Client.socket.on('kill', function(id) {
		if (charactersList[id]) charactersList[id].kill();
	});

	Client.socket.on('pickUpItem', function(itemID, element, playerId, newSpeed) {
		if(playerId != myId){
			//console.log('picking up')
			for (var i in items){
				if(items[i].id == itemID){
					items[i].kill();
					items[i].shadow.kill();
				}
			}
			charactersList[playerId].SpeedX = newSpeed;
			charactersList[playerId].SpeedY = newSpeed;
		}
	});
		
	Client.socket.on('updateHP', function(victimId, difHP, attackerId, playAnim){
		var target = charactersList[victimId];
		if (target && target.health >= 0) {
			//Heal effect
			if(playAnim){
				target.spells.HealingSpell.visualEffectSprite.reset(
					target.baseSprite.x,
					target.baseSprite.y
				)
				target.spells.HealingSpell.visualEffectSprite.animations.play('cast', 5, false, true);
			}
			//console.log(difHP);
			target.health = Phaser.Math.min(target.health + difHP,maxHealth);
			if (target.hpBar != null)
				target.hpBar.scale.setTo(Phaser.Math.max(target.health/maxHealth,0), 1);
			if (target.health <= 0 &&  !target.hasDied) {
				target.hasDied = true;

				if (victimId == myId || (target.isBot && target.owner == myId)) {
					Client.killPlayer(victimId,attackerId);
				}

				if (victimId == myId) player.deaths++;
				if(charactersList[victimId].isBot && myId == charactersList[attackerId].owner)
						charactersList[victimId].deaths++;
				if(!charactersList[attackerId].isBot){					
					if (attackerId == myId && victimId != myId) player.kills++;
					if (attackerId == myId && victimId == myId) player.kills--;
				}
				else{
					if(myId == charactersList[attackerId].owner){
						for(c in charactersList){
							if (attackerId == c && victimId != c) charactersList[c].kills++;
							if (attackerId == c && victimId == c) charactersList[c].kills--;
						}
					}
				}
			}

		}
	});
		
	Client.socket.on('updateScoreBoard', function(scoreBoard){
		player.HUD.updateScoreBoard(scoreBoard)
	});

	Client.socket.on('castProjectile', function(characterId,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,spellPower,tx,ty){
		var character = charactersList[characterId];
		var bullet = character.bullets.getFirstDead();
		bullet.lifespan = 5000;
		bullet.damage = bulletDamage;
		bullet.type = bulletType;
		bullet.frame = bulletFrame;
		bullet.spellPower = spellPower;
		bullet.spellPowerBoost = spellPowerBoost * spellPower;
		bullet.reset(character.headSprite.x, character.headSprite.y);
		bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:tx,y:ty}, bulletSpeed);
	});
		
	Client.socket.on('castCloseAttack', function(id, target){
		var attacker = charactersList[id];
		//console.log(id);
		if (!attacker) return

		var dist = 64;
		var angle = Phaser.Math.angleBetween(attacker.baseSprite.x, 
											attacker.baseSprite.y,
											target.x, 
											target.y);
		var weapon = game.add.sprite(attacker.baseSprite.x + dist * Math.cos(angle),
									attacker.baseSprite.y + dist * Math.sin(angle),
									'weapon_');
		weapon.enableBody = true;
		weapon.physicsBodyType = Phaser.Physics.ARCADE;
		weapon.checkWorldBounds = true;
		weapon.scale.setTo(0.4, 0.4)
		weapon.anchor.set(0.3,1)
		attacker.weapon.angle = Phaser.Math.radToDeg(angle);
		//console.log(angle, weapon.angle)
		attacker.weapon.reset(attacker.baseSprite.x, attacker.baseSprite.y);
		attacker.weapon.lifespan = 100;
		attacker.weapon.angle = attacker.headSprite.angle;

		if (myId == id || charactersList[id].owner == myId)
			for (var i in charactersList)
				if (i != id) {
				var a = new Phaser.Rectangle(weapon.x - 32, weapon.y - 32, 32, 32);
				var b = new Phaser.Rectangle(charactersList[i].baseSprite.x - 32,
											charactersList[i].baseSprite.y - 32,
											64, 64);
				if (Phaser.Rectangle.intersects(a, b))
					Client.updateHP(charactersList[i].baseSprite.id, closeFightWeaponDamage,id);
			}
	});

	Client.socket.on('castFreeze', function(id, speedX, speedY){
		if (!charactersList[id])
			return;

		charactersList[id].SpeedX = speedX;
		charactersList[id].SpeedY = speedY;
	});

	Client.socket.on('scaleSpeed', function(id, k){
		if (!charactersList[id])
			return;

		charactersList[id].SpeedX *= k;
		charactersList[id].SpeedY *= k;
	});

	Client.socket.on('freezePlayer', function(id,speedMultiplier){
		charactersList[id].speedMultiplier = speedMultiplier;
	});

	Client.socket.on('doLeap', function(id, new_x, new_y, old_x, old_y){
		if (charactersList[id])
		{
			charactersList[id].spells.Leap.visualEffectSpriteBegin.reset(old_x,old_y)
			charactersList[id].spells.Leap.visualEffectSpriteBegin.animations.play('cast', 15, false, true);
			charactersList[id].spells.Leap.visualEffectSpriteEnd.reset(new_x,new_y)
			charactersList[id].spells.Leap.visualEffectSpriteEnd.animations.play('cast', 15, false, true);

			charactersList[id].baseSprite.x = new_x;
			charactersList[id].baseSprite.y = new_y;
			if(id == myId)
				game.camera.focusOnXY(new_x, new_y);
		}
	})

	Client.socket.on('doSpike', function(id, x, y, time, damage){
		var stone = obstacles.create(x, y, 'spike')
		stone.anchor.set(0.5, 0.5)
		stone.body.immovable = true;
		stone.scale.setTo(1, 1);

		game.time.events.add(Phaser.Timer.SECOND * time, 
							function() { obstacles.remove(stone) }, 
							this)

		if (!charactersList[id])
			return;

		if (player.id == id)
			for (var i in charactersList)
				if (i != id)
			{
				var dist = Phaser.Point.distance(new Phaser.Point(x, y), 
												new Phaser.Point(charactersList[i].baseSprite.x, 
																charactersList[i].baseSprite.y))
				if (dist < 64)
				{
					Client.updateHP(charactersList[i].baseSprite.id, damage,myId);
				}
			}	
	});

	Client.socket.on('spawnEnemy', function(options){
		if (options.id == myId) 
			return; //this is me
		var char = new Character(options);
		charactersList[options.id] = char;
	});

	Client.socket.on('respawnPlayer', function(id, x, y){
		if(charactersList[id])
			charactersList[id].recreate(x,y)
	});
		
	Client.socket.on('updateState', function(id, state) {
		if (charactersList[id])  {
			charactersList[id].input = state;

			charactersList[id].baseSprite.x = state.x;
			charactersList[id].baseSprite.y = state.y;


			charactersList[id].fireType = state.fireType;

			charactersList[id].headSprite.rotation = state.rot;
			charactersList[id].update();
		}
	});

	Client.socket.on('updateBot', function(botId,status){
		var bot = charactersList[botId]
		if(!bot)
			return;
		if(status.x != bot.prevX || status.y != bot.prevY){
			bot.baseSprite.x = status.x;
			bot.baseSprite.y = status.y;
			bot.prevX = status.x;
			bot.prevY = status.y;
		}
		bot.baseSprite.body.velocity.x = status.velX;
		bot.baseSprite.body.velocity.y = status.velY;
		bot.headSprite.rotation = status.rot;
	});

	Client.socket.on('makeItem', function(itemsArrayORx,y,elementForDrop,itemID) {
		if(typeof itemsArrayORx != 'object')
			var itemsArray = [{
				x:itemsArrayORx,
				y:y,
				element:elementForDrop,
				id:itemID
			}]
		else
			var itemsArray = itemsArrayORx;

		for(j=0;j<itemsArray.length;j++){
			var x = itemsArray[j].x;
			var y = itemsArray[j].y;
			var elementForDrop = itemsArray[j].element;
			var itemID = itemsArray[j].id;

			found = false;
			for (var i in items){ 
				if (!items[i].alive && items[i].element == elementForDrop){
					//console.log('activated '+itemID);
					activateItem(i, x, y,itemID);
				}
				if (found) break;
			}
			if (!found){
				//console.log('created '+itemID);
				createItem(x, y, elementForDrop,itemID);
			}
		}
	});

	Client.socket.on('reMakeItems', function(itemsArray) {
		for(i=0;i<items.length;i++){
			items[i].shadow.destroy()
			items[i].destroy()
		};
		items = [];

		for(j=0;j<itemsArray.length;j++){
			createItem(itemsArray[j].x, itemsArray[j].y, itemsArray[j].element,itemsArray[j].id);
		}
	});

	Client.socket.on('createObstacles', function(obstaclesList) {
		for (var i=0;i<obstaclesList.length;i++) {
			var v = obstacles.create(obstaclesList[i].x,obstaclesList[i].y, obstaclesList[i].spriteType)
			v.body.immovable = true;
			v.scale.setTo(1, 1);
			v.shadow = game.add.sprite(obstaclesList[i].x+3, obstaclesList[i].y+10, obstaclesList[i].spriteType);
			obstaclesShadows.add(v.shadow);
			v.shadow.anchor.set(0);
			v.shadow.tint = 0x000000;
			v.shadow.alpha = 0.4;
			obstaclesShadows.sendToBack(obstaclesShadows)
		}
	});

	Client.socket.on('toggleBounce', function(bounce){
		for(c in charactersList){
			charactersList[c].enableProjectileBounce = bounce;
		}
	});

	Client.createPlayer();
}

//===========================================

Client.createPlayer = function() {
	Client.socket.emit('createPlayer');
}

Client.handshake = function(id,initialSpawnLocationX,initialSpawnLocationY) {
	Client.socket.emit('handshake', id,initialSpawnLocationX,initialSpawnLocationY);
};

Client.killPlayer = function(victimId, attackerId) {
	Client.socket.emit('killPlayer', victimId, attackerId);
};

Client.updateHP = function(id, closeFightWeaponDamage, attackerId){
	Client.socket.emit('updateHP', id, closeFightWeaponDamage, attackerId);
};

Client.updateBot = function(id, myId, statusActual) {
	Client.socket.emit('updateBot', id, myId, statusActual);
};

Client.handleKeys = function(input, x, y, r, g, b, myId) {
	Client.socket.emit('handleKeys', input, x, y, r, g, b, myId);
};

Client.dropItem = function(x, y) {
	Client.socket.emit('dropItem', x, y);
};

Client.pickUpItem = function(itemID, element, playerId, newSpeed) {
	Client.socket.emit('pickUpItem', itemID, element, playerId, newSpeed);
};

Client.addbots = function(myId,num,pass) {
	Client.socket.emit('addbots', myId,num,pass);
};

Client.toggleBounce = function(pass) {
	Client.socket.emit('toggleBounce', pass);
};

Client.castProjectile = function(id, bulletType, bulletFrame, bulletSpeed, bulletDamage, spellPowerBoost, spellId, spellPower, x, y) {
	Client.socket.emit('castProjectile', id, bulletType, bulletFrame, bulletSpeed, bulletDamage, spellPowerBoost, spellId, spellPower, x, y);
};

Client.doLeap = function(id, x, y, cur_x, cur_y) {
	Client.socket.emit('doLeap', id, x, y, cur_x, cur_y);
};

Client.doSpike = function(id, x, y, stayTime, damage) {
	Client.socket.emit('doSpike', id, x, y, stayTime, damage);
};

Client.castCloseAttack = function(id, target) {
	Client.socket.emit('castCloseAttack', id, target);
};

Client.castFreeze = function(id, value) {
	Client.socket.emit('castFreeze', id, value);
};