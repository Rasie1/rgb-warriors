Spell = function() {
    this.spellPower = 0;
    this.nextFire = 0;
    this._cooldown = this.cooldown;
    if(this.bulletSpeed)
        this._bulletSpeed = this.bulletSpeed;
    if(this.healingSpellHealing)
        this._healingSpellHealing = this.healingSpellHealing;
    if(this.jumpDist)
        this._jumpDist = this.jumpDist;
    if(this.distance)
        this._distance = this.distance
    if(this.stayTime)
        this._stayTime = this.stayTime
    if(this.damage)
        this._damage = this.damage 
};

Spell.prototype.cast = function(character) {

}

Spell.prototype.castProjectile = function(character,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,target){
    if (game.time.now > this.nextFire && game.time.now > character.nextFire && character.bullets.countDead() > 0){
        character.mouseAlreadyUpdated = false;
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate;
        this.displayCooldowns(character,spellId);
        if(!character.isBot)
            Client.handleKeys(character.input,character.baseSprite.x,character.baseSprite.y,character.RCounter,character.GCounter,character.BCounter,character.id);
        Client.castProjectile(character.id,bulletType,bulletFrame,bulletSpeed,bulletDamage,spellPowerBoost,spellId,this.spellPower,target.x,target.y);
        return true
    }
    else
        return false
}

Spell.prototype.displayCooldowns = function(character,spellId){
    if(!character.isBot){
        character.HUD.reload[spellId].scale.y = 1;
        game.add.tween(character.HUD.reload[spellId].scale).to( { x: 1, y: 0 }, this.cooldown, Phaser.Easing.Linear.None, true);  
        for(i=0;i<character.HUD.reload.length;i++){
            if(character.spellsAvailable[i] && i != spellId && character.HUD.reload[i].scale.y == 0){
                character.HUD.reload[i].scale.y = 1;
                game.add.tween(character.HUD.reload[i].scale).to( { x: 1, y: 0 }, character.fireRate, Phaser.Easing.Linear.None, true);  
            }
        }
    }
}
Spell.prototype.levelup = function(){
    
}
Spell.prototype.resetPower = function(){
    this.cooldown = this._cooldown;
    if(this.bulletSpeed)
        this.bulletSpeed = this._bulletSpeed;
    if(this.healingSpellHealing)
        this.healingSpellHealing = this._healingSpellHealing;
    if(this.jumpDist)
        this.jumpDist = this._jumpDist;
    if(this.distance)
        this.distance = this._distance
    if(this.stayTime)
        this.stayTime = this._stayTime
    if(this.damage)
        this.damage = this._damage 
    this.spellPower = 0;
}


// Fireball
function Fireball() {
    this.cooldown = 500;
    this.bulletSpeed = 750;
    Spell.call(this);
}

Fireball.prototype = Object.create(Spell.prototype);

Fireball.prototype.constructor = Fireball

Fireball.prototype.cast = function(character,target){
    return this.castProjectile(character,0,0,this.bulletSpeed,-15,5,3,target)
};

// Cold Sphere
function ColdSphere() {
    this.cooldown = 1000;
    this.bulletSpeed = 600;
    this.visualEffectSpriteEnd = game.add.sprite(0, 0, 'ice')
    this.visualEffectSpriteEnd.anchor.set(0.5, 0.5)
    this.visualEffectSpriteEnd.kill();
    Spell.call(this);
}

ColdSphere.prototype = Object.create(Spell.prototype);

ColdSphere.prototype.constructor = ColdSphere

ColdSphere.prototype.cast = function(character,target){
    return this.castProjectile(character,5,2,this.bulletSpeed,-10,2,4,target)
};

// Vape
function Vape() {
    this.cooldown = 1000;
    this.bulletSpeed = 500;
    Spell.call(this);
}

Vape.prototype = Object.create(Spell.prototype);
Vape.prototype.constructor = Vape;
Vape.prototype.cast = function(character,target){
    return this.castProjectile(character,6,1,this.bulletSpeed,-5,1,5,target)
};


// Healing Spell
function HealingSpell() {
    this.cooldown = 2000;
    this.healingSpellHealing = 10;
    this.visualEffectSprite = game.add.sprite(0, 0, 'yellow-jolt')
    this.visualEffectSprite.animations.add('cast');
    this.visualEffectSprite.anchor.set(0.5, 0.5);
    this.visualEffectSprite.kill();
    Spell.call(this);
}

HealingSpell.prototype = Object.create(Spell.prototype);

HealingSpell.prototype.constructor = HealingSpell

HealingSpell.prototype.cast = function(character){
    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        character.mouseAlreadyUpdated = false;
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate; 
        this.displayCooldowns(character,0);

        Client.updateHP(character.id, this.healingSpellHealing + 5 * this.spellPower,null,true);
    }
};

