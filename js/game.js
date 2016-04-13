var land;
var obstacles

var player;
var playersGroup;
var charactersList = {};
var bullets;

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
    spell5:false,
    spell6:false
};
var touchCursors = { 
    joystickX:0.0, 
    joystickY:0.0,
    button0:false,
    button1:false,
    button2:false,
    button3:false,
    button4:false,
    button5:false,
    button6:false
};
var touchControls;


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

var HPTimer = 0;

var items = [];
var inventoryItem;
var itemsGroup;

var game = new Phaser.Game(
	gameWidth, 
	gameHeight, 
	!Phaser.Device.Desktop ? Phaser.CANVAS : Phaser.WEBGL, 
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

function initializeInput ()
{
    touchControls = new TouchControls(player)
    touchControls.init(game)
}

function handleInput(player)
{
        
    cursors.up = game.input.keyboard.addKey(Phaser.Keyboard.UP)
    cursors.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    cursors.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    cursors.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)

    cursors.w = game.input.keyboard.addKey(Phaser.Keyboard.W)
    cursors.s = game.input.keyboard.addKey(Phaser.Keyboard.S)
    cursors.a = game.input.keyboard.addKey(Phaser.Keyboard.A)
    cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D)

    cursors.fire = game.input.keyboard.addKey(Phaser.Mouse.LEFT_BUTTON)
    
    cursors.spell0 = game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    cursors.spell1 = game.input.keyboard.addKey(Phaser.Keyboard.TWO)
    cursors.spell2 = game.input.keyboard.addKey(Phaser.Keyboard.THREE)
    cursors.spell3 = game.input.keyboard.addKey(Phaser.Keyboard.FOUR)
    cursors.spell4 = game.input.keyboard.addKey(Phaser.Keyboard.FIVE)
    cursors.spell5 = game.input.keyboard.addKey(Phaser.Keyboard.SIX)
    cursors.spell6 = game.input.keyboard.addKey(Phaser.Keyboard.SEVEN)

    this.touchControls.processInput(player);
    touchCursors = touchControls.touchInput

}

function create () 
{
    game.world.setBounds(mapX, 
                         mapY, 
                         mapWidth, 
                         mapHeight);
    game.stage.disableVisibilityChange  = true;
    
    //Ground
    land = game.add.tileSprite(0, 0, mapWidth, mapHeight, 'earth');
    land.fixedToCamera = false;

    //Sand
    decors = game.add.group(); 
    for (var i = 0; i < 16; i++){
        var x = decors.create(
            mapWidth * Math.random(), 
            mapHeight * Math.random(), 
            'sand-decor'
        );
        var sc = 10 * Math.random()
        x.scale.set(sc, sc)
    }

    //Items will go here
    itemsGroup = game.add.group();

    //Rocks and cactuses
	obstacles = game.add.group();
	obstacles.enableBody = true;

    //Players will go here
    playersGroup = game.add.group();

    //Creating local player
    player = new Character(myId, game, initialSpawnLocationX, initialSpawnLocationY, -1, -1, -1); // -1 чтобы можно было отличить потрачено было или не задано
    
    //Creating HUD
    player.HUD = game.add.group();

    //Healthbar
    player.healthBar = game.add.text(10, 10, "HP: 99999%",
        { font: "32px Arial", fill: "#ffffff", align: "left" });
    player.healthBar.fixedToCamera = true
    player.healthBar.cameraOffset.setTo(10, 10);
    player.HUD.add(player.healthBar);

    var shift = 80
    player.healthBar.setText(" ")
    player.hpline_red = game.add.sprite(10+shift, 10, 'window_health_2')
    player.hpline_red.fixedToCamera = true
    player.HUD.add(player.hpline_red)
    player.hpline_red.kill()

    player.hpline_green = game.add.sprite(10+shift, 10, 'window_health_2')
    player.hpline_green.fixedToCamera = true
    player.HUD.add(player.hpline_green)

    player.hpline = game.add.sprite(25+shift, 10, 'window_health_1')
    player.hpline.fixedToCamera = true
    player.HUD.add(player.hpline)

    player.hpline_secondary = game.add.sprite(12+shift, 10, 'window_health_secondary')
    player.hpline_secondary.fixedToCamera = true
    player.hpline_secondary.scale.setTo(0,1)
    player.HUD.add(player.hpline_secondary)

    player.hpline_glass = game.add.sprite(10+shift, 10, 'window_health_0')
    player.hpline_glass.fixedToCamera = true
    player.HUD.add(player.hpline_glass)

    //Inventory Item
    var wiScale = 0.7

    inventoryItem = game.add.sprite(10, 80, 'inventoryItem');
    inventoryItem.frame = 0;
    inventoryItem.scale.setTo(wiScale,wiScale);
    inventoryItem.fixedToCamera = true;
    inventoryItem.kill();
    player.HUD.add(inventoryItem);

    //Counters
    var window_counter_circle_secondary = game.add.sprite(60, 10, 'window_counter')
    window_counter_circle_secondary.scale.setTo(wiScale,wiScale)
    window_counter_circle_secondary.fixedToCamera = true
    player.HUD.add(window_counter_circle_secondary)

    player.deaths_counter = game.add.text(80, 20, "0",
        { font: "20px Arial", fill: "#ff0000", align: "center" })
    player.deaths_counter.fixedToCamera = true
    player.deaths_counter.anchor.setTo(0.5,0)
    player.HUD.add(player.deaths_counter)

    var window_counter_circle = game.add.sprite(10, 10, 'window_counter')
    window_counter_circle.scale.setTo(1,1)
    window_counter_circle.fixedToCamera = true
    player.HUD.add(window_counter_circle)

    player.kills_counter = game.add.text(38, 23, "0",
        { font: "32px Arial", fill: "#ffffff", align: "center" })
    player.kills_counter.fixedToCamera = true
    player.kills_counter.anchor.setTo(0.5,0)
    player.HUD.add(player.kills_counter)

    //Players list and shortcuts
    charactersList[myId] = player;
    baseSprite = player.baseSprite;
    headSprite = player.headSprite;
    baseSprite.x = player.baseSprite.x;
    baseSprite.y = player.baseSprite.y;
    bullets = player.bullets;

    //baseSprite.bringToTop();
    player.HUD.bringToTop(player.HUD);
    if(game.renderType!=2){
	    game.scale.pageAlignHorizontally = true;
	    game.scale.pageAlignVertically = true;
	    game.scale.setScreenSize(true);
    } 

    //Camera
    game.camera.follow(baseSprite);
    game.camera.deadzone = 
        new Phaser.Rectangle((gameWidth - gameWidth * cameraDeadzoneWidth)/2, 
                             (gameHeight-gameHeight*cameraDeadzoneHeight)/2, 
                             gameWidth*cameraDeadzoneWidth, 
                             gameHeight*cameraDeadzoneHeight);
    game.camera.focusOnXY(baseSprite.x, baseSprite.y);

    initializeInput()

    //Debug
    initDebugMessage(game);

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
    itemsGroup.add(item);
    itemsGroup.sendToBack(itemsGroup);
}

