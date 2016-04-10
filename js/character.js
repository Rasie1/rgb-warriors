var character
var headSprite

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
        spell5:false,
        spell6:false
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
        spell5:false,
        spell6:false,
        fireType:0
    }

    
    this.touchInput = { 
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

    this.game = game;
    this.privateHealth = maxHealth;
    this.health = this.privateHealth;
    this.SpeedX = playerSpeedX
    this.SpeedY = playerSpeedY

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullets', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    //this.bullets.setAll('checkWorldBounds', true); 

    this.explosions = game.add.group();
    this.explosions.enableBody = true;
    this.explosions.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosions.createMultiple(20, 'kaboom', 0, false);
    this.explosions.setAll('anchor.x', 0.5);
    this.explosions.setAll('anchor.y', 0.5);
    this.explosions.forEach(function(explosion){
        explosion.animations.add('kaboom');
    },this)

    this.vapelosions = game.add.group();
    this.vapelosions.enableBody = true;
    this.vapelosions.physicsBodyType = Phaser.Physics.ARCADE;
    this.vapelosions.createMultiple(20, 'vapelosion', 0, false);
    this.vapelosions.setAll('anchor.x', 0.5);
    this.vapelosions.setAll('anchor.y', 0.5);
    this.bullets.setAll('checkWorldBounds', true); 
    this.vapelosions.forEach(function(explosion){
        explosion.animations.add('vapelosion');
    },this)

    this.currentSpeed =0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;
    this.type = 0
    this.deaths = 0
    this.kills = 0

    this.baseSprite = game.add.sprite(x, y, 'player-base');
    this.baseSprite.animations.add('move');

    this.headSprite = game.add.sprite(x, y, 'player-head');
    this.headSprite.animations.add('move');
    
    this.auraSprite = game.add.sprite(x, y, 'aura');
    this.deadSprite = game.add.sprite(x, y, 'dead');
    this.deadSprite.kill()

    this.baseSprite.anchor.set(0.5);
    this.auraSprite.anchor.set(0.5);
    this.headSprite.anchor.set(0.5, 0.5);

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

    this.weapon = game.add.sprite(0,0,'weapon');
    game.physics.enable(this.weapon, Phaser.Physics.ARCADE);
    this.weapon.enableBody = true;
    this.weapon.physicsBodyType = Phaser.Physics.ARCADE;
    this.weapon.checkWorldBounds = true;
    this.weapon.scale.setTo(0.5, 0.5)
    this.weapon.anchor.set(0.5,1.5)
    this.weapon.kill()
    //inventory
    this.inventory = [];
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
        {
            this.RCounter++
            this.inventory.push(1);
        }
        else if (randomElement == 2) 
        {
            this.GCounter++
            this.inventory.push(2);
        }
        else if (randomElement == 3) 
        {
            this.BCounter++
            this.inventory.push(3);
        }
    }


    this.spells = {};
    this.spells.Fireball = new Fireball()
    this.spells.HealingSpell = new HealingSpell()
    this.spells.Leap = new Leap()
    this.spells.Spike = new Spike()
    this.spells.ColdSphere = new ColdSphere()
    this.spells.Vape = new Vape()
    this.spells.CloseFighting = new CloseFighting()

    this.spellsAvailable = [];
    for (i = 0; i < 6; ++i)
        this.spellsAvailable[i] = false;//false;
    this.type = 6;

    this.recolorAura()

    this.hpBar = null;
    if (myId != this.baseSprite.id)
    {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    };

    //continious firing
    this.mouseAlreadyUpdated = false;
};

