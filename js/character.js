
var mouseWheel;

var character,
    headSprite,
    baseSprite,
    headSprite;

var spellAliases = [
    'HealingSpell',
    'Leap',
    'Spike',
    'Fireball',
    'ColdSphere',
    'Vape',
    'CloseFighting'
]
Character = function (options) {
    this.options = {
        id:null,
        game:game,
        x:0,
        y:0,
        speed:playerSpeedX,
        color:false,
        isBot:false,
        owner:null
    };
    for(o in options)
        this.options[o] = options[o];

    this.cursor = {}
    this.input = {}
    
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

    this.status = {};
    this.statusActual = {};

    this.game = this.options.game;
    this.health = maxHealth;
    this.HPTimer = 0;

    //Bot stuff
    this.isBot = this.options.isBot;
    this.owner = this.options.owner;

    this.lastUpdate = 0;
    this.touching  = {};

    this.movementDecidedX = false;
    this.movementDecidedY = false;
    this.wasGoingRight = false;
    this.wasGoingLeft = false;
    this.wasGoingUp = false;
    this.wasGoingDown = false;

    this.failSafeCounter = 10;

    this.nextClosestTargetCheck = 0;
    this.targetCheckRate = targetCheckRate;
    this.nextStuckCheck = 0;
    this.stuckCheckRate = stuckCheckRate;

    this.actualTarget = {};
    this.nextActualTargetCheck = 0;
    this.actualTargetCheckRate = actualTargetCheckRate;
    this.targetReached = false;

    this.closestItem = {};
    this.closestItem.alive = false;
    this.newClosestItem = {};
    this.newClosestItem.alive = false;

    this.goingX = 0;
    this.goingY = 0;

    //Player speed
    this.SpeedX = this.options.speed;
    this.SpeedY = this.options.speed;
    this.speedMultiplier = 1;
    this.canMove = true;

    //Fireballs, freeze bolts and vape projectiles
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullets', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('checkWorldBounds', true); 
    for(i=0;i<this.bullets.children.length;i++)
        this.bullets.children[i].body.bounce.set(1);; 

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

    this.reMouseWheel = 0;

    //Personal statistics
    this.deaths = 0;
    this.kills = 0;

    //Alive status
    this.alive = true;
    this.hasDied = false;

    var x = this.options.x;
    var y = this.options.y;

    //Shadow
    this.shadow = game.add.sprite(x, y, 'player-head');
    this.shadow.anchor.set(0.5);
    this.shadow.tint = 0x000000;
    this.shadow.alpha = 0.4;

    //Sprites
    this.auraSprite = game.add.sprite(x, y, 'aura');
    
    this.baseSprite = game.add.sprite(x, y, 'player-base');
    this.baseSprite.animations.add('move');

    this.headSprite = game.add.sprite(x, y, 'player-head');
    this.headSprite.animations.add('move');

    if(this.options.color)
        this.headSprite.tint = this.options.color;
    
    this.deadSprite = game.add.sprite(x, y, 'dead');
    this.deadSprite.kill()

    this.weapon = game.add.sprite(0,0,'weapon');
    game.physics.enable(this.weapon, Phaser.Physics.ARCADE);
    this.weapon.enableBody = true;
    this.weapon.physicsBodyType = Phaser.Physics.ARCADE;
    this.weapon.scale.setTo(0.4, 0.4);
    this.weapon.anchor.set(0.3,1);
    this.weapon.checkWorldBounds = true;
    this.weapon.kill()

    this.baseSprite.anchor.set(0.5);
    this.auraSprite.anchor.set(0.5);
    this.headSprite.anchor.set(0.5, 0.5);

    this.auraSprite.scale.setTo(10, 10);

    //Applying player ID
    this.id = this.options.id;
    this.baseSprite.id = this.options.id;
    if(this.id != myId)
        this.baseSprite.tag = 'enemy'
    else
        this.baseSprite.tag = 'me';
    //console.log(this.tag)

    //Body for teleport checks
    if(this.id == myId){
        this.fakeSprite = game.add.sprite(x, y, 'player-head');
        this.fakeSprite.anchor.set(0.5);
        this.fakeSprite.kill();
        game.physics.enable(this.fakeSprite, Phaser.Physics.ARCADE);
        this.fakeSprite.enableBody = true;
        this.fakeSprite.alpha = 0;
    }

    //Physics
    game.physics.enable(this.baseSprite, Phaser.Physics.ARCADE);
    game.physics.enable(this.headSprite, Phaser.Physics.ARCADE);

    this.baseSprite.body.immovable = false;
    this.baseSprite.body.collideWorldBounds = true;
    this.baseSprite.body.bounce.setTo(0, 0);

    //Inventory
    this.inventory = [];

    this.RCounter = 0
    this.GCounter = 0
    this.BCounter = 0
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
    if (this.id == myId || (this.isBot && this.owner == myId)){
        
        this.spellsAvailable = [];
        for (i = 0; i < 6; ++i)
            this.spellsAvailable[i] = false;   
        this.spellsAvailable[6] = true;
    }

    //HP bar
    if (myId != this.baseSprite.id)
    {
        this.hpBar = game.add.sprite(x - 32, y - 32, 'hpBar');
        this.hpBar.anchor.set(0.5);
    };

    //Put players behind the HUD (doesn't work properly??)
    playersGroup.add(this.baseSprite);
    playersGroup.add(this.weapon)
    playersGroup.sendToBack(playersGroup)
    playersGroup.sendToBack(this.weapon)

    //mousewheel detection
    if(this.baseSprite.id == myId){
        var dis = this;
        mouseWheel = function(d){dis.mouseWheel(d)}
        window.addEventListener('wheel',mouseWheel);
    }

};

