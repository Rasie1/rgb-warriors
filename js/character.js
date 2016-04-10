var character;
var headSprite;

Character = function (index, game, x, y, r, g, b) {
    this.cursor = {
        left:false,
        right:false,
        up:false,
        down:false,
        w:false,
        a:false,
        s:false,
        d:false,
        fire:false,
        spell0:false,
        spell1:false,
        spell2:false,
        spell3:false,
        spell4:false,
        spell5:false
    }

    this.input = {
        left:false,
        right:false,
        up:false,
        down:false,
        w:false,
        a:false,
        s:false,
        d:false,
        fire:false,
        spell0:false,
        spell1:false,
        spell2:false,
        spell3:false,
        spell4:false,
        spell5:false
    }

    /*var x = def(x,0)
    var y = def(y,0)*/

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
    this.type = 0

    this.baseSprite = game.add.sprite(x, y, 'enemy', 'tank1');
    this.headSprite = game.add.sprite(x, y, 'enemy', 'turret');
    this.auraSprite = game.add.sprite(x, y, 'aura');
    this.deadSprite = game.add.sprite(x, y, 'dead');
    this.deadSprite.kill()

    this.wall = game.add.sprite(0, 0, 'wall');
    game.physics.enable(this.wall, Phaser.Physics.ARCADE);
    this.wall.kill()

    this.baseSprite.anchor.set(0.5);
    this.auraSprite.anchor.set(0.5);
    this.headSprite.anchor.set(0.3, 0.5);

    this.auraSprite.scale.setTo(10, 10);
    this.recolorAura()

    this.id = index;
    this.baseSprite.id = index;
    console.log("id="+index)
    game.physics.enable(this.baseSprite, Phaser.Physics.ARCADE);
    game.physics.enable(this.headSprite, Phaser.Physics.ARCADE);
    this.baseSprite.body.immovable = false;
    this.baseSprite.body.collideWorldBounds = true;
    this.baseSprite.body.bounce.setTo(0, 0);
    if ((r!=-1 && r!=undefined) || (g!=-1 && g!=undefined) || (b!=-1 && b!=undefined)) {
        this.RCounter = r
        this.GCounter = g
        this.BCounter = b
    } else {
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
    }

    // input section
    this.shouldMoveRight = false
    this.shouldMoveLeft = false
    this.shouldMoveTop = false
    this.shouldMoveBottom = false
    this.shouldCastSpell0 = false
    this.shouldCastSpell1 = false
    this.shouldCastSpell2 = false
    this.shouldCastSpell3 = false
    this.shouldCastSpell4 = false
    this.shouldCastSpell5 = false
    this.touchInputChanged = false

    this.spell0Slot = new Fireball()
    this.spell1Slot = new HealingSpell()
    this.spell2Slot = new Leap()
    this.spell3Slot = new Spike()
    this.spell4Slot = new ColdSphere()
    this.spell5Slot = new Vape()

    this.recolorAura()

    this.hpBar = null;
    if (myId != this.baseSprite.id)
    {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    };

    //continious firing
    this.mouseAlreadyUpdated = false;

    //inventory
    this.inventory = [];
    this.spellPowers = {
        HealingSpell:0,
        Fireball:0,
        Leap:0,
        Spike:0,
        ColdSphere:0,
        Vape:0
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
    this.recolorAura()
    this.hpBar = null;
    if (myId != this.baseSprite.id)
    {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    }
}

Character.prototype.update = function() {
 
    var inputChanged = (
        this.cursor.left   != this.input.left ||
        this.cursor.right  != this.input.right ||
        this.cursor.up     != this.input.up ||
        this.cursor.down   != this.input.down ||
        this.cursor.w      != this.input.w ||
        this.cursor.a      != this.input.a ||
        this.cursor.s      != this.input.s ||
        this.cursor.d      != this.input.d ||
        this.cursor.fire   != this.input.fire ||
        this.cursor.spell0 != this.input.spell0 ||
        this.cursor.spell1 != this.input.spell1 ||
        this.cursor.spell2 != this.input.spell2 ||
        this.cursor.spell3 != this.input.spell3 ||
        this.cursor.spell4 != this.input.spell4 ||
        this.cursor.spell5 != this.input.spell5

    );
    
    var isContiniouslyFiring = (this.cursor.fire && 
                                this.game.time.now+50 >= this.nextFire && 
                                !this.mouseAlreadyUpdated);
    if (inputChanged || this.touchInputChanged)
    {
        //Handle input change here
        //send new values to the server     
        if (this.baseSprite.id == myId)
        {
            // send latest valid state to the server
            this.input.x = this.baseSprite.x;
            this.input.y = this.baseSprite.y;
            this.input.rot = this.headSprite.rotation;
            
            
            eurecaServer.handleKeys(this.input,this.baseSprite.x,this.baseSprite.y,this.RCounter,this.GCounter,this.BCounter);

            this.touchInputChanged = false
            
        }
    }
    if (isContiniouslyFiring){
        if (this.baseSprite.id == myId){
            this.mouseAlreadyUpdated = true;
            eurecaServer.handleRotation(this.input);
        }
    }
    //cursor value is now updated by eurecaClient.exports.updateState method
    
    if (this.cursor.left || this.cursor.a)
    {
        this.shouldMoveLeft = true
    }
    else if (this.cursor.right || this.cursor.d)
    {
        this.shouldMoveRight = true
    }

    if (this.cursor.down || this.cursor.s)
    {
        this.shouldMoveBottom = true
    }
    else if (this.cursor.up  || this.cursor.w)
    {
        this.shouldMoveTop = true
    }

    if (this.cursor.fire)
    {   
        console.log("this.cursor.fire");
        if (this.alive) {
            console.log("this.alive");
            //this.fire({x:this.cursor.tx, y:this.cursor.ty});
            eurecaServer.castRemoteAttack(this.id,{x:this.cursor.tx, y:this.cursor.ty},this.type)
        }
    }

    if (this.cursor.spell0)
    {
        this.shouldCastSpell0 = true
    }
    if (this.cursor.spell1)
    {
        this.shouldCastSpell1 = true
    }
    if (this.cursor.spell2)
    {
        this.shouldCastSpell2 = true
    }
    if (this.cursor.spell3)
    {
        this.shouldCastSpell3 = true
    }
    if (this.cursor.spell4)
    {
        this.shouldCastSpell4 = true
    }
    if (this.cursor.spell5)
    {
        this.shouldCastSpell5 = true
    }

    // commit movement
    if (this.shouldMoveLeft) {
        this.headSprite.body.velocity.x = this.baseSprite.body.velocity.x = -this.SpeedX
        baseSprite.rotation = -3.14
        this.shouldMoveLeft   = false
    }
    else if (this.shouldMoveRight) {
        this.headSprite.body.velocity.x = this.baseSprite.body.velocity.x = this.SpeedX
        baseSprite.rotation = 0
        this.shouldMoveRight  = false
    }
    else
    {
        this.headSprite.body.velocity.x = this.baseSprite.body.velocity.x = 0
    }

    if (this.shouldMoveTop) {
        this.headSprite.body.velocity.y = this.baseSprite.body.velocity.y = -this.SpeedY
        baseSprite.rotation = baseSprite.rotation==-3.14 ? -3*3.14/4 : baseSprite.rotation==0 ? -3.14/4 : -3.14/2
        this.shouldMoveTop    = false
    }
    else if (this.shouldMoveBottom) {
        this.headSprite.body.velocity.y = this.baseSprite.body.velocity.y = this.SpeedY
        baseSprite.rotation = baseSprite.rotation==-3.14 ? 3*3.14/4 : baseSprite.rotation==0 ? 3.14/4 : 3.14/2
        this.shouldMoveBottom = false
    }
    else
    {
        this.baseSprite.body.velocity.y = 0
        this.headSprite.body.velocity.y = 0
    }

    if (this.shouldCastSpell0) // fireball
    {
        /*this.shouldCastSpell0 = false
        if (this.spell0Slot.onCooldown())
            this.spell0Slot.cast(this);*/
        this.type=0
    }
    if (this.shouldCastSpell1) //healing
    {
        this.type=1
    }
    if (this.shouldCastSpell2) //leap
    {
        this.type=2
    }
    if (this.shouldCastSpell3) //spike
    {
        this.type=3
    }
    if (this.shouldCastSpell4) //cold sphere
    {
        this.type=4
    }
    if (this.shouldCastSpell5) //vape
    {
<<<<<<< HEAD
        this.shouldCastSpell5 = false
        if (this.spell5Slot.onCooldown())
            this.spell5Slot.cast(this);
=======
        this.type=5
>>>>>>> 627405c156bd379083047fec93a4fdf30f8d7926
    }

    this.headSprite.x = this.baseSprite.x;
    this.headSprite.y = this.baseSprite.y;
    this.auraSprite.x = this.baseSprite.x;
    this.auraSprite.y = this.baseSprite.y;

    if (this.hpBar != null)
    {
        this.hpBar.x = this.baseSprite.x;
        this.hpBar.y = this.baseSprite.y - 42;    
    }

    game.physics.arcade.collide(this.baseSprite, obstacles);
    game.physics.arcade.collide(this.bullets, obstacles, function(a){a.kill()},null,this);
    for (var c in charactersList) game.physics.arcade.collide(charactersList[c].baseSprite, this.baseSprite/* урон от столкновения: , function(){eurecaServer.updateHP(this.id,-1)},null,this*/);
};


Character.prototype.fire = function(target,type) {
        if (!this.alive) return
        //console.log(this.bullets.countDead());
        console.log("Character.prototype.fire("+type+")");
        switch (type) {
            case 0:
            case 4:
            case 5:
                if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                    this.mouseAlreadyUpdated = false;
                    this.nextFire = this.game.time.now + this.fireRate;
                    var bullet = this.bullets.getFirstDead();
                    bullet.lifespan = 5000;
                    bullet.reset(this.headSprite.x, this.headSprite.y);

                    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
                }
            break
            case 1: // healing
            break
            case 2: // jump
            break
            case 3:
                console.log("case 3");
                this.wall.reset(this.headSprite.x, this.headSprite.y-56)
                this.wall.lifespan = 5000;
                this.wall.rotation = this.game.physics.arcade.moveToObject(this.wall, target, 0)
            break

        }
}