Character.prototype.recreate = function (x,y) {

    this.health = 100;
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
    if (myId != this.baseSprite.id) {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    }
    player.rItems.setText(this.RCounter+"")
    player.gItems.setText(this.GCounter+"")
    player.bItems.setText(this.BCounter+"")
    player.hpline.scale.setTo(Phaser.Math.min(player.health/maxHealth,1), 1);
    player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
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
        this.cursor.spell5 != this.input.spell5 || 
        this.cursor.spell6 != this.input.spell6 ||
        this.input.fireType != this.type
    );
    var touchInputChanged = (
        touchControls.touchInput.joystickX != this.touchInput.joystickX ||
        touchControls.touchInput.joystickY != this.touchInput.joystickY ||
        touchControls.touchInput.button0 != this.touchInput.button0 ||
        touchControls.touchInput.button1 != this.touchInput.button1 ||
        touchControls.touchInput.button2 != this.touchInput.button2 ||
        touchControls.touchInput.button3 != this.touchInput.button3 ||
        touchControls.touchInput.button4 != this.touchInput.button4 ||
        touchControls.touchInput.button5 != this.touchInput.button5 ||
        touchControls.touchInput.button6 != this.touchInput.button6
    );
    var isContiniouslyFiring = (this.cursor.fire && 
                                this.game.time.now+50 >= this.nextFire && 
                                !this.mouseAlreadyUpdated);
    if (inputChanged || touchInputChanged)
    {
        //Handle input change here
        //send new values to the server     
        if (this.baseSprite.id == myId)
        {
            // send latest valid state to the server
            this.input.x = this.baseSprite.x;
            this.input.y = this.baseSprite.y;
            this.input.rot = this.headSprite.rotation;
            this.input.fireType = this.type;
            this.input.speedX = this.SpeedX;
            this.input.speedY = this.SpeedY;


            eurecaServer.handleKeys(this.input,this.baseSprite.x,this.baseSprite.y,this.RCounter,this.GCounter,this.BCounter);

            if (touchInputChanged)
            {
                eurecaServer.handleTouchInput(this.touchInput)

            }
            
        }
    }
    if (isContiniouslyFiring){
        if (this.baseSprite.id == myId){
            this.mouseAlreadyUpdated = true;
            eurecaServer.handleRotation(this.input);
        }
    }
    //cursor value is now updated by eurecaClient.exports.updateState method
    
    var shouldAnim = false

    // commit movement
    if (this.cursor.left || this.cursor.a  || touchControls.touchInput.joystickX < -0.5) {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = this.weapon.body.velocity.x 
        = -this.SpeedX
        baseSprite.rotation = -3.14
        shouldAnim = true
    }
    else if (this.cursor.right || this.cursor.d || touchControls.touchInput.joystickX > 0.5) {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = this.weapon.body.velocity.x 
        = this.SpeedX
        baseSprite.rotation = 0
        shouldAnim = true
    }
    else
    {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = this.weapon.body.velocity.x 
        = 0

        this.baseSprite.animations.stop();
        this.headSprite.animations.stop();
    }

    if (this.cursor.up || this.cursor.w || touchControls.touchInput.joystickY < -0.5) {
        this.headSprite.body.velocity.y 
        = this.baseSprite.body.velocity.y 
        = this.weapon.body.velocity.y 
        = -this.SpeedY
        baseSprite.rotation = baseSprite.rotation==-3.14 ? -3*3.14/4 : baseSprite.rotation==0 ? -3.14/4 : -3.14/2
        shouldAnim = true
    }
    else if (this.cursor.down  || this.cursor.s || touchControls.touchInput.joystickY > 0.5) {
        this.headSprite.body.velocity.y 
        = this.baseSprite.body.velocity.y 
        = this.weapon.body.velocity.y 
        = this.SpeedY
        baseSprite.rotation = baseSprite.rotation==-3.14 ? 3*3.14/4 : baseSprite.rotation==0 ? 3.14/4 : 3.14/2
        shouldAnim = true
    }
    else
    {
        this.baseSprite.body.velocity.y 
        = this.headSprite.body.velocity.y 
        = this.weapon.body.velocity.y = 0
    }

    if (shouldAnim) {
        this.baseSprite.animations.play('move', 10, true); 
        this.headSprite.animations.play('move', 10, true); 
    }
    else
    {
        this.baseSprite.animations.stop();
        this.headSprite.animations.stop();
    }


    if (this.cursor.fire)
    {
        //console.log(this.type,this.spells.Fireball)
        if (this.alive) {
            this.fire({x:this.cursor.tx, y:this.cursor.ty},this.type);
        }
    }

    if ((this.cursor.spell0 || this.touchInput.button0) && this.spellsAvailable[0]) // fireball
    {
        this.type=0
    }
    if ((this.cursor.spell1 || this.touchInput.button1)  && this.spellsAvailable[1]) //healing
    {
        this.type=1
    }
    if ((this.cursor.spell2 || this.touchInput.button2)  && this.spellsAvailable[2]) //leap
    {
        this.type=2
    }
    if ((this.cursor.spell3 || this.touchInput.button3)  && this.spellsAvailable[3]) //spike
    {
        this.type=3
    }
    if ((this.cursor.spell4 || this.touchInput.button4)  && this.spellsAvailable[4]) //cold sphere
    {
        this.type=4
    }
    if ((this.cursor.spell5 || this.touchInput.button5)  && this.spellsAvailable[5]) //vape
    {
        this.type=5
    }
    if ((this.cursor.spell6 || this.touchInput.button6)) //close-in fighting
    {
        this.type=6
    }


    this.headSprite.x
    = this.auraSprite.x
    = this.weapon.x         // на самом деле
    = this.baseSprite.x;
    this.headSprite.y
    = this.auraSprite.y
    = this.weapon.y         // не обязательно
    = this.baseSprite.y;

    if (this.hpBar != null) {
        this.hpBar.x = this.baseSprite.x;
        this.hpBar.y = this.baseSprite.y - 42;    
    }

    game.physics.arcade.collide(this.baseSprite, obstacles);
    game.physics.arcade.collide( obstacles,this.bullets, bulletHit,null,this);
    for (var c in charactersList) game.physics.arcade.collide(charactersList[c].baseSprite, this.baseSprite/* урон от столкновения: , function(){eurecaServer.updateHP(this.id,-1)},null,this*/);
};


