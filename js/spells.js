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
    this.cooldown = 100;
}

HealingSpell.prototype = Object.create(Spell.prototype);

HealingSpell.prototype.constructor = HealingSpell

HealingSpell.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

    eurecaServer.updateHP(character.id, healingSpellHealingPercentage);
};

// Fireball

function Fireball() {
    Spell.call(this);
    this.cooldown = 500;
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
        bullet.reset(character.headSprite.x, character.headSprite.y);
        bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:character.cursor.tx,y:character.cursor.ty}, 500);
    }
};

// Leap

function Leap() {
    Spell.call(this);
    this.cooldown = 50;
    this.jumpDist = 512;
}

Leap.prototype = Object.create(Spell.prototype);

Leap.prototype.constructor = Leap

Leap.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

    var curPos = new Phaser.Point(character.baseSprite.x, character.baseSprite.y);
    var target = new Phaser.Point(character.cursor.tx, character.cursor.ty);


    var dist = Phaser.Math.min(this.jumpDist, 
    			Phaser.Math.distance(curPos.x, curPos.y, target.x, target.y));

    target.x = dist * Math.cos(Phaser.Math.angleBetweenPoints(curPos, target));
    target.y = dist * Math.sin(Phaser.Math.angleBetweenPoints(curPos, target));


    var isCollision = false;
    for (var obst in character.game.obstacles)
    {
    	var a = new Phaser.Rectangle(obst.x, obst.y, obst.width, obdt.height);
    	var b = new Phaser.Rectangle(target.x - 32, target.y - 32, 64, 64);
    	if (Phaser.Rectangle.intersects(a, b))
    	{
    		isCollision = true;
    		break;
    	}
    }
    if (!isCollision)
    	eurecaServer.doLeap(character.id, curPos.x + target.x, curPos.y + target.y);
};

// Spike

function Spike() {
    Spell.call(this);
    this.cooldown = 50;
}

Spike.prototype = Object.create(Spell.prototype);

Spike.prototype.constructor = Spike

Spike.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

};

// Cold Sphere

function ColdSphere() {
    Spell.call(this);
    this.cooldown = 50;
}

ColdSphere.prototype = Object.create(Spell.prototype);

ColdSphere.prototype.constructor = ColdSphere

ColdSphere.prototype.cast = function(character){
    this.currentCooldown = this.cooldown
};

// Vape

function Vape() {
    Spell.call(this);
    this.cooldown = 300;
}

Vape.prototype = Object.create(Spell.prototype);

Vape.prototype.constructor = Vape

Vape.prototype.cast = function(character){
    if (game.time.now > this.nextFire && character.bullets.countDead() > 0){
        this.nextFire = game.time.now + this.cooldown;
        this.currentCooldown = this.cooldown;
        var bullet = character.bullets.getFirstDead();
        bullet.lifespan = 5000;
        bullet.type = 5;
        bullet.reset(character.headSprite.x, character.headSprite.y);
        bullet.rotation = game.physics.arcade.moveToObject(bullet, {x:character.cursor.tx,y:character.cursor.ty}, 500);
    }
};

