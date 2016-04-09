var myId=0;

var land;

var tank;
var turret;
var player;
var tanksList;
var explosions;

var cursors = {
    left:false,
    right:false,
    up:false,
    down:false,
    fire:false,
    spell0:false,
    spell1:false,
    spell2:false,
    spell3:false
};

var bullets;

var ready = false;
var eurecaServer;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
if(screenWidth>maxGameWidth){
	var gameWidth = maxGameWidth;
}
else{
	var gameWidth = screenWidth;
};
if(screenHeight>maxGameHeight){
	var gameHeight = maxGameHeight;
}
else{
	var gameHeight = screenHeight;
};


console.log(gameWidth);

var itemTimer = 0
var items = []
//this function will handle client communication with the server
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
		eurecaServer.handshake();
		ready = true;
	}	
	
	eurecaClient.exports.kill = function(id)
	{	
		if (tanksList[id]) {
			tanksList[id].kill();
			console.log('killing ', id, tanksList[id]);
		}
	}	

	eurecaClient.exports.updateHP = function(id, difHP)
	{
		if (tanksList[id])
		{
			tanksList[id].health += difHP;
			if (tanksList[id].health <= 0 && id == tank.id)
			{
				console.log('talk server about killing');
				eurecaServer.killPlayer(id);
			}
		}
	}
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		
		if (i == myId) return; //this is me
		
		var tnk = new Tank(i, game, tank);
		tanksList[i] = tnk;
	}
	
	eurecaClient.exports.updateState = function(id, state)
	{
		if (tanksList[id])  {
			tanksList[id].cursor = state;
			tanksList[id].tank.x = state.x;
			tanksList[id].tank.y = state.y;

			tanksList[id].turret.rotation = state.rot;
			tanksList[id].update();
		}
	}
}

Tank = function (index, game) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		down:false,
		fire:false,
        spell0:false,
        spell1:false,
        spell2:false,
        spell3:false
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		down:false,
		fire:false,
        spell0:false,
        spell1:false,
        spell2:false,
        spell3:false
	}

    var x = 0;
    var y = 0;
    var itemCount = 1

    this.game = game;
    this.health = 30;

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);

    //this.bullets.setAll('outOfBoundsKill', true);
    //this.bullets.setAll('lifespan',5000);
    this.bullets.setAll('checkWorldBounds', true);	

	
	this.currentSpeed =0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.id = index;
    console.log("id="+index)
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);
    this.RCounter = 0
    this.GCounter = 0
    this.BCounter = 0
    var randomElement = Math.round(Math.random()*2)
	if (randomElement==1) this.RCounter++
	else if (randomElement==2) this.GCounter++
	else if (randomElement==3) this.BCounter++


    this.spell0Slot = new Spell()
};

Tank.prototype.update = function() {
	
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.down != this.input.down ||
		this.cursor.fire != this.input.fire ||
        this.cursor.spell0 != this.input.spell0 ||
        this.cursor.spell1 != this.input.spell1 ||
        this.cursor.spell2 != this.input.spell2 ||
        this.cursor.spell3 != this.input.spell3
	);
	
	
	if (inputChanged)
	{
		//Handle input change here
		//send new values to the server		
		if (this.tank.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.tank.x;
			this.input.y = this.tank.y;
			this.input.rot = this.turret.rotation;
			
			
			eurecaServer.handleKeys(this.input);
			
		}
	}

	//cursor value is now updated by eurecaClient.exports.updateState method
	
	
    if (this.cursor.left)
    {
        this.tank.body.velocity.x = -playerSpeedX;
    }
    else if (this.cursor.right)
    {
        this.tank.body.velocity.x = playerSpeedX;
    }
    else
    {
    	this.tank.body.velocity.x = 0;
    };

    if (this.cursor.down)
    {
        this.tank.body.velocity.y = playerSpeedY;
    }
    else if (this.cursor.up)
    {
        this.tank.body.velocity.y = -playerSpeedY;
    }
    else
    {
    	this.tank.body.velocity.y = 0;
    };

    if (this.cursor.fire)
    {	
		this.fire({x:this.cursor.tx, y:this.cursor.ty});
    }

    if (this.cursor.spell0)
    {
         this.spell0Slot.cast()
    }
    if (this.cursor.spell0)
    {

    }
    if (this.cursor.spell0)
    {

    }
    if (this.cursor.spell0)
    {

    }

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
};


Tank.prototype.fire = function(target) {
		if (!this.alive) return;
		//console.log(this.bullets.countDead());
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {

            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            //console.log(bullet);
            bullet.lifespan = 5000;
            bullet.reset(this.turret.x, this.turret.y);

            bullet.magicType = 'fireball';
            console.log('bullet type', bullet.magicType);

			bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
        }
}


Tank.prototype.kill = function() {
	this.alive = false;
	this.tank.kill();
	this.turret.kill();
}

var game = new Phaser.Game(
	gameWidth, 
	gameHeight, 
	Phaser.WEBGL, 
	'phaser-example', 
	{ preload: preload, create: eurecaClientSetup, update: update, render: render }
);


var onScreenChange = function(){
	console.log('changed');
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	/*if(screenWidth>maxGameWidth){
		gameWidth = maxGameWidth;
	}
	else{
		gameWidth = screenWidth;
	};
	if(screenHeight>maxGameHeight){
		gameHeight = maxGameHeight;
	}
	else{
		gameHeight = screenHeight;
	};
	game.scale.maxWidth = gameWidth;
	game.scale.maxHeight = gameHeight;*/
	game.scale.setScreenSize();
	land.width = gameWidth;
	land.height = gameHeight;

	game.camera.deadzone.x = (gameWidth-gameWidth*cameraDeadzoneWidth)/2;
	game.camera.deadzone.y = (gameHeight-gameHeight*cameraDeadzoneHeight)/2;
	game.camera.deadzone.width = gameWidth*cameraDeadzoneWidth;
	game.camera.deadzone.height = gameHeight*cameraDeadzoneHeight;
	game.camera.focusOnXY(tank.x, tank.y);
}
window.addEventListener("resize",onScreenChange);


