Spell = function() {
    this.cooldown = 0
    this.currentCooldown = 0
    this.spellPower = 0;
    this.nextFire = 0;
};

Spell.prototype.cast = function(character) {
    this.currentCooldown = this.cooldown
    console.log("Casting spell")
}

Spell.prototype.onCooldown = function(character) {
    return this.currentCooldown <= 0;
}

// Healing Spell

function HealingSpell() {	
    Spell.call(this);
    this.cooldown = 15 * 60;
    this.healingSpellHealing = 40;
    this.visualEffectSprite = game.add.sprite(0, 0, 'yellow-jolt')
    this.visualEffectSprite.animations.add('cast');
    this.visualEffectSprite.anchor.set(0.5, 0.5)
    this.visualEffectSprite.kill()
}

HealingSpell.prototype = Object.create(Spell.prototype);

HealingSpell.prototype.constructor = HealingSpell

HealingSpell.prototype.cast = function(character){
    console.log("trying to cast healing")
    this.currentCooldown = this.cooldown
 
    this.visualEffectSprite.reset(character.baseSprite.x,
                                  character.baseSprite.y)
    this.visualEffectSprite.animations.play('cast', 5, false, true);   

    eurecaServer.updateHP(character.id, this.healingSpellHealing + 20 * this.spellPower);
};

// Fireball

function Fireball() {
    Spell.call(this);
    this.cooldown = 180;
}

Fireball.prototype = Object.create(Spell.prototype);

Fireball.prototype.constructor = Fireball

Fireball.prototype.cast = function(character){
    //console.log(this.bullets.countDead());
    if (game.time.now > this.nextFire && character.bullets.countDead() > 0){
        this.nextFire = game.time.now + this.cooldown;
        this.currentCooldown = this.cooldown;
        var bullet = character.bullets.getFirstDead();
        bullet.lifespan = 5000;
        bullet.type = 0;
        bullet.frame = 0;
        //bullet.damagePower = this.spellPower;
        bullet.reset(character.headSprite.x, character.headSprite.y);
        bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:character.cursor.tx,y:character.cursor.ty}, 500);
    }

};

// Leap

function Leap() {
    Spell.call(this);

    this.cooldown = 60 * 5;

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

    if (game.time.now > this.nextFire){
        this.nextFire = game.time.now + this.cooldown;
        this.currentCooldown = this.cooldown;

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
    this.cooldown = 3 * 60
    this.distance = 128
    this.stayTime = 5
    this.damage = -50
}

Spike.prototype = Object.create(Spell.prototype);

Spike.prototype.constructor = Spike

Spike.prototype.cast = function(character){

    if (game.time.now > this.nextFire){
        this.nextFire = game.time.now + this.cooldown;
        this.currentCooldown = this.cooldown;

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

// Cold Sphere

function ColdSphere() {
    Spell.call(this);
    this.cooldown = 500;
    this.visualEffectSpriteEnd = game.add.sprite(0, 0, 'ice')
    this.visualEffectSpriteEnd.anchor.set(0.5, 0.5)
    this.visualEffectSpriteEnd.kill()
}

ColdSphere.prototype = Object.create(Spell.prototype);

ColdSphere.prototype.constructor = ColdSphere

ColdSphere.prototype.cast = function(character){
    if (game.time.now > this.nextFire && character.bullets.countDead() > 0){
        this.nextFire = game.time.now + this.cooldown;
        this.currentCooldown = this.cooldown;
        var bullet = character.bullets.getFirstDead();
        bullet.lifespan = 5000;
        bullet.type = 5;
        bullet.frame = 2;
        bullet.reset(character.headSprite.x, character.headSprite.y);
        bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:character.cursor.tx,y:character.cursor.ty}, 500);
    }
};

// Vape

function Vape() {
    Spell.call(this);
    this.cooldown = 60 * 2;
}

Vape.prototype = Object.create(Spell.prototype);

Vape.prototype.constructor = Vape

Vape.prototype.cast = function(character){
    if (game.time.now > this.nextFire && character.bullets.countDead() > 0){
        this.nextFire = game.time.now + this.cooldown;
        this.currentCooldown = this.cooldown;
        var bullet = character.bullets.getFirstDead();
        bullet.lifespan = 5000;
        bullet.type = 6;
        bullet.frame = 1;
        bullet.reset(character.headSprite.x, character.headSprite.y);
        bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:character.cursor.tx,y:character.cursor.ty}, 500);
    }
};

//close-in fighting

function CloseFighting()
{
	Spell.call(this);
	this.cooldown = 25;
}

CloseFighting.prototype = Object.create(Spell.prototype)

CloseFighting.prototype.constructor = CloseFighting

CloseFighting.prototype.cast = function(character)
{
	if (this.onCooldown() == false)
		return
	this.currentCooldown = this.cooldown

	eurecaServer.castCloseAttack(character.id, {x: character.cursor.tx,
    											y: character.cursor.ty});
}

