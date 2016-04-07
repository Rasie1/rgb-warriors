var myId=0;

var player;
var character;
var platforms;
var cursors;
var stars;

var playersList = [];

var ready = false;
var eurecaServer;
console.log(eurecaClientSetup);

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('star1', 'assets/star1.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

}

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
        if (playersList[id]) {
            playersList[id].kill();
            delete playersList[id];
            console.log('killing ', id, playersList[id]);
        }
    }   
    
    eurecaClient.exports.spawnEnemy = function(i, x, y)
    {
        
        if (i == myId || playersList[i]) return; //this is me or player already exists
        
        console.log('SPAWN');
        var char = new PlayableCharacter(i, game);
        playersList[i] = char;
    }
    
    eurecaClient.exports.updateState = function(id, state)
    {
        console.log('updated')
        if (playersList[id])  {
            playersList[id].cursor = state;
            playersList[id].character.x = state.x;
            playersList[id].character.y = state.y;
            playersList[id].update();
        }
    }
}

function PlayableCharacter(index,game){
    var x = 0;
    var y = 0;

    this.game = game;
    this.character = game.add.sprite(0, 0, 'dude');
    game.physics.arcade.enable(this.character);

    this.character.id = index;
    this.alive = true;

    this.character.body.gravity.y = 300;
    this.character.body.collideWorldBounds = true;

    this.character.animations.add('left', [0, 1, 2, 3], 10, true);
    this.character.animations.add('right', [5, 6, 7, 8], 10, true);

    this.cursor = {
        left:false,
        right:false,
        up:false     
    }

    this.input = {
        left:false,
        right:false,
        up:false
    }

}

PlayableCharacter.prototype.update = function() {
     //if (this.character.id != myId)
        //console.log('moved');

    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up 
    );
    
    
        //Handle input change here
        //send new values to the server     
    if (inputChanged)
    {
        //Handle input change here
        //send new values to the server     
        if (this.character.id == myId)
        {
            // send latest valid state to the server
            this.input.x = this.character.x;
            this.input.y = this.character.y;    
            
            eurecaServer.handleKeys(this.input);
            
        }
    }
    

    //cursor value is now updated by eurecaClient.exports.updateState method
    if (this.cursor.left)
    {
        if (this.character.id != myId)
            console.log(this+" going left");
        this.character.body.velocity.x = -150;
        this.character.animations.play('left');
    }
    else if (this.cursor.right)
    {     
        if (this.character.id != myId)
            console.log(this+" going right"); 
        this.character.body.velocity.x = 150;
        this.character.animations.play('right');

    }
    else
    {
        this.character.animations.stop();
        this.character.frame = 4;
        this.character.body.velocity.x = 0; 
    }

    if(this.cursor.up){
        if (this.character.body.touching.down)
        {
            this.character.body.velocity.y = -250;
        }
        else if(this.character.body.touching.left){
            this.character.body.velocity.y = -250;
            console.log('left')
        }
        else if(this.character.body.touching.right){
            this.character.body.velocity.y = -250;
            console.log('right')
        }
    }
    game.physics.arcade.collide(this.character, platforms);
    
};

PlayableCharacter.prototype.kill = function() {
    this.alive = false;
    this.character.kill();
}

var game = new Phaser.Game(800, 600, Phaser.WebGL, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });


function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.sprite(0, 0, 'sky');
    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;

    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(2,2);

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(1, 2);

    playersList = {};
    
    player = new PlayableCharacter(myId, game);
    playersList[myId] = player;
    character = player.character;
    character.x=0;
    character.y=0;

    cursors = game.input.keyboard.createCursorKeys();
    
}

function update() {
    if (!ready) return;
    //console.log(playersList[1]);

    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;

for (var i in playersList)
    {
        if (playersList[i].alive)
        {
            playersList[i].update();
        }
    }
}
function render () {}
