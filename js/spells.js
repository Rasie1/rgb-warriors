Spell = function() {
    this.cooldown = 0
    this.currentCooldown = 0
    

};


Spell.prototype.cast = function(character) {
    this.currentCooldown = this.cooldown
    console.log("Casting spell")
}