Character.prototype.fire = function(target,type) {
        if (!this.alive) return
        switch (type) {
            case 0:
                this.spells.Fireball.cast(this)
            break
            case 1:
                this.spells.HealingSpell.cast(this)
            break
            case 2:
                this.spells.Leap.cast(this)
            break
            case 3:
                this.spells.Spike.cast(this)
            break
            case 4:
                this.spells.ColdSphere.cast(this)
            break
            case 5:
                this.spells.Vape.cast(this)
            break
            case 6:
                this.spells.CloseFighting.cast(this)
            break
        }
}


Character.prototype.kill = function() {
    if (player.id==this.id) player.deaths++
    else player.kills++
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
    for(i=0;i<touchControls.buttons.length;i++){
        touchControls.buttons[i].kill()
    }
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
            player.rItems.setText(this.RCounter)
            break
        case 2:
            this.GCounter++
            player.gItems.setText(this.GCounter)
            break
        case 3:
            this.BCounter++
            player.bItems.setText(this.BCounter)
            break 
    }
    this.inventory.push(itemSprite.element);
    this.privateHealth += 3
    if(this.inventory.length>=2){
        switch(this.inventory[0]){
            case 1:
                switch(this.inventory[1]){
                    case 1:
                        this.spells.Fireball.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.Fireball.spellPower + 1);
                        this.spells.Fireball.cooldown -= 3
                        this.spellsAvailable[0] = true;
                        touchControls.buttons[0].reset();
                        console.log('fireball available')
                        touchControls.buttons[0].reset()
                        break;
                    case 2:
                        this.spells.Leap.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.Leap.spellPower + 1);
                        this.spellsAvailable[2] = true;
                        this.spells.Leap.jumpDist += 50;
                        this.spells.Leap.cooldown -= 30;
                        console.log('leap available')
                        touchControls.buttons[2].reset()
                        break;
                    case 3:
                        this.spells.Vape.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.Vape.spellPower + 1);
                        this.spellsAvailable[5] = true;
                        console.log('vape available')
                        touchControls.buttons[5].reset()
                        break;
                };
                break;
            case 2:
                switch(this.inventory[1]){
                    case 1:
                        this.spells.Leap.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.Leap.spellPower + 1);
                        this.spells.Leap.jumpDist += 50;
                        this.spells.Leap.cooldown -= 30;
                        this.spellsAvailable[2] = true;
                        console.log('leap available');
                        touchControls.buttons[2].reset()
                        break;
                    case 2:
                        this.spells.Spike.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.Spike.spellPower + 1);
                        this.spellsAvailable[3] = true;
                        this.spells.Spike.cooldown -= 9;
                        console.log('spike available')
                        touchControls.buttons[3].reset()
                        break;
                    case 3:
                        this.spells.HealingSpell.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.HealingSpell.spellPower + 1);
                        this.spellsAvailable[1] = true;
                        console.log('healing available')
                        touchControls.buttons[1].reset()
                        break;
                };
                break;
            case 3:
                switch(this.inventory[1]){
                    case 1:
                        this.spells.Vape.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.Vape.spellPower + 1);
                        this.spellsAvailable[5] = true;
                        console.log('vape available')
                        touchControls.buttons[5].reset()
                        break;
                    case 2:
                        this.spells.HealingSpell.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.HealingSpell.spellPower + 1);
                        this.spellsAvailable[1] = true;
                        console.log('healing available')
                        touchControls.buttons[1].reset()
                        break;
                    case 3:
                        this.spells.ColdSphere.spellPower = Phaser.Math.max(maxSpellsLevel, this.spells.ColdSphere.spellPower + 1);
                        this.spellsAvailable[4] = true;
                        console.log('coldsphere available')
                        touchControls.buttons[4].reset()
                        break;
                };
                break;
        }
        this.inventory=[];
        //console.log(this.spells);

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
