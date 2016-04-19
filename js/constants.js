var myId = 0;
var initialSpawnLocationX = 0;
var initialSpawnLocationY = 0;

var mapX   = 0;
var mapY    = 0; 

//Map height and width are also specified in server.js
var mapWidth  =  2000;
var mapHeight =  2000;

var cameraDeadzoneWidth = 0.25;
var cameraDeadzoneHeight = 0.25; 

var playerSpeedX = 200;
var playerSpeedY = 200;

var maxGameWidth = 3000; 
var maxGameHeight = 3000;

var maxHealth = 100;
var regenInterval = 500;
var regenValue = 1;
var pickupHealthValue = 5;

var maxSpellsLevel = 3


// Spells
var closeFightWeaponDamage = -20;
var healingSpellHealingPercentage = 10;

//Bots
var targetCheckRate = 200;
var actualTargetCheckRate = 1000;
var stuckCheckRate = 500;
var maxStrayItemDistance = 300;
var meleeRange = 100;

//Assets
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
    game.load.spritesheet('inventoryItem', 'assets/items.png', 61, 61, 3);
    game.load.image('window_health_secondary', 'assets/window_health_secondary.png')
    game.load.image('window_counter', 'assets/window_counter.png')
    game.load.image('logoS3', 'assets/logo/logo_fire.png')
    game.load.image('logoS0', 'assets/logo/logo_health.png')
    game.load.image('logoS1', 'assets/logo/logo_portal.png')
    game.load.image('logoS2', 'assets/logo/logo_spike.png')
    game.load.image('logoS4', 'assets/logo/logo_cold.png')
    game.load.image('logoS5', 'assets/logo/logo_smoke.png')
    game.load.image('logoS6', 'assets/logo/logo_sword.png')
    game.load.image('highlight', 'assets/logo/highlight.png')
    game.load.image('reload', 'assets/logo/fill.png')
    game.load.image('levelup', 'assets/logo/levelup.png')
    game.load.image('lineOfSight', 'assets/lineofsight.png')
}