activateItem = function(index, x, y,itemID)
{
	if (items[index])
	{
		var item = items[index];
		item.reset(x,y);
        item.id = itemID;
		item.alive = true;
		found = true
	}

}


function update () {
    //Don't update client if not ready
    if (!ready) 
        return;

    //Scroll ground
    //land.tilePosition.x = -game.camera.x;
    //land.tilePosition.y = -game.camera.y; 
    
    //Items collision
    for (var j in charactersList)
		for (var i in items)
            game.physics.arcade.overlap(
                items[i],
                charactersList[j].baseSprite, 
                function(a){charactersList[j].pickUpItem(items[i])}, 
                null, 
                this
            )

    //Interval for health regen
    if (game.time.now > HPTimer){
        HPTimer = game.time.now + 500;
		if (player.health < player.privateHealth && player.health < player.maxHealth && player.alive)
			eurecaServer.updateHP(myId, +1);
	}    

    handleInput(player)
    
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    player.input.down = cursors.down.isDown;

    player.input.w = cursors.w.isDown;
    player.input.a = cursors.a.isDown;
    player.input.s = cursors.s.isDown;
    player.input.d = cursors.d.isDown;

    player.input.fire = game.input.activePointer.isDown;
    player.input.tx = game.input.x + game.camera.x;
    player.input.ty = game.input.y + game.camera.y;

    player.input.spell0 = cursors.spell0.isDown;
    player.input.spell1 = cursors.spell1.isDown;
    player.input.spell2 = cursors.spell2.isDown;
    player.input.spell3 = cursors.spell3.isDown;
    player.input.spell4 = cursors.spell4.isDown;
    player.input.spell5 = cursors.spell5.isDown;
    player.input.spell6 = cursors.spell6.isDown;

    player.touchInput = touchCursors

    //Update HUD
    //player.healthBar.setText("HP: " + player.health);
    player.hpline.scale.setTo(Phaser.Math.min(player.health/maxHealth,1), 1);
    player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
    player.deaths_counter.setText(player.deaths+"")
    player.kills_counter.setText(player.kills+"")
    
    headSprite.rotation = game.physics.arcade.angleToPointer(headSprite) + 3.14/2;  

    //Update players and projectiles
    for (var i in charactersList)
    {
		if (!charactersList[i]) continue;
        var curBullets = charactersList[i].bullets;
        var curVapelosions = charactersList[i].vapelosions;        
		for (var j in charactersList)
		{
			if (!charactersList[j]) continue;
            var targetCharacter = charactersList[j].baseSprite;
			if (j!=i) 
			{				
                game.physics.arcade.overlap(targetCharacter, curBullets, bulletHit, null, charactersList[i]);                
			}
            game.physics.arcade.overlap(targetCharacter, curVapelosions, vapeHit, null, charactersList[i]);
			if (charactersList[j].alive)
			{
				charactersList[j].update();
			}			
		}
    };
}

//Projectiles hit
function bulletHit (victim, bullet) {
    bullet.kill();
    if(bullet.type==0){
        if(this.id == myId){
            if(victim.health>0) {
                eurecaServer.updateHP(victim.id, -20, player.id);
            }
        }
    }
    if(bullet.type==5){
        if(this.id == myId && victim.key=='enemy')
            eurecaServer.castFreeze(victim.id, 3)
    }
    if(bullet.type==6){
            var vape = this.vapelosions.getFirstDead();
            vape.reset(bullet.x, bullet.y);
            vape.play('vapelosion', 15, true, true);
            vape.lifespan = 1500
    }
}

//Vape cloud hit
function vapeHit (victim, vapelosion) {
   if (victim.health>0 && this.id == myId)
        eurecaServer.updateHP(victim.id, -0.5, player.id);
}

function render () {}