Character.prototype.kill = function() {
    this.alive = false;
    this.baseSprite.kill();
    if (this.hpBar != null) {
        this.hpBar.kill();
        this.hpBar = null;
    }
    this.deadSprite.reset(this.headSprite.x-32,this.headSprite.y-32);
    this.deadSprite.lifespan = 3000;
    this.headSprite.kill();
    this.auraSprite.kill();
    this.dropItem();
}

Character.prototype.dropItem = function() {
    eurecaServer.dropItem(this.baseSprite.x,this.baseSprite.y)
}

Character.prototype.recolorAura = function() {
    var total = this.RCounter + this.GCounter + this.BCounter
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
    this.inventory.push(itemSprite.element);
    if(this.inventory.length>=2){
        switch(this.inventory[0]){
            case 1:
                switch(this.inventory[1]){
                    case 1:
                        this.spellPowers.Fireball++;
                        break;
                    case 2:
                        this.spellPowers.Leap++;
                        break;
                    case 3:
                        this.spellPowers.Vape++;
                        break;
                };
                break;
            case 2:
                switch(this.inventory[1]){
                    case 1:
                        this.spellPowers.Leap++;
                        break;
                    case 2:
                        this.spellPowers.Spike++;
                        break;
                    case 3:
                        this.spellPowers.HealingSpell++;
                        break;
                };
                break;
            case 3:
                switch(this.inventory[1]){
                    case 1:
                        this.spellPowers.Vape++;
                        break;
                    case 2:
                        this.spellPowers.HealingSpell++;
                        break;
                    case 3:
                        this.spellPowers.ColdSphere++;
                        break;
                };
                break;
        }
        this.inventory=[];
        console.log(this.spellPowers);

    }
    var counter = this.RCounter+this.GCounter+this.BCounter
    if (counter <= 20) {
        this.SpeedX = playerSpeedX - counter*10
        this.SpeedY = playerSpeedY - counter*10
    }
    // console.log("R="+this.RCounter+" G="+this.GCounter+" B="+this.BCounter)
    this.recolorAura()
    eurecaServer.pickUpItem(itemSprite.id);
}
