Spell = function() {
    this.cooldown = 0
    this.currentCooldown = 0
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
    this.cooldown = 50;
}

Fireball.prototype = Object.create(Spell.prototype);

Fireball.prototype.constructor = Fireball

Fireball.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

    eurecaServer.castRemoteAttack(character.id, {x: character.cursor.tx,
    											 y: character.cursor.ty});
};

// Leap

function Leap() {
    Spell.call(this);
}

Leap.prototype = Object.create(Leap.prototype);

Leap.prototype.constructor = Leap

Leap.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

};

// Spike

function Spike() {
    Spell.call(this);
}

Spike.prototype = Object.create(Spike.prototype);

Spike.prototype.constructor = Spike

Spike.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

};

// Cold Sphere

function ColdSphere() {
    Spell.call(this);
}

ColdSphere.prototype = Object.create(ColdSphere.prototype);

ColdSphere.prototype.constructor = ColdSphere

ColdSphere.prototype.cast = function(character){
    this.currentCooldown = this.cooldown

};

// Poison

function Poison() {
    Spell.call(this);
}

Poison.prototype = Object.create(Poison.prototype);

Poison.prototype.constructor = Poison

Poison.prototype.cast = function(character){
    this.currentCooldown = this.cooldown
};

