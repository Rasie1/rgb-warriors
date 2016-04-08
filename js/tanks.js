var myId=0;

var land;

var tank;
var turret;
var player;
var tanksList;
var explosions;

var cursors;

var bullets;

var ready = false;
var eurecaServer;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

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
		fire:false		
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		down:false,
		fire:false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 30;

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
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
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);

};

Tank.prototype.update = function() {
	
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.down != this.input.down ||
		this.cursor.fire != this.input.fire
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
        this.tank.body.velocity.x = -150;
    }
    else if (this.cursor.right)
    {
        this.tank.body.velocity.x = 150;
    }
    else
    {
    	this.tank.body.velocity.x = 0;
    };

    if (this.cursor.down)
    {
        this.tank.body.velocity.y = 150;
    }
    else if (this.cursor.up)
    {
        this.tank.body.velocity.y = -150;
    }
    else
    {
    	this.tank.body.velocity.y = 0;
    };

    if (this.cursor.fire)
    {	
		this.fire({x:this.cursor.tx, y:this.cursor.ty});
    }

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
};


Tank.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
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

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

var onScreenChange = function(){
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	game.renderer.resize(screenWidth, screenHeight);
	land.width = screenWidth;
	land.height = screenHeight;
}
window.addEventListener("resize",onScreenChange);


function preload () {

    game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');

    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
}



function create () 
{

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(mapBoundsLeft, 
                         mapBoundsTop, 
                         mapBoundsRight, 
                         mapBoundsBottom);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, screenWidth, screenHeight, 'earth');

    land.fixedToCamera = true;
    
    tanksList = {};
	
	player = new Tank(myId, game, tank);
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


    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle((screenWidth-200)/2, (screenHeight-200)/2, 200, 200);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
}

function update () {
	//do not update if client not ready
	if (!ready) return;
	
	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.down = cursors.down.isDown;

	player.input.fire = game.input.activePointer.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;
	
	
	
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
    }
}

function bulletHitPlayer (tank, bullet) {
	bullet.kill();
}

function render () {}
