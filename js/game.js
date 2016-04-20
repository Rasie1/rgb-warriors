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
    
    cursors.spell0 = game.input.keyboard.addKey(Phaser.Keyboard.E)
    cursors.spell1 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    cursors.spell2 = game.input.keyboard.addKey(Phaser.Keyboard.Q)
    cursors.spell3 = game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    cursors.spell4 = game.input.keyboard.addKey(Phaser.Keyboard.TWO)
    cursors.spell5 = game.input.keyboard.addKey(Phaser.Keyboard.THREE)
    cursors.spell6 = game.input.keyboard.addKey(Phaser.Keyboard.FOUR)

    this.touchControls.processInput(player);
    touchCursors = touchControls.touchInput

}

(function(window,document) {

    var prefix = "", _addEventListener, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }

})(window,document);



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
    obstaclesShadows = game.add.group();
	obstacles.enableBody = true;

    //Players will go here
    playersGroup = game.add.group();

    //Creating local player
    player = new Character(myId, game, initialSpawnLocationX, initialSpawnLocationY, -1, -1, -1); // -1 чтобы можно было отличить потрачено было или не задано
    
    //Creating HUD
    player.HUD = game.add.group();

    //Healthbar
    var shift = 80
    //player.hpline_red = game.add.sprite(10+shift, 10, 'window_health_2')
    //player.hpline_red.fixedToCamera = true
    //player.HUD.add(player.hpline_red)
    //player.hpline_red.kill()

    player.hpline_green = game.add.sprite(10+shift, 10, 'window_health_2')
    player.hpline_green.fixedToCamera = true
    player.HUD.add(player.hpline_green)

    player.hpline = game.add.sprite(25+shift, 10, 'window_health_1')
    player.hpline.fixedToCamera = true
    player.HUD.add(player.hpline)

    //player.hpline_secondary = game.add.sprite(12+shift, 10, 'window_health_secondary')
    //player.hpline_secondary.fixedToCamera = true
    //player.hpline_secondary.scale.setTo(0,1)
    //player.HUD.add(player.hpline_secondary)

    player.healthIndicator = game.add.text(20+shift, 10, maxHealth+'/'+maxHealth,
        { font: "28px Arial", fill: "#ffffff", align: "left" });
    player.healthIndicator.fixedToCamera = true
    player.HUD.add(player.healthIndicator);

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
    item.shadow = game.add.sprite(x+3, y+10, 'item'+elementForDrop);
    item.shadow.anchor.set(0);
    item.shadow.tint = 0x000000;
    item.shadow.alpha = 0.4;
    itemsGroup.add(item);
    itemsGroup.add(item.shadow);    
    itemsGroup.sendToBack(itemsGroup);
    itemsGroup.sendToBack(item.shadow)
}

activateItem = function(index, x, y,itemID)
{
	if (items[index])
	{
		var item = items[index];
		item.reset(x,y);
        item.shadow.reset(x+3,y+10);
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


    //Update HUD
    player.healthIndicator.setText(Math.max(Math.round(player.health),0)+'/'+maxHealth);
    player.hpline.scale.setTo(Phaser.Math.max(player.health/maxHealth,0), 1);
    //player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
    player.deaths_counter.setText(player.deaths+"")
    player.kills_counter.setText(player.kills+"")
    
    player.headSprite.rotation = game.physics.arcade.angleToPointer(player.headSprite) + 3.14/2;  

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
		}
        if (charactersList[i].alive){
            if(charactersList[i].isBot && charactersList[i].owner == myId){
                charactersList[i].updateBot()
            }
            else if(charactersList[i].isBot){
                charactersList[i].updateGenericBefore();
                charactersList[i].updateGenericAfter()
            }
            else
                charactersList[i].update();
        }
    };
}

function render () {
}

function addbots (num,pass){
    Server.addbots(myId,num,pass);
}
function toggleBounce(pass){
    Server.toggleBounce(pass);
}