Character.prototype.recreate = function (x,y) {

    this.health = maxHealth;

    this.SpeedX = playerSpeedX;
    this.SpeedY = playerSpeedY;
    this.canMove = true;
    this.speedMultiplier = 1;

    this.baseSprite.reset(x,y);
    this.headSprite.reset(x,y);
    this.shadow.reset(x,y);
    
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

    if (this.id==myId) {
        player.hpline.scale.setTo(Phaser.Math.min(player.health/maxHealth,1), 1);
        //player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
    }

    if(this.baseSprite.id == myId){
        var dis = this;
        mouseWheel = function(d){dis.mouseWheel(d)}
        window.addEventListener('wheel',mouseWheel);
    }
}

Character.prototype.kill = function() {
    //console.log('killed')
    this.alive = false;
    this.baseSprite.kill();
    if (this.hpBar != null) {
        this.hpBar.kill();
    }
    this.deadSprite.reset(this.headSprite.x-32,this.headSprite.y-32);
    this.deadSprite.lifespan = 3000;
    this.headSprite.kill();
    this.auraSprite.kill();
    this.shadow.kill();

    if (this.id == myId || (this.isBot && this.owner == myId)){
        for (i = 0; i <= 5; ++i)
            this.spellsAvailable[i] = false;
        for(var spell in this.spells){
            this.spells[spell].resetPower(); //Reset spellpower
        }
    }

    if (this.id==myId){
        inventoryItem.kill();
        touchControls.moveHighlight(6); //Reset to default weapon

        //Reset inventory helper
        for (i=0;i<touchControls.buttons.length-1;i++){
            touchControls.buttons[i].kill();
            touchControls.buttons[i].alpha = 0;
            touchControls.elementReminder[i].kill();
            touchControls.buttonMapping[i].alpha = 0;
            touchControls.spellPowerCounter[i].alpha = 0;
        }
        window.removeEventListener('wheel',mouseWheel);
        
    }
    if (this.id==myId || (this.isBot && this.owner==myId))
        this.dropItem();
    if(this.id != myId)
        this.enableProjectileBounce = player.enableProjectileBounce;
        
}

