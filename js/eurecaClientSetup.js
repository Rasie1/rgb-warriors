var eurecaServer;
var ready = false;
var found = false;

var EurecaClientSetup = function() {
	//create an instance of eureca.io client

	var eurecaClient = new Eureca.Client();
	
	eurecaClient.ready(function (proxy) {		
		eurecaServer = proxy;
	});
	
	
	//methods defined under "exports" namespace become available in the server side
	
	eurecaClient.exports.setId = function(id,x,y) 
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
		initialSpawnLocationX = x;
		initialSpawnLocationY = y;
		create();
		eurecaServer.handshake(id,initialSpawnLocationX,initialSpawnLocationY);
		ready = true;
	}	
	
	eurecaClient.exports.kill = function(id)
	{	
		if (charactersList[id]) charactersList[id].kill();
	}	

	eurecaClient.exports.updateHP = function(id, difHP, attackerId)
	{
		var target = charactersList[id]
		if (target && target.health >= 0) {
			//console.log(difHP);
			target.health = Phaser.Math.min(target.privateHealth,target.health + difHP);
			if (target.hpBar != null)
				target.hpBar.scale.setTo(Phaser.Math.max(target.health/target.privateHealth,0), 1);
			if (target.health <= 0 &&  !target.hasDied) {
				target.hasDied = true
				if (id == myId) player.deaths++
				if (attackerId == myId && id != myId) player.kills++;
				if (attackerId == myId && id == myId) player.kills--;
			}
			if (target.health <= 0 && id == player.baseSprite.id) {
				eurecaServer.killPlayer(id);
			}
		}
	}

	eurecaClient.exports.castCloseAttack = function(id, target) {
		var attacker = charactersList[id]
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
    	weapon.scale.setTo(0.5, 0.5)
    	weapon.anchor.set(0.5,1.5)
		weapon.lifespan = 100;
		weapon.angle = Phaser.Math.radToDeg(angle);
		//console.log(angle, weapon.angle)
		attacker.weapon.reset(attacker.baseSprite.x, attacker.baseSprite.y);
		attacker.weapon.lifespan = 100;
		attacker.weapon.angle = attacker.headSprite.angle;

		if (player.id == id)
			for (var i in charactersList)
				if (i != id) {
				var a = new Phaser.Rectangle(weapon.x - 32, weapon.y - 32, 32, 32);
				var b = new Phaser.Rectangle(charactersList[i].baseSprite.x - 32,
											 charactersList[i].baseSprite.y - 32,
											 64, 64);
				if (Phaser.Rectangle.intersects(a, b))
					eurecaServer.updateHP(charactersList[i].baseSprite.id, closeFightWeaponDamage,myId);
			}
	}

    eurecaClient.exports.castFreeze = function(id, speedX, speedY){
        if (!charactersList[id])
            return;
        
        charactersList[id].SpeedX = speedX;
        charactersList[id].SpeedY = speedY;
    }

    eurecaClient.exports.scaleSpeed = function(id, k){
        if (!charactersList[id])
            return;
        
        charactersList[id].SpeedX *= k;
        charactersList[id].SpeedY *= k;
        //console.log(charactersList[id].SpeedX)
    }

    eurecaClient.exports.doLeap = function(id, new_x, new_y)
    {
        if (charactersList[id])
        {
            charactersList[id].baseSprite.x = new_x;
            charactersList[id].baseSprite.y = new_y;
            game.camera.focusOnXY(new_x, new_y);
        }
    }

    eurecaClient.exports.doSpike = function(id, x, y, time, damage)
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
                    eurecaServer.updateHP(charactersList[i].baseSprite.id, damage,myId);
                }
            }
    }
	
	eurecaClient.exports.spawnEnemy = function(i, x, y, r, g, b)
	{
		if (i == myId) return; //this is me
		
		var tnk = new Character(i,game,x,y,r,g,b);
		charactersList[i] = tnk;
	}
	eurecaClient.exports.respawnPlayer = function(id,x,y){
		charactersList[id].recreate(x,y)
	}
	eurecaClient.exports.getX = function()
	{
		return charactersList[myId].baseSprite.x
	}
	eurecaClient.exports.getY = function()
	{
		return charactersList[myId].baseSprite.y
	}
	eurecaClient.exports.getId = function()
	{
		return myId
	}
	
	eurecaClient.exports.updateState = function(id, state)
	{
		if (charactersList[id])  {
			charactersList[id].cursor = state;

			charactersList[id].baseSprite.x = state.x;
			charactersList[id].baseSprite.y = state.y;

			if(id!=myId)
				charactersList[id].fireType = state.fireType;

			charactersList[id].headSprite.rotation = state.rot;
			if(id!=myId)
				charactersList[id].update();
		}
	}
	eurecaClient.exports.updateRotation = function(id, state)
	{
		if (charactersList[id])  {
			//console.log('updating')
			charactersList[id].cursor = state;
			charactersList[id].update();
		}
	}
	eurecaClient.exports.makeItem = function(x,y,elementForDrop,itemID) {
		//console.log('making item');
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
	eurecaClient.exports.createObstacles = function(obstaclesList){
	    for (var i=0;i<obstaclesList.length;i++) {
			var v = obstacles.create(obstaclesList[i].x,obstaclesList[i].y, obstaclesList[i].spriteType)
			v.body.immovable = true;
			v.scale.setTo(1, 1);
	    }
	} 
}
