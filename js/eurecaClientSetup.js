var eurecaClientSetup = function() {
	//create an instance of eureca.io client

	var eurecaClient = new Eureca.Client();
	
	eurecaClient.ready(function (proxy) {		
		eurecaServer = proxy;
	});
	
	
	//methods defined under "exports" namespace become available in the server side
	
	eurecaClient.exports.setId = function(id) 
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
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
			charactersList[id].health += difHP;
			if (charactersList[id].health <= 0 && id == player.baseSprite.id)
			{
				console.log('talk server about killing');
				eurecaServer.killPlayer(id);
			}
		}
	}
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		console.log("А ПОЛУЧИЛИ: "+x+" - "+y)
		if (i == myId) return; //this is me
		
		var tnk = new Character(i,game,x,y);
		charactersList[i] = tnk;
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
	eurecaClient.exports.createItem = function(x, y, elementForDrop)
	{
		var item = game.add.sprite(x,y,'item'+elementForDrop)
		game.physics.enable(item, Phaser.Physics.ARCADE)
		item.enableBody = true
		item.physicsBodyType = Phaser.Physics.ARCADE
		item.element = elementForDrop
		items[items.length] = item
	}

	eurecaClient.exports.activateItem = function(index, x, y)
	{
		if (items[index])
		{
			var item = items[index]
			item.x = x
			item.y = y
			item.alive = true
			found = true	
		}
	}
}