Character.prototype.update = function() {

    this.updateGenericBefore();

    for(a in this.input){
        this.cursor[a] = this.input[a];
    }

    if (this.id == myId){
        handleInput(this)
        
        this.input.left = cursors.left.isDown;
        this.input.right = cursors.right.isDown;
        this.input.up = cursors.up.isDown;
        this.input.down = cursors.down.isDown;

        this.input.w = cursors.w.isDown;
        this.input.a = cursors.a.isDown;
        this.input.s = cursors.s.isDown;
        this.input.d = cursors.d.isDown;

        this.tx = game.input.x + game.camera.x;
        this.ty = game.input.y + game.camera.y;

        this.input.x = this.baseSprite.x;
        this.input.y = this.baseSprite.y;
        this.input.rot = this.headSprite.rotation;
        this.input.speedX = this.SpeedX;
        this.input.speedY = this.SpeedY;

        this.touchInput = touchCursors;

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
        //var inputChanged = (this.input.velX != this.cursor.velX || this.input.velY != this.cursor.velY);
        var touchInputChanged = checkInputChange(touchControls.touchInput,this.touchInput,['joystickX','joystickY']);

        if (inputChanged || touchInputChanged)
        {    
            // send latest valid state to the server

           Server.handleKeys(this.input,this.baseSprite.x,this.baseSprite.y,this.RCounter,this.GCounter,this.BCounter,myId);

            if (touchInputChanged)
            {
                Server.handleTouchInput(this.touchInput)

            }
                
        }
    }      
    if(!this.alive)
        return;

    //Left and right movement
    var up = false;
    var down = false;
    var left = false;
    var right = false;
    if(this.input.up || this.input.w || touchControls.touchInput.joystickY < -0.5)
        up = true;
    if(this.input.down  || this.input.s || touchControls.touchInput.joystickY > 0.5)
        down = true;
    if(this.input.left || this.input.a  || touchControls.touchInput.joystickX < -0.5)
        left = true;
    if(this.input.right || this.input.d || touchControls.touchInput.joystickX > 0.5)
        right = true;

    var speed;
    if(
        (up && left || up && right) ||
        (down && left || down && right) ||
        (left && up || left && down) ||
        (right && up || up && down)
    ){
        speed = Math.sqrt(Math.pow(this.SpeedX,2)+Math.pow(this.SpeedY,2))/2*this.speedMultiplier
    }
    else{
        speed = this.SpeedX*this.speedMultiplier;
    };

    if (left && this.canMove) {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = -speed;
        this.baseSprite.rotation = -Math.PI;
    }
    else if (right && this.canMove) {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = speed;
        this.baseSprite.rotation = 0;
    }
    else
    {
        this.headSprite.body.velocity.x 
        = this.baseSprite.body.velocity.x 
        = 0
    }

    //Up and down movement
    if (up && this.canMove) {
        this.headSprite.body.velocity.y 
        = this.baseSprite.body.velocity.y 
        = -speed;
        this.baseSprite.rotation = this.baseSprite.rotation==-Math.PI ? -3*Math.PI/4 : this.baseSprite.rotation==0 ? -Math.PI/4 : -Math.PI/2
    }
    else if (down && this.canMove) {
        this.headSprite.body.velocity.y 
        = this.baseSprite.body.velocity.y 
        = speed;
        this.baseSprite.rotation = this.baseSprite.rotation==-Math.PI ? 3*Math.PI/4 : this.baseSprite.rotation==0 ? Math.PI/4 : Math.PI/2
    }
    else
    {
        this.baseSprite.body.velocity.y 
        = this.headSprite.body.velocity.y 
        = 0
    }


    //Firing
    if (game.input.activePointer.isDown && this.id == myId)
    {
        if(!this.spellsAvailable[this.fireType]){
            this.fireType=6;
            touchControls.moveHighlight(6)
        }
        this.fire({x:this.tx, y:this.ty},this.fireType);
    }

    //Spell select
    if(this.id == myId){
        for(k=0;k<7;k++){
            if ((cursors['spell'+k].isDown || this.touchInput['button'+k]) && this.spellsAvailable[k]){
                if(/[0,1,2]/.test(k)){
                    if(this.spellsAvailable[this.fireType]){
                        this.fire({x:this.tx, y:this.ty},k);
                    }
                }
                else{
                    this.fireType=k;
                    touchControls.moveHighlight(k)
                }
            }
        }
    };
    
    this.updateGenericAfter();
};
Character.prototype.updateGenericBefore = function(){

    //Interval for health regen
    if (game.time.now > this.HPTimer && (this.id == myId || (this.isBot && this.owner == myId))){
        this.HPTimer = game.time.now + regenInterval;
        if (this.health < maxHealth && this.alive)
            Server.updateHP(this.id, regenValue);
    }    

    //Collisions
    game.physics.arcade.collide(this.baseSprite, obstacles);
    game.physics.arcade.collide( obstacles,this.bullets, bulletHitWall,null,this);
    for (var c in charactersList){
        game.physics.arcade.collide(charactersList[c].baseSprite, this.baseSprite);
    }

    //Items collision
    if(this.id == myId){
        for (var i in items)
            game.physics.arcade.overlap(
                items[i],
                this.baseSprite, 
                this.pickUpItem, 
                null, 
                this
            )
    }
    else if(this.isBot && this.owner == myId){

        for (var i in items)
            game.physics.arcade.overlap(
                items[i],
                this.baseSprite, 
                this.pickUpItemBot, 
                null, 
                this
            )
    };
}
Character.prototype.updateGenericAfter = function(){
    //Apply animation
    if(this.baseSprite.body.velocity.x != 0 || this.baseSprite.body.velocity.y != 0){
        this.baseSprite.animations.play('move', 10, true); 
        this.headSprite.animations.play('move', 10, true); 
    }
    else{
        this.baseSprite.animations.stop();
        this.headSprite.animations.stop();
    }

    //Set player position
    this.headSprite.x
    = this.weapon.x
    = this.auraSprite.x 
    = this.shadow.x
    = this.baseSprite.x;
    this.headSprite.y
    = this.weapon.y
    = this.auraSprite.y
    = this.shadow.y
    = this.baseSprite.y;

    this.shadow.x = this.baseSprite.x+3;
    this.shadow.y = this.baseSprite.y+10;    


    this.shadow.rotation = this.headSprite.rotation;

    //Set hp bar
    if (this.hpBar != null) {
        this.hpBar.x = this.baseSprite.x;
        this.hpBar.y = this.baseSprite.y - 42;    
    }
}

