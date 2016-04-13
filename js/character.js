var character,
    headSprite,
    baseSprite,
    headSprite;

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
        spell6:false,
        mouseUp:false,
        mouseDown:false
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
        fireType:0,
        mouseUp:false,
        mouseDown:false
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
    this.SpeedX = playerSpeedX;
    this.SpeedY = playerSpeedY;

    //Fireballs, freeze bolts and vape projectiles
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullets', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('checkWorldBounds', true); 

    //Unused right now
    this.explosions = game.add.group();
    this.explosions.enableBody = true;
    this.explosions.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosions.createMultiple(20, 'kaboom', 0, false);
    this.explosions.setAll('anchor.x', 0.5);
    this.explosions.setAll('anchor.y', 0.5);
    this.explosions.forEach(function(explosion){
        explosion.animations.add('kaboom');
    },this)

    //Gas from vape projectiles
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

    //Weapon properties
    this.fireRate = 500;
    this.nextFire = 0;
    this.fireType = 6;

    //Personal statistics
    this.deaths = 0;
    this.kills = 0;

    //Alive status
    this.alive = true;
    this.hasDied = false;

    //Sprites
    this.auraSprite = game.add.sprite(x, y, 'aura');
    
    this.baseSprite = game.add.sprite(x, y, 'player-base');
    this.baseSprite.animations.add('move');

    this.headSprite = game.add.sprite(x, y, 'player-head');
    this.headSprite.animations.add('move');
    
    this.deadSprite = game.add.sprite(x, y, 'dead');
    this.deadSprite.kill()

    this.weapon = game.add.sprite(0,0,'weapon');
    game.physics.enable(this.weapon, Phaser.Physics.ARCADE);
    this.weapon.enableBody = true;
    this.weapon.physicsBodyType = Phaser.Physics.ARCADE;
    this.weapon.checkWorldBounds = true;
    this.weapon.kill()

    this.baseSprite.anchor.set(0.5);
    this.auraSprite.anchor.set(0.5);
    this.headSprite.anchor.set(0.5, 0.5);

    this.auraSprite.scale.setTo(10, 10);

    //Applying player ID
    this.id = index;
    this.baseSprite.id = index;

    //Physics
    game.physics.enable(this.baseSprite, Phaser.Physics.ARCADE);
    game.physics.enable(this.headSprite, Phaser.Physics.ARCADE);

    this.baseSprite.body.immovable = false;
    this.baseSprite.body.collideWorldBounds = true;
    this.baseSprite.body.bounce.setTo(0, 0);

    //Inventory
    this.inventory = [];

    if ((r!=-1 && r!=undefined) || (g!=-1 && g!=undefined) || (b!=-1 && b!=undefined)) {
        this.RCounter = r
        this.GCounter = g
        this.BCounter = b
    } else {
        this.RCounter = 0
        this.GCounter = 0
        this.BCounter = 0
    }
    this.recolorAura()

    //Spells
    this.spells = {};
    this.spells.Fireball = new Fireball()
    this.spells.HealingSpell = new HealingSpell()
    this.spells.Leap = new Leap()
    this.spells.Spike = new Spike()
    this.spells.ColdSphere = new ColdSphere()
    this.spells.Vape = new Vape()
    this.spells.CloseFighting = new CloseFighting()

    //Spells availability
    this.spellsAvailable = [];
    for (i = 0; i < 6; ++i)
        this.spellsAvailable[i] = false;   
    this.spellsAvailable[6] = true;

    //HP bar
    if (myId != this.baseSprite.id)
    {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    };

    //Continious firing (needs to be re-implemented)
    this.mouseAlreadyUpdated = false;

    //Put players behind the HUD (doesn't work properly??)
    playersGroup.add(this.baseSprite);
    playersGroup.add(this.weapon)
    playersGroup.sendToBack(playersGroup)
    playersGroup.sendToBack(this.weapon)
};

