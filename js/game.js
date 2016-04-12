

var land;

var player;
var charactersList;
var explosions;

var cactuses
var obstacles

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
}

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
	!Phaser.Device.Desktop ? Phaser.CANVAS : Phaser.WEBGL, 
	'phaser-example', 
	{ preload: preload, create: EurecaClientSetup, update: update, render: render }
);

var bdm;
var ice;

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
    game.load.image('bullet', 'assets/bullet.png');
    game.load.spritesheet('bullets', 'assets/bullets.png',54,17,3);
    game.load.image('vape', 'assets/vape.png');
    game.load.image('spike', 'assets/spike.png')
    game.load.image('sand-decor', 'assets/sand_decor.png')
    game.load.image('button-circle', 'assets/button_circle.png');
    game.load.image('earth', 'assets/desert.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.spritesheet('vapelosion', 'assets/vapelosion.png', 128, 128, 23);
    game.load.spritesheet('yellow-jolt', 'assets/YellowJolt.png', 64, 64, 4);
    game.load.spritesheet('yellow-fireball', 'assets/YellowFireBall.png', 64, 64, 4);
    game.load.spritesheet('player-base', 'assets/player-move-base.png', 64, 64, 8);
    game.load.spritesheet('player-head', 'assets/player-move-head.png', 64, 64, 8);
    game.load.image('item1', 'assets/item0.png')
    game.load.image('item2', 'assets/item1.png')
    game.load.image('item3', 'assets/item2.png')
    game.load.image('aura', 'assets/aura.png')
    game.load.image('ice', 'assets/ice.png')
    game.load.image('hpBar', 'assets/health.png')
    game.load.image('cactus0', 'assets/cactus0.png')
    game.load.image('cactus1', 'assets/cactus1.png')
    game.load.image('stone', 'assets/stone.png')
    game.load.image('dead', 'assets/dead.png')
    game.load.image('wall', 'assets/wall.png')
    game.load.image('weapon', 'assets/sword.png')
    game.load.image('weapon_', 'assets/sword_.png')
    game.load.image('ice', 'assets/ice.png')
    game.load.image('window_health_0', 'assets/window_health_0.png')
    game.load.image('window_health_1', 'assets/window_health_1.png')
    game.load.image('window_health_2', 'assets/window_health_2.png')
    game.load.image('window_health_3', 'assets/window_health_3.png')
    game.load.image('window_health_secondary', 'assets/window_health_secondary.png')
    game.load.image('window_item0', 'assets/window_item1.png')
    game.load.image('window_item1', 'assets/window_item2.png')
    game.load.image('window_item2', 'assets/window_item3.png')
    game.load.image('window_counter', 'assets/window_counter.png')
    game.load.image('logoS0', 'assets/logo/logo_fire.png')
    game.load.image('logoS1', 'assets/logo/logo_health.png')
    game.load.image('logoS2', 'assets/logo/logo_portal.png')
    game.load.image('logoS3', 'assets/logo/logo_spike.png')
    game.load.image('logoS4', 'assets/logo/logo_cold.png')
    game.load.image('logoS5', 'assets/logo/logo_smoke.png')
    game.load.image('logoS6', 'assets/logo/logo_sword.png')
}

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
    
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'earth');

     decors = game.add.group();
 
     for (var i = 0; i < 16; i++)
     {
         var x = decors.create(mapWidth * Math.random(), 
                               mapHeight * Math.random(), 
                               'sand-decor');
         var sc = 10 * Math.random()
         x.scale.set(sc, sc)
     }


    land.fixedToCamera = true;
    
    charactersList = {};

	obstacles = game.add.group();
	obstacles.enableBody = true;


    console.log('creating character')

    player = new Character(myId, game, initialSpawnLocationX, initialSpawnLocationY, -1, -1, -1); // -1 чтобы можно было отличить потрачено было или не задано
    player.HUD = game.add.group();
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

    var wiScale = 0.7
    var window_item0 = game.add.sprite(10, 80, 'window_item0')
    window_item0.scale.setTo(wiScale,wiScale)
    window_item0.fixedToCamera = true
    player.HUD.add(window_item0)
    var window_item1 = game.add.sprite(10, 130, 'window_item1')
    window_item1.scale.setTo(wiScale,wiScale)
    window_item1.fixedToCamera = true
    player.HUD.add(window_item1)
    var window_item2 = game.add.sprite(10, 180, 'window_item2')
    window_item2.scale.setTo(wiScale,wiScale)
    window_item2.fixedToCamera = true
    player.HUD.add(window_item2)
    player.rItems = game.add.text(30, 88, player.RCounter+"",
        { font: "24px Arial", fill: "#000000", align: "center" })
    player.rItems.fixedToCamera = true
    player.rItems.anchor.setTo(0.5,0)
    player.HUD.add(player.rItems)
    player.gItems = game.add.text(30, 138, player.GCounter+"",
        { font: "24px Arial", fill: "#000000", align: "center" })
    player.gItems.fixedToCamera = true
    player.gItems.anchor.setTo(0.5,0)
    player.HUD.add(player.gItems)
    player.bItems = game.add.text(30, 188, player.BCounter+"",
        { font: "24px Arial", fill: "#000000", align: "center" })
    player.bItems.fixedToCamera = true
    player.bItems.anchor.setTo(0.5,0)
    player.HUD.add(player.bItems)

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

    bdm = game.add.bitmapData(game.width, game.height);
	bdm.addToWorld();
	bdm.smoothed = false;

	ice = game.make.sprite(0, 0, 'ice');
	ice.anchor.set(0.5);

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
    //do not update if client not ready
    if (!ready) 
        return;
    
    for (var j in charactersList)
		for (var i in items)
            game.physics.arcade.overlap(items[i], charactersList[j].baseSprite, 
                                        function(a){charactersList[j].pickUpItem(items[i])}, 
                                        null, 
                                        this)
	if (itemTimer == 60) {
		//makeItem(Math.random() * mapHeight, Math.random() * mapWidth);
		if (player.health < player.privateHealth && player.alive)
			eurecaServer.updateHP(myId, +1);
		itemTimer = 0
	}
	itemTimer++
        
    handleInput(player)
    for(var spell in player.spells){
      player.spells[spell].currentCooldown--;
    }

    
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

    //player.healthBar.setText("HP: " + player.health);
    player.hpline.scale.setTo(Phaser.Math.min(player.health/maxHealth,1), 1);
    player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
    player.deaths_counter.setText(player.deaths+"")
    player.kills_counter.setText(player.kills+"")
    
    headSprite.rotation = game.physics.arcade.angleToPointer(headSprite) + 3.14/2; 
    //baseSprite.rotation = game.physics.arcade.angleToPointer(baseSprite); 

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;
    for (var i in charactersList)
    {
		if (!charactersList[i]) continue;
        charactersList[i].weapon.angle = charactersList[i].headSprite.angle; // не получилось
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
function vapeHit (victim, vapelosion) {
   if (victim.health>0 && this.id == myId)
        eurecaServer.updateHP(victim.id, -0.5, player.id);
}
function render () {}
