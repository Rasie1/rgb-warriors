Spell = function() {
    this.cooldown = 0
    this.currentCooldown = 0
    

};


Spell.prototype.cast = function(character) {
    this.currentCooldown = this.cooldown
    console.log("Casting spell")
}



function HealingSpell() {
    Spell.call(this);
}

HealingSpell.prototype = Object.create(Spell.prototype);

HealingSpell.prototype.constructor = HealingSpell

HealingSpell.prototype.cast = function(character){
    character.health = character.health + healingSpellHealingPercentage
};