Character.prototype.recreate = function (x,y) {

    this.health = 100;
    this.SpeedX = playerSpeedX;
    this.SpeedY = playerSpeedY;
    this.baseSprite.reset(x,y);
    this.headSprite.reset(x,y);
    
    this.fireRate = 500;
    this.nextFire = 0;

    this.alive = true;
    this.hasDied = false;

    this.RCounter = 0;
    this.GCounter = 0;
    this.BCounter = 0;

    this.recolorAura();

    if (myId != this.baseSprite.id) {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    }

    if (this.id==player.id) {
        inventoryItem.kill();
        player.hpline.scale.setTo(Phaser.Math.min(player.health/maxHealth,1), 1);
        player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
    }

    for (i = 0; i <= 5; ++i)
        this.spellsAvailable[i] = false;  
}

Character.prototype.update = function() {

    //Checks difference between current input and last saved
    function checkInputChange(set1,set2,additional){
        var changed = false;
        for(var button in set1)
            if(typeof set1[button] == 'boolean' && typeof set2[button] == 'boolean')
                if(set1[button] != set2[button]){
                    changed = true;
                }
        if(typeof additional == 'object')
            for(i=0;i<additional.length;i++)
                if(set1[additional[i]] != set2[additional[i]]){
                    changed = true;
                }
        return changed;
    }
    var inputChanged = checkInputChange(this.cursor,this.input);
    if(this.input.fireType != this.fireType)
        inputChanged = true;
    var touchInputChanged = checkInputChange(touchControls.touchInput,this.touchInput,['joystickX','joystickY']);

    if (inputChanged || touchInputChanged)
    {    
        if (this.baseSprite.id == myId)
        {
            // send latest valid state to the server
            this.input.x = this.baseSprite.x;
            this.input.y = this.baseSprite.y;
            this.input.rot = this.headSprite.rotation;
            this.input.fireType = this.fireType;
            this.input.speedX = this.SpeedX;
            this.input.speedY = this.SpeedY;

            eurecaServer.handleKeys(this.input,this.baseSprite.x,this.baseSprite.y,this.RCounter,this.GCounter,this.BCounter);

            if (touchInputChanged)
            {
                eurecaServer.handleTouchInput(this.touchInput)

            }
            
        }
    }

    //Checks if player is firing without releasing the mouse button to update direction
    var isContiniouslyFiring = (this.cursor.fire && 
                                this.game.time.now+50 >= this.nextFire && 
                                !this.mouseAlreadyUpdated);
    if (isContiniouslyFiring){
        if (this.baseSprite.id == myId){
            this.mouseAlreadyUpdated = true;
            eurecaServer.handleRotation(this.input);
        }
    }

    //cursor value is now updated by eurecaClient.exports.updateState method       

    // commit movement
    var shouldAnim = false

    //Left and right movement
    if (this.cursor.left || this.cursor.a  || touchControls.touchInput.joystickX < -0.5) {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = -this.SpeedX;
        baseSprite.rotation = -3.14;
        shouldAnim = true
    }
    else if (this.cursor.right || this.cursor.d || touchControls.touchInput.joystickX > 0.5) {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = this.SpeedX;
        baseSprite.rotation = 0;
        shouldAnim = true
    }
    else
    {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = 0
    }

    //Up and down movement
    if (this.cursor.up || this.cursor.w || touchControls.touchInput.joystickY < -0.5) {
        this.headSprite.body.velocity.y 
        = this.baseSprite.body.velocity.y 
        = -this.SpeedY;
        baseSprite.rotation = baseSprite.rotation==-3.14 ? -3*3.14/4 : baseSprite.rotation==0 ? -3.14/4 : -3.14/2
        shouldAnim = true
    }
    else if (this.cursor.down  || this.cursor.s || touchControls.touchInput.joystickY > 0.5) {
        this.headSprite.body.velocity.y 
        = this.baseSprite.body.velocity.y 
        = this.SpeedY;
        baseSprite.rotation = baseSprite.rotation==-3.14 ? 3*3.14/4 : baseSprite.rotation==0 ? 3.14/4 : 3.14/2
        shouldAnim = true
    }
    else
    {
        this.baseSprite.body.velocity.y 
        = this.headSprite.body.velocity.y 
        = 0
    }

    //Player animation
    if (shouldAnim) {
        this.baseSprite.animations.play('move', 10, true); 
        this.headSprite.animations.play('move', 10, true); 
    }
    else
    {
        this.baseSprite.animations.stop();
        this.headSprite.animations.stop();
    }

    //Firing
    if (this.cursor.fire)
    {
        if(!this.spellsAvailable[this.fireType]){
            this.fireType=6;
            touchControls.moveHighlight(6)
        }
        this.mouseAlreadyUpdated = false;
        this.fire({x:this.cursor.tx, y:this.cursor.ty},this.fireType);
    }

    //Spell select
    if ((this.cursor.spell0 || this.touchInput.button0) && this.spellsAvailable[0]) // fireball
    {
        this.fireType=0;
        touchControls.moveHighlight(0)
    }
    if ((this.cursor.spell1 || this.touchInput.button1)  && this.spellsAvailable[1]) //healing
    {
        this.fireType=1;
        touchControls.moveHighlight(1)
    }
    if ((this.cursor.spell2 || this.touchInput.button2)  && this.spellsAvailable[2]) //leap
    {
        this.fireType=2;
        touchControls.moveHighlight(2)
    }
    if ((this.cursor.spell3 || this.touchInput.button3)  && this.spellsAvailable[3]) //spike
    {
        this.fireType=3;
        touchControls.moveHighlight(3)
    }
    if ((this.cursor.spell4 || this.touchInput.button4)  && this.spellsAvailable[4]) //cold sphere
    {
        this.fireType=4;
        touchControls.moveHighlight(4)
    }
    if ((this.cursor.spell5 || this.touchInput.button5)  && this.spellsAvailable[5]) //vape
    {
        this.fireType=5;
        touchControls.moveHighlight(5)
    }
    if ((this.cursor.spell6 || this.touchInput.button6)) //close-in fighting
    {
        this.fireType=6;
        touchControls.moveHighlight(6)
    }

    var stopScrolling = false;
    var previouslySelected = this.fireType;
    if(this.cursor.mouseUp){
        var checkingWeapon = this.fireType;
        this.cursor.mouseUp = false;        
        while(!stopScrolling){
            if(checkingWeapon<6)
                checkingWeapon = checkingWeapon+1
            else
                checkingWeapon = 0;
            if(this.spellsAvailable[checkingWeapon]){
                touchControls.moveHighlight(checkingWeapon);
                this.fireType = checkingWeapon;
                stopScrolling = true;
            }
            if(checkingWeapon == previouslySelected)
                stopScrolling = true;
        }
    }
    if(this.cursor.mouseDown){
        var checkingWeapon = this.fireType;
        this.cursor.mouseUp = false;        
        while(!stopScrolling){
            if(checkingWeapon>0)
                checkingWeapon = checkingWeapon-1
            else
                checkingWeapon = 6;
            if(this.spellsAvailable[checkingWeapon]){
                touchControls.moveHighlight(checkingWeapon);
                this.fireType = checkingWeapon;
                stopScrolling = true;
            }
            if(checkingWeapon == previouslySelected)
                stopScrolling = true;
        }
    }

    //Set player position
    this.headSprite.x
    = this.weapon.x
    = this.auraSprite.x
    = this.baseSprite.x;
    this.headSprite.y
    = this.weapon.y
    = this.auraSprite.y
    = this.baseSprite.y;

    //Set hp bar
    if (this.hpBar != null) {
        this.hpBar.x = this.baseSprite.x;
        this.hpBar.y = this.baseSprite.y - 42;    
    }

    //Collisions
    game.physics.arcade.collide(this.baseSprite, obstacles);
    game.physics.arcade.collide( obstacles,this.bullets, bulletHit,null,this);
    for (var c in charactersList){
        game.physics.arcade.collide(charactersList[c].baseSprite, this.baseSprite);
    }
};