Character.prototype.fire = function(target,fireType) {
        if (!this.alive) return
        switch (fireType) {
            case 0:
                this.spells.HealingSpell.cast(this)
            break
            case 1:
                this.spells.Leap.cast(this,target)
            break
            case 2:
                this.spells.Spike.cast(this,target)
            break
            case 3:
                this.spells.Fireball.cast(this,target)
            break
            case 4:
                this.spells.ColdSphere.cast(this,target)
            break
            case 5:
                this.spells.Vape.cast(this,target)
            break
            case 6:
                this.spells.CloseFighting.cast(this,target)
            break
        }
}

Character.prototype.dropItem = function() {
    Server.dropItem(this.baseSprite.x,this.baseSprite.y)
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

    itemSprite.kill();
    itemSprite.shadow.kill();
    this.inventory.push(itemSprite.element);
    Server.updateHP(this.id,pickupHealthValue); //Heal on item pickup

    //Send information to server if local player
    Server.pickUpItem(itemSprite.id,itemSprite.element,this.id);

    //Add a new spell or upgrade already existing
    this.spellsAddSpell = function(spellId,alias){
        if(this.spells[alias].spellPower==0){
            if(spellId > 2){
                this.fireType=spellId;       
                if(!this.isBot)     
                    touchControls.moveHighlight(spellId);
            }
            if(!this.isBot)
                touchControls.spellPowerCounter[spellId].alpha = 1;
        }
        else{
            if(!this.isBot){
                touchControls.spellPowerCounter[spellId].setText(
                    this.spells[alias].spellPower<maxSpellsLevel ? 'lvl '+(this.spells[alias].spellPower+1) : 'max lvl'
                );
                touchControls.levelup[spellId].alpha = 1;
                game.add.tween(touchControls.levelup[spellId]).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true); 
            }
            this.spells[alias].levelup(); 
        }
        this.spells[alias].spellPower = Phaser.Math.min(maxSpellsLevel, this.spells[alias].spellPower + 1);
        this.spellsAvailable[spellId] = true;
        if(!this.isBot){
            touchControls.buttons[spellId].reset();
            touchControls.buttonMapping[spellId].alpha = 1;
            touchControls.buttons[spellId].alpha = 1;
        }
    };

    //Handles inventory when picking up items
    function inventorySwitch(spellsRegEx,frame,reminderFrame,isBot){
        if(isBot)
            return;
        for(i=0;i<touchControls.buttons.length;i++){
            if(spellsRegEx.test(i)){
                if(touchControls.buttons[i].alpha != 1){
                    touchControls.buttons[i].reset();
                    touchControls.buttons[i].alpha = 0.3;
                }
                touchControls.elementReminder[i].reset();
                if(typeof reminderFrame == 'boolean' && reminderFrame)                       
                    if(i==1)
                        touchControls.elementReminder[i].frame = touchControls.frames[i][0]
                    else
                        touchControls.elementReminder[i].frame = touchControls.frames[i][1]
                else
                    touchControls.elementReminder[i].frame = touchControls.frames[i][reminderFrame]
            }
        }
        inventoryItem.reset();
        inventoryItem.frame = frame;
    }

    if(this.inventory.length>=2){
        switch(this.inventory[0]){
            case 1:
                switch(this.inventory[1]){
                    case 1:
                        this.spellsAddSpell(3,'Fireball')
                        break;
                    case 2:
                        this.spellsAddSpell(1,'Leap')
                        break;
                    case 3:
                        this.spellsAddSpell(5,'Vape')
                        break;
                };
                break;
            case 2:
                switch(this.inventory[1]){
                    case 1:
                        this.spellsAddSpell(1,'Leap')
                        break;
                    case 2:
                        this.spellsAddSpell(2,'Spike')
                        break;
                    case 3:
                        this.spellsAddSpell(0,'HealingSpell')
                        break;
                };
                break;
            case 3:
                switch(this.inventory[1]){
                    case 1:
                        this.spellsAddSpell(5,'Vape')
                        break;
                    case 2:
                        this.spellsAddSpell(0,'HealingSpell')
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
        if(!this.isBot){
            for(i=0;i<touchControls.buttons.length;i++){
                if(i!=6)
                    touchControls.elementReminder[i].kill();
                if(touchControls.buttons[i].alpha == 0.3){
                    touchControls.buttons[i].kill();
                    touchControls.buttons[i].alpha = 0;
                }
            }
        }
    }
    else{
        switch (itemSprite.element) {
            case 1:
                this.RCounter++;
                inventorySwitch(/[3,1,5]/,0,1,this.isBot);
                break;
            case 2:
                this.GCounter++;
                inventorySwitch(/[0,1,2]/,1,true,this.isBot);
                break;
            case 3:
                this.BCounter++;
                inventorySwitch(/[0,4,5]/,2,0,this.isBot);
                break ;
        }
    }

    //Elements counter for Aura
    var counter = this.RCounter+this.GCounter+this.BCounter
    if (counter <= 20) {
        this.SpeedX = playerSpeedX - counter*5;
        this.SpeedY = playerSpeedY - counter*5;
    };
    Server.updateSpeed(this.id,this.SpeedX);
    this.recolorAura();
}

Character.prototype.mouseWheel = function(d){
    if (game.time.now > this.reMouseWheel && this.id == myId){
        this.reMouseWheel = game.time.now + 10;
        if(d.deltaY != 0){
            var stopScrolling = false;
            var previouslySelected = this.fireType;
            var checkingWeapon = this.fireType; 
            if(d.deltaY>0){      
                while(!stopScrolling){
                    if(checkingWeapon<6)
                        checkingWeapon = checkingWeapon+1
                    else
                        checkingWeapon = 3;
                    if(this.spellsAvailable[checkingWeapon]){
                        touchControls.moveHighlight(checkingWeapon);
                        this.fireType = checkingWeapon;
                        stopScrolling = true;
                    }
                    if(checkingWeapon == previouslySelected)
                        stopScrolling = true;
                }
            }
            else{
                while(!stopScrolling){
                    if(checkingWeapon>3)
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
        }
    }
}