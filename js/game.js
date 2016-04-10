

var land;

var player;
var charactersList;
var explosions;

var cactuses
var obstacles
var walls

var cursors = {
    left:false,
    right:false,
    up:false,
    down:false,
    fire:false,
    spell0:false,
    spell1:false,
    spell2:false,
    spell3:false,
    spell4:false,
    spell5:false
};

var touchControls;

var bullets;

var ready = false;
var eurecaServer;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
if (screenWidth > maxGameWidth){
	var gameWidth = maxGameWidth;
}
else {
	var gameWidth = screenWidth;
};
if (screenHeight > maxGameHeight){
	var gameHeight = maxGameHeight;
}
else {
	var gameHeight = screenHeight;
};

var itemTimer = 0
var items = []


var game = new Phaser.Game(
	gameWidth, 
	gameHeight, 
	Phaser.Device.Desktop ? Phaser.CANVAS : Phaser.WEBGL, 
	'phaser-example', 
	{ preload: preload, create: EurecaClientSetup, update: update, render: render }
);


var onScreenChange = function() {
	if(game.renderType==2) {
		widthDiff = screenWidth-window.innerWidth;
		heightDiff = screenHeight-window.innerHeight;
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		if(screenWidth>maxGameWidth){
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
		
		game.renderer.resize(gameWidth, gameHeight)

		game.camera.width = game.camera.width- widthDiff;
		game.camera.height = game.camera.height- heightDiff;
		land.width = gameWidth;
		land.height = gameHeight;

		game.camera.deadzone.x = (gameWidth-gameWidth*cameraDeadzoneWidth)/2;
		game.camera.deadzone.y = (gameHeight-gameHeight*cameraDeadzoneHeight)/2;
		game.camera.deadzone.width = gameWidth*cameraDeadzoneWidth;
		game.camera.deadzone.height = gameHeight*cameraDeadzoneHeight;
		game.camera.focusOnXY(baseSprite.x, baseSprite.y);
	}
	else{
		console.log(gameWidth,gameHeight);
	}
}
window.addEventListener("resize",onScreenChange);
window.addEventListener("orientationchange",onScreenChange);


function preload () {
    game.load.atlas('character', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('button-circle', 'assets/button_circle.png');
    game.load.image('earth', 'assets/light_sand.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.spritesheet('yellow-jolt', 'assets/YellowJolt.png', 64, 64, 4);
    game.load.image('item1', 'assets/item0.png')
    game.load.image('item2', 'assets/item1.png')
    game.load.image('item3', 'assets/item2.png')
    game.load.image('aura', 'assets/aura.png')
    game.load.image('hpBar', 'assets/health.png')
    game.load.image('cactus0', 'assets/cactus0.png')
    game.load.image('cactus1', 'assets/cactus1.png')
    game.load.image('stone', 'assets/stone.png')
    game.load.image('dead', 'assets/dead.png')
    game.load.image('wall', 'assets/wall.png')
}

function initializeInput ()
{
    if (!game.device.desktop) {
        touchControls = new TouchControls(player)
        touchControls.init(game)
    }
}

function handleInput(player)
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
    cursors.spell4 = game.input.keyboard.addKey(Phaser.Keyboard.FIVE)
    cursors.spell5 = game.input.keyboard.addKey(Phaser.Keyboard.SIX)

    if (!game.device.desktop)
        this.touchControls.processInput(player);
    
}

function create () 
{
    game.world.setBounds(mapX, 
                         mapY, 
                         mapWidth, 
                         mapHeight);
    game.stage.disableVisibilityChange  = true;
    
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'earth');

    land.fixedToCamera = true;
    
    charactersList = {};

	walls = game.add.group();
	walls.enableBody = true;
	cactuses = game.add.group();
	cactuses.enableBody = true;
	obstacles = game.add.group();
	obstacles.enableBody = true;


    console.log('creating character')

    player = new Character(myId, game, initialSpawnLocationX, initialSpawnLocationY, -1, -1, -1); // -1 чтобы можно было отлечить потрачено было или не задано
    player.HUD = game.add.group();
    player.healthBar = game.add.text(10, 10, "HP: 99999%",
        { font: "32px Arial", fill: "#ffffff", align: "left" });
    player.healthBar.fixedToCamera = true
    player.healthBar.cameraOffset.setTo(10, 10);
    player.HUD.add(player.healthBar);

    charactersList[myId] = player;
    baseSprite = player.baseSprite;
    headSprite = player.headSprite;
    baseSprite.x = player.baseSprite.x;
    baseSprite.y = player.baseSprite.y;
    bullets = player.bullets;

    initDebugMessage(game);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    //baseSprite.bringToTop();
    player.HUD.bringToTop(player.HUD);

    if(game.renderType!=2){
	    game.scale.pageAlignHorizontally = true;
	    game.scale.pageAlignVertically = true;
	    game.scale.setScreenSize(true);
    } 


    game.camera.follow(baseSprite);
    game.camera.deadzone = 
        new Phaser.Rectangle((gameWidth - gameWidth * cameraDeadzoneWidth)/2, 
                             (gameHeight-gameHeight*cameraDeadzoneHeight)/2, 
                             gameWidth*cameraDeadzoneWidth, 
                             gameHeight*cameraDeadzoneHeight);
    game.camera.focusOnXY(baseSprite.x, baseSprite.y);

    initializeInput()
}
createItem = function(x, y, elementForDrop,itemID)
{
	var item = game.add.sprite(x,y,'item'+elementForDrop)
	game.physics.enable(item, Phaser.Physics.ARCADE)
	item.enableBody = true
	item.physicsBodyType = Phaser.Physics.ARCADE
	item.element = elementForDrop;
	item.id = itemID;
	items[items.length] = item;
}

activateItem = function(index, x, y,itemID)
{
	if (items[index])
	{
		var item = items[index];
		item.x = x;
		item.y = y;
		item.alive = true;
		found = true
	}

}


function update () {
	for (var j in charactersList)
		for (var i in items)
            game.physics.arcade.overlap(items[i], charactersList[j].baseSprite, 
                                        function(a){charactersList[j].pickUpItem(items[i])}, 
                                        null, 
                                        this)
	if (itemTimer == 60) {
		//makeItem(Math.random() * mapHeight, Math.random() * mapWidth);
		if (player.health < 30 && player.alive)
			eurecaServer.updateHP(myId, +1);
		itemTimer = 0
	}
	itemTimer++
    
    //do not update if client not ready
    if (!ready) 
        return;
    
    player.spell0Slot.currentCooldown--;
    player.spell1Slot.currentCooldown--;
    player.spell2Slot.currentCooldown--;
    player.spell3Slot.currentCooldown--;
    player.spell4Slot.currentCooldown--;
    player.spell5Slot.currentCooldown--;
    
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
    player.input.spell4 = cursors.spell4.isDown;
    player.input.spell5 = cursors.spell5.isDown;

    handleInput(player)

    player.healthBar.setText("HP: " + player.health);
    
    headSprite.rotation = game.physics.arcade.angleToPointer(headSprite);   
    //baseSprite.rotation = game.physics.arcade.angleToPointer(baseSprite); 

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;
    for (var i in charactersList)
    {
		if (!charactersList[i]) continue;
		var curBullets = charactersList[i].bullets;
		for (var j in charactersList)
		{
			if (!charactersList[j]) continue;
			if (j!=i) 
			{
			
				var targetCharacter = charactersList[j].baseSprite;
				
				//game.physics.arcade.overlap(curBullets, targetCharacter, bulletHitPlayer, null, this);
				if(
                    game.physics.arcade.overlap(targetCharacter, curBullets, bulletHitPlayer, null, this) &&
                    charactersList[i].baseSprite.id == player.baseSprite.id &&
                    charactersList[j].health>0
                )
				{
					console.log('talk server about collide');
					eurecaServer.updateHP(targetCharacter.id, -10);
				}
			}
			if (charactersList[j].alive)
			{
				charactersList[j].update();
			}			
		}
    };
    for (i = 0; i < bullets.children.length; i++) {
    	if (bullets.children[i].alive && bullets.children[i].lifespan <= 0)
    		bullets.children[i].kill();
    };
}

function bulletHitPlayer (character, bullet) {
    bullet.kill();
}

function render () {}