Character.prototype.fire = function(target,fireType) {
        if (!this.alive) return
        switch (fireType) {
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
    this.alive = false;
    this.baseSprite.kill();
    if (this.hpBar != null) {
        this.hpBar.kill();
    }
    this.deadSprite.reset(this.headSprite.x-32,this.headSprite.y-32);
    this.deadSprite.lifespan = 3000;
    this.headSprite.kill();
    this.auraSprite.kill();

    if (this.id==player.id){
        touchControls.moveHighlight(6); //Reset to default weapon
        for(var spell in player.spells) 
            player.spells[spell].spellPower = 0; //Reset spellpower

        //Reset inventory helper
        for (i=0;i<touchControls.buttons.length-1;i++){
            touchControls.buttons[i].kill();
            touchControls.buttons[i].alpha = 0;
            touchControls.elementReminder[i].kill();
            touchControls.buttonMapping[i].alpha = 0;
            touchControls.spellPowerCounter[i].alpha = 0;
        }
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

    //Add a new spell or upgrade already existing
    this.spellsAddSpell = function(spellId,alias){
        if(this.spells[alias].spellPower==0){
            this.fireType=spellId;
            touchControls.moveHighlight(spellId);
            touchControls.spellPowerCounter[spellId].alpha = 1;
        }
        else{
            touchControls.spellPowerCounter[spellId].setText('lvl '+this.spells[alias].spellPower)
        }
        this.spells[alias].spellPower = Phaser.Math.min(maxSpellsLevel, this.spells[alias].spellPower + 1);
        this.spellsAvailable[spellId] = true;
        touchControls.buttons[spellId].reset();
        touchControls.buttonMapping[spellId].alpha = 1;
        touchControls.buttons[spellId].alpha = 1;
    };

    //Handles inventory when picking up items
    function inventorySwitch(spellsRegEx,frame,reminderFrame){
        for(i=0;i<touchControls.buttons.length;i++){
            if(spellsRegEx.test(i)){
                if(touchControls.buttons[i].alpha != 1){
                    touchControls.buttons[i].reset();
                    touchControls.buttons[i].alpha = 0.3;
                }
                touchControls.elementReminder[i].reset();
                if(typeof reminderFrame == 'boolean' && reminderFrame)                       
                    if(i==1)
                        touchControls.elementReminder[i].frame = touchControls.frames[i][1]
                    else
                        touchControls.elementReminder[i].frame = touchControls.frames[i][0]
                else
                    touchControls.elementReminder[i].frame = touchControls.frames[i][reminderFrame]
            }
        }
        inventoryItem.reset();
        inventoryItem.frame = frame;
    }

    itemSprite.kill();
    this.inventory.push(itemSprite.element);
    this.privateHealth += 3;    //Heal on item pickup
    if(this.id == myId){
        if(this.inventory.length>=2){
            switch(this.inventory[0]){
                case 1:
                    switch(this.inventory[1]){
                        case 1:
                            this.spellsAddSpell(0,'Fireball')
                            break;
                        case 2:
                            this.spellsAddSpell(2,'Leap')
                            break;
                        case 3:
                            this.spellsAddSpell(5,'Vape')
                            break;
                    };
                    break;
                case 2:
                    switch(this.inventory[1]){
                        case 1:
                            this.spellsAddSpell(2,'Leap')
                            break;
                        case 2:
                            this.spellsAddSpell(3,'Spike')
                            break;
                        case 3:
                            this.spellsAddSpell(1,'HealingSpell')
                            break;
                    };
                    break;
                case 3:
                    switch(this.inventory[1]){
                        case 1:
                            this.spellsAddSpell(5,'Vape')
                            break;
                        case 2:
                            this.spellsAddSpell(1,'HealingSpell')
                            break;
                        case 3:
                            this.spellsAddSpell(4,'ColdSphere')
                            break;
                    };
                    break;
            };
            inventoryItem.kill();
            this.inventory=[];

            //Reset inventory helper
            for(i=0;i<touchControls.buttons.length;i++){
                if(i!=6)
                    touchControls.elementReminder[i].kill();
                if(touchControls.buttons[i].alpha == 0.3){
                    touchControls.buttons[i].kill();
                    touchControls.buttons[i].alpha = 0;
                }
            }
        }
        else{
            switch (itemSprite.element) {
                case 1:
                    this.RCounter++;
                    inventorySwitch(/[0,2,5]/,0,1);
                    break;
                case 2:
                    this.GCounter++;
                    inventorySwitch(/[1,2,3]/,1,true);
                    break;
                case 3:
                    this.BCounter++;
                    inventorySwitch(/[1,4,5]/,2,0);
                    break ;
            }
        }
    }

    //Elements counter for Aura
    var counter = this.RCounter+this.GCounter+this.BCounter
    if (counter <= 20) {
        this.SpeedX = playerSpeedX - counter*5
        this.SpeedY = playerSpeedY - counter*5
    }
    this.recolorAura();

    //Send information to server if local player
    if(this.baseSprite.id==myId)
        eurecaServer.pickUpItem(itemSprite.id);
}