function preload () {

    game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');

    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.image('item1', 'assets/item0.png')
    game.load.image('item2', 'assets/item1.png')
    game.load.image('item3', 'assets/item2.png')
    
}


function initializeInput ()
{
    cursors.up = game.input.keyboard.addKey(Phaser.Keyboard.UP)
    cursors.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    cursors.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    cursors.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)

    cursors.fire = game.input.keyboard.addKey(Phaser.Mouse.LEFT_BUTTON)
    
    cursors.spell0 = game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    cursors.spell1 = game.input.keyboard.addKey(Phaser.Keyboard.TWO)
    cursors.spell2 = game.input.keyboard.addKey(Phaser.Keyboard.THREE)
    cursors.spell3 = game.input.keyboard.addKey(Phaser.Keyboard.FOUR)
}

function create () 
{
    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(mapX, 
                         mapY, 
                         mapWidth, 
                         mapHeight);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'earth');

    land.fixedToCamera = true;
    
    tanksList = {};
	
	player = new Tank(myId, game, tank);
	player.healthBar = game.add.text(10, 10, "HP: 99999%", 
    	{ font: "32px Arial", fill: "#ffffff", align: "left" });
    player.healthBar.fixedToCamera = true;
    player.healthBar.cameraOffset.setTo(10, 10);
	tanksList[myId] = player;
	tank = player.tank;
	turret = player.turret;
	tank.x=0;
	tank.y=0;
	bullets = player.bullets;

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true); 

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle((gameWidth-gameWidth*cameraDeadzoneWidth)/2, (gameHeight-gameHeight*cameraDeadzoneHeight)/2, gameWidth*cameraDeadzoneWidth, gameHeight*cameraDeadzoneHeight);
    game.camera.focusOnXY(tank.x, tank.y);

}

Tank.prototype.dropItem = function() {
	console.log("dropItem()")
	makeItem(this.tank.x,this.tank.y)
}
function makeItem(x,y) {
	var faund = false
	var elementForDrop = Math.round(Math.random()*2)+1
	for (var i in items) if (!items[i].alive && items[i].element==elementForDrop) {
		var item = items[i]
		item.x = x
		item.y = y
		item.alive = true
		found = true
	}
	if (!faund) {
		var item = game.add.sprite(x,y,'item'+elementForDrop)
		game.physics.enable(item, Phaser.Physics.ARCADE)
		item.enableBody = true
		item.physicsBodyType = Phaser.Physics.ARCADE
		item.element = elementForDrop
		items[items.length] = item
	}

}
Tank.prototype.pickUpItem = function(itemSprite) {
	console.log("pickUpItem()")
	itemSprite.kill()
	switch (itemSprite.element) {
		case 1:
			this.RCounter++
			break
		case 2:
			this.GCounter++
			break
		case 3:
			this.BCounter++
			break
	}
	console.log("R="+this.RCounter+" G="+this.GCounter+" B="+this.BCounter)
}

function update () {
	for (var j in tanksList)
		for (var i in items) game.physics.arcade.overlap(items[i], tanksList[j].tank, function(a){tanksList[j].pickUpItem(a)}, null, this)
	if (itemTimer==60) {
		makeItem(Math.random()*mapHeight,Math.random()*mapWidth)
		itemTimer=0
	}
	itemTimer++
	//do not update if client not ready
    //do not update if client not ready
    if (!ready) return;
    
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    player.input.down = cursors.down.isDown;

    player.input.fire = game.input.activePointer.isDown;
    player.input.tx = game.input.x + game.camera.x;
    player.input.ty = game.input.y + game.camera.y;

    player.input.spell0 = cursors.spell0.isDown;
    player.input.spell1 = cursors.spell1.isDown;
    player.input.spell2 = cursors.spell2.isDown;
    player.input.spell3 = cursors.spell3.isDown;
    initializeInput()

	player.healthBar.setText("HP: " + player.health + "%");
	
	turret.rotation = game.physics.arcade.angleToPointer(turret);	
	tank.rotation = game.physics.arcade.angleToPointer(tank);	

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;
    for (var i in tanksList)
    {
		if (!tanksList[i]) continue;
		var curBullets = tanksList[i].bullets;
		var curTank = tanksList[i].tank;
		for (var j in tanksList)
		{
			if (!tanksList[j]) continue;
			if (j!=i) 
			{
			
				var targetTank = tanksList[j].tank;
				
				game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this);
				if (game.physics.arcade.collide(targetTank, curBullets, bulletHitPlayer, null, this)
					&& tanksList[i].tank.id == myId)
				{
					console.log('talk server about collide');
					eurecaServer.updateHP(targetTank.id, -10);
				}
			}
			if (tanksList[j].alive)
			{
				tanksList[j].update();
			}			
		}
    };
    for(i=0;i<bullets.children.length;i++){
    	//console.log(bullets.children[i].alive)
    	if(bullets.children[i].alive && bullets.children[i].lifespan<=0)
    		bullets.children[i].kill();
    }
}

function bulletHitPlayer (tank, bullet) {
    bullet.kill();
    tanksList[tank.id].dropItem()
}

function render () {}