// Leap
function Leap() {
    this.cooldown = 1000;

    this.jumpDist = 300;

    this.visualEffectSpriteBegin = game.add.sprite(0, 0, 'yellow-fireball')
    this.visualEffectSpriteBegin.animations.add('cast');
    this.visualEffectSpriteBegin.anchor.set(0.5, 0.5)
    this.visualEffectSpriteBegin.kill()
    this.visualEffectSpriteEnd = game.add.sprite(0, 0, 'yellow-fireball')
    this.visualEffectSpriteEnd.animations.add('cast');
    this.visualEffectSpriteEnd.anchor.set(0.5, 0.5)
    this.visualEffectSpriteEnd.kill();

    Spell.call(this);
}

Leap.prototype = Object.create(Spell.prototype);

Leap.prototype.constructor = Leap

Leap.prototype.cast = function(character,target){

    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        var curPos = new Phaser.Point(character.baseSprite.x, character.baseSprite.y);
        var target = new Phaser.Point(target.x, target.y);


        var dist = Phaser.Math.min(this.jumpDist + this.spellPower * 50,
                                   Phaser.Math.distance(curPos.x,
                                                        curPos.y,
                                                        target.x,
                                                        target.y));
        var offset_x = dist * Math.cos(Phaser.Math.angleBetweenPoints(curPos, target));
        var offset_y = dist * Math.sin(Phaser.Math.angleBetweenPoints(curPos, target));
        target.x = curPos.x + offset_x;
        target.y = curPos.y + offset_y;
        character.fakeSprite.reset(target.x,target.y);
        if(!game.physics.arcade.overlap(character.fakeSprite, obstacles) &&
           !game.physics.arcade.overlap(character.fakeSprite, playersGroup)){
            character.mouseAlreadyUpdated = false;
            this.nextFire = game.time.now + this.cooldown;
            character.nextFire = game.time.now + character.fireRate;     
            this.displayCooldowns(character,1);

            Client.doLeap(character.id, target.x, target.y,curPos.x,curPos.y);
        }
    }
};
Leap.prototype.levelup = function(){
    this.cooldown = 1000 - 100*this.spellPower
}

// Spike
function Spike() {
    this.cooldown = 1000
    this.distance = 128
    this.stayTime = 5
    this.damage = -15
    Spell.call(this);
}

Spike.prototype = Object.create(Spell.prototype);

Spike.prototype.constructor = Spike

Spike.prototype.cast = function(character,target){

    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        character.mouseAlreadyUpdated = false;
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate; 
        this.displayCooldowns(character,2);

        var curPos = new Phaser.Point(character.baseSprite.x, character.baseSprite.y);
        var target = new Phaser.Point(target.x, target.y);

        var offset = Phaser.Point.subtract(target, curPos).normalize()

        target.x = offset.x * this.distance + curPos.x
        target.y = offset.y * this.distance + curPos.y
        Client.doSpike(character.id,
                         target.x,
                         target.y,
                         this.stayTime,
                         this.damage);
    }

};

//close-in fighting
function CloseFighting()
{
	this.cooldown = 1000;
    Spell.call(this);
}

CloseFighting.prototype = Object.create(Spell.prototype)

CloseFighting.prototype.constructor = CloseFighting

CloseFighting.prototype.cast = function(character,target)
{
    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        character.mouseAlreadyUpdated = false;
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate; 
        this.displayCooldowns(character,6);
        if(!character.isBot)
            Client.handleKeys(character.input,character.baseSprite.x,character.baseSprite.y,character.RCounter,character.GCounter,character.BCounter,character.id);
    	Client.castCloseAttack(character.id, {x: target.x,
        									y: target.y});
        return true
    }
    else
        return false;
}




//Projectiles hit
function bulletHit (victim, bullet) {
    bullet.kill();
    if(((this.id == myId && victim.tag == 'enemy') || (this.isBot && this.owner == myId && (victim.tag == 'enemy' || victim.tag == 'me'))) && bullet.damage!=0 ){
        if(victim.health>0) {
            Client.updateHP(victim.id, bullet.damage - bullet.spellPowerBoost, this.id);
        }
    }
    if(bullet.type==3){

    }
    if(bullet.type==5){
        if(((this.id == myId && victim.tag == 'enemy') || (this.isBot && this.owner == myId && (victim.tag == 'enemy' || victim.tag == 'me'))))
            Client.castFreeze(victim.id, 3)
    }
    if(bullet.type==6){
            var vape = this.vapelosions.getFirstDead();
            vape.reset(bullet.x, bullet.y);
            vape.play('vapelosion', 15, true, true);
            vape.lifespan = 1350
    }
}
function bulletHitWall (victim, bullet){
    if(this.enableProjectileBounce)
        bulletBounce.call(this,victim, bullet)
    else
        bulletHit.call(this,victim, bullet);
}

function bulletBounce (victim, bullet) {
    bullet.rotation = Math.atan2(bullet.body.velocity.y,bullet.body.velocity.x);
}

//Vape cloud hit
function vapeHit (victim, vapelosion,spellPowerBoost) {
   if ((victim.health>0 && ((this.id == myId) || (this.isBot && this.owner == myId && this.id != victim.id))) && (victim.tag == 'enemy' || victim.tag == 'me'))
        Client.updateHP(victim.id, -0.5 - 0.1*this.spells.Vape.spellPower, this.id);
}

