var Server;
var ready = false;
var found = false;

var EurecaClientSetup = function() {
	//create an instance of eureca.io client

	var Client = new Eureca.Client();
	
	Client.ready(function (proxy) {		
		Server = proxy;
	});
	
	
	//methods defined under "exports" namespace become available in the server side
	
	Client.exports.setId = function(id,x,y) 
	{
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
		Server.handshake(id,initialSpawnLocationX,initialSpawnLocationY);
		ready = true;
	}	
	Client.exports.spawnBot = function(id,x,y,owner){
		console.log('Bot spawned ',id);
		charactersList[id] = new Character(id, game, x, y, -1, -1, -1,false,true,owner);
		if(owner == myId)
			charactersList[id].initBot()
	}
	Client.exports.kill = function(id)
	{	
		if (charactersList[id]) charactersList[id].kill();
	}	

	Client.exports.pickUpItem = function(itemID,element,playerId){
		if(playerId != myId){
			console.log('picking up')
			for (var i in items){
				if(items[i].id == itemID){
					items[i].kill();
					items[i].shadow.kill();
				}
			}
		}
	}
	Client.exports.updateHP = function(victimId, difHP, attackerId, playAnim)
	{
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
					Server.killPlayer(victimId,attackerId);
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
				console.log('---Scoreboard---');
				for(a in charactersList){
					console.log(a,': ',charactersList[a].kills,'/',charactersList[a].deaths)
				}
				console.log('----------------');
			}

		}
	}
	Client.exports.castProjectile = function(characterId,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,spellPower,tx,ty){
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
	}
	Client.exports.castCloseAttack = function(id, target) {
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
					Server.updateHP(charactersList[i].baseSprite.id, closeFightWeaponDamage,id);
			}
	}

    Client.exports.castFreeze = function(id, speedX, speedY){
        if (!charactersList[id])
            return;
        
        charactersList[id].SpeedX = speedX;
        charactersList[id].SpeedY = speedY;
    }

    Client.exports.scaleSpeed = function(id, k){
        if (!charactersList[id])
            return;
        
        charactersList[id].SpeedX *= k;
        charactersList[id].SpeedY *= k;
        //console.log(charactersList[id].SpeedX)
    }
    Client.exports.freezePlayer = function(id,speedMultiplier){
    	charactersList[id].speedMultiplier = speedMultiplier;
    }

    Client.exports.doLeap = function(id, new_x, new_y, old_x, old_y)
    {
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
    }

    Client.exports.doSpike = function(id, x, y, time, damage)
    {
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
                    Server.updateHP(charactersList[i].baseSprite.id, damage,myId);
                }
            }
    }
	
	Client.exports.spawnEnemy = function(i, x, y, r, g, b)
	{
		if (i == myId) return; //this is me
		
		var char = new Character(i,game,x,y,r,g,b);
		charactersList[i] = char;
	}
	Client.exports.respawnPlayer = function(id,x,y){
		if(charactersList[id])
			charactersList[id].recreate(x,y)
	}
	
	Client.exports.updateState = function(id, state)
	{
		if (charactersList[id])  {
			charactersList[id].input = state;

			charactersList[id].baseSprite.x = state.x;
			charactersList[id].baseSprite.y = state.y;


			charactersList[id].fireType = state.fireType;

			charactersList[id].headSprite.rotation = state.rot;
			charactersList[id].update();
		}
	}
	Client.exports.updateBot = function(botId,status){
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
	}
	Client.exports.makeItem = function(itemsArrayORx,y,elementForDrop,itemID) {
		console.log('making item');
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

	}
	Client.exports.reMakeItems = function(itemsArray) {
		for(i=0;i<items.length;i++){
			items[i].shadow.destroy()
			items[i].destroy()
		};
		items = [];

		for(j=0;j<itemsArray.length;j++){
			createItem(itemsArray[j].x, itemsArray[j].y, itemsArray[j].element,itemsArray[j].id);
		}

	}
	Client.exports.createObstacles = function(obstaclesList){
	    for (var i=0;i<obstaclesList.length;i++) {
			var v = obstacles.create(obstaclesList[i].x,obstaclesList[i].y, obstaclesList[i].spriteType)
			v.body.immovable = true;
			v.scale.setTo(1, 1);
			v.shadow = game.add.sprite(obstaclesList[i].x+3, obstaclesList[i].y+10, obstaclesList[i].spriteType);
		    v.shadow.anchor.set(0);
		    v.shadow.tint = 0x000000;
		    v.shadow.alpha = 0.4;
	    }
	} 
	Client.exports.toggleBounce = function(bounce){
		console.log(bounce,charactersList);
		for(c in charactersList){
			charactersList[c].enableProjectileBounce = bounce;
		}
	}
}
