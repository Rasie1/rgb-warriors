var character;
var headSprite;

Character = function (index, game, x, y) {
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

    var x = def(x,0)
    var y = def(y,0)

    this.game = game;
    this.health = 30;
    this.SpeedX = playerSpeedX
    this.SpeedY = playerSpeedY

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

    this.baseSprite = game.add.sprite(x, y, 'enemy', 'tank1');
    this.headSprite = game.add.sprite(x, y, 'enemy', 'turret');
    this.auraSprite = game.add.sprite(x, y, 'aura');

    this.baseSprite.anchor.set(0.5);
    this.auraSprite.anchor.set(0.5);
    this.headSprite.anchor.set(0.3, 0.5);

    this.auraSprite.scale.setTo(10, 10);
    this.recolorAura()

    this.id = index;
    this.baseSprite.id = index;
    console.log("id="+index)
    game.physics.enable(this.baseSprite, Phaser.Physics.ARCADE);
    this.baseSprite.body.immovable = false;
    this.baseSprite.body.collideWorldBounds = true;
    this.baseSprite.body.bounce.setTo(0, 0);
    this.RCounter = 0
    this.GCounter = 0
    this.BCounter = 0
    var randomElement = Math.round(Math.random()*2)
    if (randomElement == 1) 
        this.RCounter++
    else if (randomElement == 2) 
        this.GCounter++
    else if (randomElement == 3) 
        this.BCounter++


    this.shouldMoveRight = false
    this.shouldMoveLeft = false
    this.shouldMoveTop = false
    this.shouldMoveBottom = false

    this.spell0Slot = new Spell()
    this.recolorAura()

    if (!game.device.desktop) {
        this.touchControls = new TouchControls(this)
        this.touchControls.init()
    }

    this.hpBar = null;
    if (myId != this.baseSprite.id)
    {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    }
};

Character.prototype.recreate = function (x,y) {

    this.health = 30;
    this.SpeedX = playerSpeedX
    this.SpeedY = playerSpeedY
    this.baseSprite.reset(x,y)
    this.headSprite.reset(x,y)
    
    this.currentSpeed =0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.RCounter = 0
    this.GCounter = 0
    this.BCounter = 0
    var randomElement = Math.round(Math.random()*2)
    if (randomElement == 1) this.RCounter++
    else if (randomElement == 2) this.GCounter++
    else if (randomElement == 3) this.BCounter++


}
Character.prototype.update = function() {
    
    var inputChanged = (
        this.cursor.left   != this.input.left ||
        this.cursor.right  != this.input.right ||
        this.cursor.up     != this.input.up ||
        this.cursor.down   != this.input.down ||
        this.cursor.fire   != this.input.fire ||
        this.cursor.spell0 != this.input.spell0 ||
        this.cursor.spell1 != this.input.spell1 ||
        this.cursor.spell2 != this.input.spell2 ||
        this.cursor.spell3 != this.input.spell3
    );
    
    
    if (inputChanged)
    {
        //Handle input change here
        //send new values to the server     
        if (this.baseSprite.id == myId)
        {
            // send latest valid state to the server
            this.input.x = this.baseSprite.x;
            this.input.y = this.baseSprite.y;
            this.input.rot = this.headSprite.rotation;
            
            
            eurecaServer.handleKeys(this.input);
            
        }
    }

    //cursor value is now updated by eurecaClient.exports.updateState method
    
    if (this.cursor.left)
    {
        this.shouldMoveLeft = true
    }
    else if (this.cursor.right)
    {
        this.shouldMoveRight = true
    }

    if (this.cursor.down)
    {
        this.shouldMoveBottom = true
    }
    else if (this.cursor.up)
    {
        this.shouldMoveTop = true
    }

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


    // commit movement
    if (this.shouldMoveLeft) {
        this.baseSprite.body.velocity.x = -this.SpeedX
        baseSprite.rotation = -3.14
        this.shouldMoveLeft   = false
    }
    else if (this.shouldMoveRight) {
        this.baseSprite.body.velocity.x = this.SpeedX
        baseSprite.rotation = 0
        this.shouldMoveRight  = false
    }
    else
    {
        this.baseSprite.body.velocity.x = 0
    }

    if (this.shouldMoveTop) {
        this.baseSprite.body.velocity.y = -this.SpeedY;
        baseSprite.rotation = baseSprite.rotation==-3.14 ? -3*3.14/4 : baseSprite.rotation==0 ? -3.14/4 : -3.14/2
        this.shouldMoveTop    = false
    }
    else if (this.shouldMoveBottom) {
        this.baseSprite.body.velocity.y = this.SpeedY;
        baseSprite.rotation = baseSprite.rotation==-3.14 ? 3*3.14/4 : baseSprite.rotation==0 ? 3.14/4 : 3.14/2
        this.shouldMoveBottom = false
    }
    else
    {
        this.baseSprite.body.velocity.y = 0
    }

    this.headSprite.x = this.baseSprite.x;
    this.headSprite.y = this.baseSprite.y;
    this.auraSprite.x = this.baseSprite.x;
    this.auraSprite.y = this.baseSprite.y;

    if (myId != this.baseSprite.id)
    {
        this.hpBar.x = this.baseSprite.x;
        this.hpBar.y = this.baseSprite.y - 42;    
    }
};


Character.prototype.fire = function(target) {
        if (!this.alive) return;
        //console.log(this.bullets.countDead());
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            //console.log(bullet);
            bullet.lifespan = 5000;
            bullet.reset(this.headSprite.x, this.headSprite.y);

            bullet.magicType = 'fireball';
            console.log('bullet type', bullet.magicType);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
        }
}

function recreate(deadId) {
    charactersList[deadId].recreate(Math.random()*mapWidth,Math.random()*mapHeight)
}

Character.prototype.kill = function() {
    this.alive = false;
    this.baseSprite.kill();
    if (myId != this.baseSprite.id)
        this.hpBar.kill();
    this.headSprite.kill();
    this.dropItem();
    setTimeout("recreate('"+this.id+"')",3000)
}

Character.prototype.dropItem = function() {
    makeItem(this.baseSprite.x,this.baseSprite.y)
}

Character.prototype.recolorAura = function() {
    var total = this.BCounter + this.GCounter + this.BCounter
    var r = Phaser.Math.clamp(255 * this.RCounter / total, 
                              0, 255)
    var g = Phaser.Math.clamp(255 * this.GCounter / total, 
                              0, 255)
    var b = Phaser.Math.clamp(255 * this.BCounter / total, 
                              0, 255)
    var a = Phaser.Math.clamp((this.RCounter + this.GCounter + this.BCounter) / 32, 
                              0, 1)

    var newTint = Phaser.Color.getColor(r, g, b)
    this.auraSprite.tint = newTint;
    this.auraSprite.alpha = a
}

Character.prototype.pickUpItem = function(itemSprite) {
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
    var Counter = this.RCounter+this.GCounter+this.BCounter
    if (Counter<=20) {
        this.SpeedX = playerSpeedX-Counter*10
        this.SpeedX = playerSpeedY-Counter*10
    }
    console.log("R="+this.RCounter+" G="+this.GCounter+" B="+this.BCounter)
    this.recolorAura()
}
