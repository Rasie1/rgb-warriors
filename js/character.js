var character;
var headSprite;

Character = function (index, game) {
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

    this.baseSprite = game.add.sprite(x, y, 'enemy', 'tank1');
    this.headSprite = game.add.sprite(x, y, 'enemy', 'turret');
    this.auraSprite = game.add.sprite(x, y, 'aura');

    this.baseSprite.anchor.set(0.5);
    this.auraSprite.anchor.set(0.5);
    this.headSprite.anchor.set(0.3, 0.5);

    this.auraSprite.scale.setTo(10, 10);
    this.recolorAura()

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


    this.spell0Slot = new Spell()
    this.touchControls = new TouchControls(this)
};

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
        this.baseSprite.body.velocity.x = -playerSpeedX;
    }
    else if (this.cursor.right)
    {
        this.baseSprite.body.velocity.x = playerSpeedX;
    }
    else
    {
        this.baseSprite.body.velocity.x = 0;
    };

    if (this.cursor.down)
    {
        this.baseSprite.body.velocity.y = playerSpeedY;
    }
    else if (this.cursor.up)
    {
        this.baseSprite.body.velocity.y = -playerSpeedY;
    }
    else
    {
        this.baseSprite.body.velocity.y = 0;
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

    this.headSprite.x = this.baseSprite.x;
    this.headSprite.y = this.baseSprite.y;
    this.auraSprite.x = this.baseSprite.x;
    this.auraSprite.y = this.baseSprite.y;
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


Character.prototype.kill = function() {
    this.alive = false;
    this.baseSprite.kill();
    this.headSprite.kill();
}

Character.prototype.dropItem = function() {
    console.log("dropItem()")
    makeItem(this.baseSprite.x,this.baseSprite.y)
}

Character.prototype.recolorAura = function() {
    // var counterMax = 10
    // var r = counterMax - this.RCounter
    // var g = counterMax - this.GCounter
    // var b = counterMax - this.BCounter

    // var newTint = Phaser.Color.toRGBA
    // this.auraSprite.tint = newTint;


    var r = Phaser.Math.clamp(this.RCounter * 16, 0, 255)
    var g = Phaser.Math.clamp(this.GCounter * 16, 0, 255)
    var b = Phaser.Math.clamp(this.BCounter * 16, 0, 255)

    var src_A = 1.0
    var src_R = r
    var src_G = g
    var src_B = b
    var dst_R = 0
    var dst_G = 0
    var dst_B = 0
    var dst_A = 1.0
    dst_R = (src_R * src_A + dst_R * (255 - src_A));
    dst_G = (src_G * src_A + dst_G * (255 - src_A));
    dst_B = (src_B * src_A + dst_B * (255 - src_A));
    dst_A = Phaser.Math.min((src_A + dst_A) * 255, 255);

    // var r = Phaser.Math.clamp(this.RCounter * 16, 0, 255)
    // var g = Phaser.Math.clamp(this.GCounter * 16, 0, 255)
    // var b = Phaser.Math.clamp(this.BCounter * 16, 0, 255)
    var newTint = Phaser.Color.toRGBA(dst_R, dst_G, dst_B, dst_A)
    console.log(dst_R, ' ', dst_G, ' ', dst_B, ' ', dst_A)
    this.auraSprite.tint = newTint;
}

Character.prototype.pickUpItem = function(itemSprite) {
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
    this.recolorAura()
}
