Spell = function() {
    this.cooldown = 0
    this.spellPower = 0;
    this.nextFire = 0;
};

Spell.prototype.cast = function(character) {

}

Spell.prototype.castProjectile = function(character,bulletType,bulletFrame,bulletSpeed){
    if (game.time.now > this.nextFire && game.time.now > character.nextFire && character.bullets.countDead() > 0){
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate;        
        var bullet = character.bullets.getFirstDead();
        bullet.lifespan = 5000;
        bullet.type = bulletType;
        bullet.frame = bulletFrame;
        //bullet.damagePower = this.spellPower;
        bullet.reset(character.headSprite.x, character.headSprite.y);
        bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:character.cursor.tx,y:character.cursor.ty}, bulletSpeed);
    }
}

// Healing Spell
function HealingSpell() {
    Spell.call(this);
    this.cooldown = 1000;
    this.healingSpellHealing = 40;
    this.visualEffectSprite = game.add.sprite(0, 0, 'yellow-jolt')
    this.visualEffectSprite.animations.add('cast');
    this.visualEffectSprite.anchor.set(0.5, 0.5)
    this.visualEffectSprite.kill()
}

HealingSpell.prototype = Object.create(Spell.prototype);

HealingSpell.prototype.constructor = HealingSpell

HealingSpell.prototype.cast = function(character){
    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate; 

        this.visualEffectSprite.reset(character.baseSprite.x,
                                      character.baseSprite.y)
        this.visualEffectSprite.animations.play('cast', 5, false, true);

        eurecaServer.updateHP(character.id, this.healingSpellHealing + 20 * this.spellPower);
    }
};


// Fireball
function Fireball() {
    Spell.call(this);
    this.cooldown = 750;
    this.bulletSpeed = 750;
}

Fireball.prototype = Object.create(Spell.prototype);

Fireball.prototype.constructor = Fireball

Fireball.prototype.cast = function(character){
    this.castProjectile(character,0,0,this.bulletSpeed)
};

// Cold Sphere
function ColdSphere() {
    Spell.call(this);
    this.cooldown = 1000;
    this.bulletSpeed = 600;
    this.visualEffectSpriteEnd = game.add.sprite(0, 0, 'ice')
    this.visualEffectSpriteEnd.anchor.set(0.5, 0.5)
    this.visualEffectSpriteEnd.kill()
}

ColdSphere.prototype = Object.create(Spell.prototype);

ColdSphere.prototype.constructor = ColdSphere

ColdSphere.prototype.cast = function(character){
    this.castProjectile(character,5,2,this.bulletSpeed)
};

// Vape
function Vape() {
    Spell.call(this);
    this.cooldown = 1000;
    this.bulletSpeed = 500;
}

Vape.prototype = Object.create(Spell.prototype);

Vape.prototype.constructor = Vape

Vape.prototype.cast = function(character){
    this.castProjectile(character,6,1,this.bulletSpeed)
};

// Leap
function Leap() {
    Spell.call(this);

    this.cooldown = 1000;

    this.jumpDist = 300;

    this.visualEffectSpriteBegin = game.add.sprite(0, 0, 'yellow-fireball')
    this.visualEffectSpriteBegin.animations.add('cast');
    this.visualEffectSpriteBegin.anchor.set(0.5, 0.5)
    this.visualEffectSpriteBegin.kill()
    this.visualEffectSpriteEnd = game.add.sprite(0, 0, 'yellow-fireball')
    this.visualEffectSpriteEnd.animations.add('cast');
    this.visualEffectSpriteEnd.anchor.set(0.5, 0.5)
    this.visualEffectSpriteEnd.kill()
}

Leap.prototype = Object.create(Spell.prototype);

Leap.prototype.constructor = Leap

Leap.prototype.cast = function(character){

    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate;     

        var curPos = new Phaser.Point(character.baseSprite.x, character.baseSprite.y);
        var target = new Phaser.Point(character.cursor.tx, character.cursor.ty);


        var dist = Phaser.Math.min(this.jumpDist,
                                   Phaser.Math.distance(curPos.x,
                                                        curPos.y,
                                                        target.x,
                                                        target.y));

        var offset_x = dist * Math.cos(Phaser.Math.angleBetweenPoints(curPos, target));
        var offset_y = dist * Math.sin(Phaser.Math.angleBetweenPoints(curPos, target));
        target.x = curPos.x + offset_x;
        target.y = curPos.y + offset_y;

        this.visualEffectSpriteBegin.reset(curPos.x,
                                           curPos.y)
        this.visualEffectSpriteBegin.animations.play('cast', 15, false, true);
        this.visualEffectSpriteEnd.reset(target.x,
                                         target.y)
        this.visualEffectSpriteEnd.animations.play('cast', 15, false, true);
        /*var isCollision = false;
        for (var obst in character.game.obstacles)
        {
        	var a = new Phaser.Rectangle(obst.x, obst.y, obst.width, obst.height);
        	var b = new Phaser.Rectangle(target.x - 32, target.y - 32, 64, 64);
        	if (Phaser.Rectangle.intersects(a, b))
        	{
        		isCollision = true;
        		break;
        	}
        }
        if (!isCollision)*/
        if(character.id==myId)
    	   eurecaServer.doLeap(character.id, target.x, target.y);
    }
};

// Spike
function Spike() {
    Spell.call(this);
    this.cooldown = 1000
    this.distance = 128
    this.stayTime = 5
    this.damage = -50
}

Spike.prototype = Object.create(Spell.prototype);

Spike.prototype.constructor = Spike

Spike.prototype.cast = function(character){

    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate; 

        var curPos = new Phaser.Point(character.baseSprite.x, character.baseSprite.y);
        var target = new Phaser.Point(character.cursor.tx, character.cursor.ty);

        var offset = Phaser.Point.subtract(target, curPos).normalize()

        target.x = offset.x * this.distance + curPos.x
        target.y = offset.y * this.distance + curPos.y
        if(character.id==myId)
            eurecaServer.doSpike(character.id,
                             target.x,
                             target.y,
                             this.stayTime,
                             this.damage);
    }

};

//close-in fighting
function CloseFighting()
{
	Spell.call(this);
	this.cooldown = 1000;
}

CloseFighting.prototype = Object.create(Spell.prototype)

CloseFighting.prototype.constructor = CloseFighting

CloseFighting.prototype.cast = function(character)
{
    if (game.time.now > this.nextFire && game.time.now > character.nextFire){
        this.nextFire = game.time.now + this.cooldown;
        character.nextFire = game.time.now + character.fireRate; 

    	eurecaServer.castCloseAttack(character.id, {x: character.cursor.tx,
        											y: character.cursor.ty});
    }
}
