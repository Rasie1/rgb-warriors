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
		eurecaServer.handshake(id,0,0); // надо ещё отравку координат при респауне !!!
		ready = true;
	}	
	
	eurecaClient.exports.kill = function(id)
	{	
		if (charactersList[id]) {
			charactersList[id].kill();
			console.log('killing ', id, charactersList[id]);
		}
	}	

	eurecaClient.exports.updateHP = function(id, difHP)
	{
		if (charactersList[id])
		{
			charactersList[id].health = Phaser.Math.min(maxHealth, charactersList[id].health + difHP);
			if (charactersList[id].hpBar != null)
				charactersList[id].hpBar.scale.setTo(charactersList[id].health / maxHealth, 1);
			if (charactersList[id].health <= 0 && id == player.baseSprite.id)
			{
				console.log('talk server about killing');
				eurecaServer.killPlayer(id);
			}
		}
	}

	eurecaClient.exports.castRemoteAttack = function(id, target, type)
	{
		if (charactersList[id])
		 charactersList[id].fire(target,type);
	}

	eurecaClient.exports.castCloseAttack = function(id, target)
	{
		if (!charactersList[id])
			return;

		var dist = 64;
		var angle = Phaser.Math.angleBetween(charactersList[id].baseSprite.x, 
											 charactersList[id].baseSprite.y,
											 target.x, 
											 target.y);
		var weapon = game.add.sprite(charactersList[id].baseSprite.x + dist * Math.cos(angle),
									 charactersList[id].baseSprite.y + dist * Math.sin(angle),
									 'weapon');
		weapon.enableBody = true;
    	weapon.physicsBodyType = Phaser.Physics.ARCADE;
    	weapon.checkWorldBounds = true;

		weapon.anchor.set(0.5)
		weapon.lifespan = 100;

		if (player.id == id)
			for (var i in charactersList)
				if (i != id)
			{
				var a = new Phaser.Rectangle(weapon.x - 32, weapon.y - 32, 64, 64);
				var b = new Phaser.Rectangle(charactersList[i].baseSprite.x - 32,
											 charactersList[i].baseSprite.y - 32,
											 64, 64);
				if (Phaser.Rectangle.intersects(a, b))
				{
					console.log("HIT")
					eurecaServer.updateHP(charactersList[i].baseSprite.id, closeFightWeaponDamage);
				}
			}
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

			charactersList[id].headSprite.rotation = state.rot;
			charactersList[id].update();
		}
	}
	eurecaClient.exports.updateRotation = function(id, state)
	{
		if (charactersList[id])  {
			charactersList[id].cursor = state;
			charactersList[id].update();
		}
	}
	eurecaClient.exports.makeItem = function(x,y,elementForDrop,itemID) {
		var found = false;
		console.log('making item');
		for (var i in items){ 
			if (!items[i].alive && items[i].element == elementForDrop){
				//console.log('activated');
				activateItem(i, x, y,itemID);
			}
		}

		if (!found && items.length < 30){
			//console.log('created');
			createItem(x, y, elementForDrop,itemID);
		}

	}
	eurecaClient.exports.spawnAllItems = function(itemsList){
		console.log(itemsList)
	}
	eurecaClient.exports.createObstacles = function(obstaclesList){
	    for (var i=0;i<obstaclesList.length;i++) {
			var v = obstacles.create(obstaclesList[i].x,obstaclesList[i].y, obstaclesList[i].spriteType)
			v.body.immovable = true;
			v.scale.setTo(1, 1);
	    }
	} 
}
