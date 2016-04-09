Spell = function() {
    this.cooldown = 0
    this.currentCooldown = 0
    

};


Spell.prototype.cast = function(character) {
    this.currentCooldown = this.cooldown
    console.log("Casting spell")
}



function HealingSpell(character) {
    Spell.call(this, character);
    this.character = character
}

HealingSpell.prototype = Object.create(Spell.prototype);

HealingSpell.prototype.constructor = HealingSpell

HealingSpell.prototype.cast = function(){
    console.log("Casting healing spell")

    this.character.health = this.character.health + healingSpellHealingPercentage
};
