TouchControls = function(character)
{
    this.character = character

    this.movementDirectionVectorX = 0.0
    this.movementDirectionVectorY = 0.0
};

TouchControls.prototype.init = function create() {

    button = game.add.button(0, 
                             400, 
                             'character', 
                             this.actionOnClick, 
                             this, 
                             0, 
                             1, 
                             2);
    button.scale.x = 10
    button.scale.y = 10

    button.onInputOver.add(this.over, this)
    button.onInputOut.add(this.out, this)
    button.onInputUp.add(this.up, this)

}

TouchControls.prototype.up = function() {
    this.movementDirectionVectorX = 1.0
}

TouchControls.prototype.over = function() {
    this.movementDirectionVectorX = 1.0
}

TouchControls.prototype.out = function() {
    this.movementDirectionVectorX = 0.0
}

TouchControls.prototype.actionOnClick = function() {
    this.movementDirectionVectorX = 1.0
    // this.character.baseSprite.body.velocity.x = 
    //     playerSpeedX * this.movementDirectionVectorX
}

TouchControls.prototype.processInput = function() {
    this.character.baseSprite.body.velocity.x = 
        playerSpeedX * this.movementDirectionVectorX
    this.character.baseSprite.body.velocity.y = 
        playerSpeedY * this.movementDirectionVectorY
}
