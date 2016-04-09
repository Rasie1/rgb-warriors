TouchControls = function(character)
{
    this.character = character
    this.game = game

    this.movementDirectionVectorX = 0
    this.movementDirectionVectorY = 0

    this.margin = 50
    this.segmentSize = 256
    this.offsetX = this.margin
    this.offsetY = window.innerHeight - this.segmentSize * 3 - this.margin
};

TouchControls.prototype.touch = function() {
    this.character.touchInputChanged = true
}

TouchControls.prototype.init = function create(game) {
    buttonR = game.add.button(this.offsetX + this.segmentSize, 
                              this.offsetY + this.segmentSize,
                              'button-circle', 
                              this.actionOnClick, 
                              this, 
                              0, 0, 0);
    buttonR.scale.x = 2
    buttonR.scale.y = 6
    buttonR.onInputUp.add(function() { this.touch(); this.movementDirectionVectorX = 0 }, this)
    buttonR.onInputDown.add(function() { this.touch(); this.movementDirectionVectorX = 1 }, this)

    buttonL = game.add.button(this.offsetX, 
                              this.offsetY + this.segmentSize,
                              'button-circle', 
                              this.actionOnClick, 
                              this, 
                              0, 0, 0);
    buttonL.scale.x = 2
    buttonL.scale.y = 6
    buttonL.onInputUp.add(function() { this.touch(); this.movementDirectionVectorX = 0 }, this)
    buttonL.onInputDown.add(function() { this.touch(); this.movementDirectionVectorX = -1 }, this)

    buttonT = game.add.button(this.offsetX, 
                              this.offsetY + this.segmentSize,
                              'button-circle', 
                              this.actionOnClick, 
                              this, 
                              0, 0, 0);
    buttonT.scale.x = 6
    buttonT.scale.y = 2
    buttonT.onInputUp.add(function() { this.touch(); this.movementDirectionVectorY = 0 }, this)
    buttonT.onInputDown.add(function() { this.touch(); this.movementDirectionVectorY = -1 }, this)

    buttonB = game.add.button(this.offsetX, 
                              this.offsetY + this.segmentSize + this.segmentSize,
                              'button-circle', 
                              this.actionOnClick, 
                              this, 
                              0, 0, 0);
    buttonB.scale.x = 6
    buttonB.scale.y = 2
    buttonB.onInputUp.add(function() { this.touch(); this.movementDirectionVectorY = 0 }, this)
    buttonB.onInputDown.add(function() { this.touch(); this.movementDirectionVectorY = 1 }, this)


    buttonL.fixedToCamera = true
    buttonR.fixedToCamera = true
    buttonT.fixedToCamera = true
    buttonB.fixedToCamera = true


    // spell buttons


    this.segmentSize = this.segmentSize / 2

    buttonS0 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY,
                               'button-circle', 
                               this.spell0buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS0.scale.x = 1
    buttonS0.scale.y = 1
    buttonS1 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize,
                              'button-circle', 
                               this.spell1buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS1.scale.x = 1
    buttonS1.scale.y = 1
    buttonS2 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + this.segmentSize,
                               'button-circle', 
                               this.spell2buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS2.scale.x = 1
    buttonS2.scale.y = 1
    buttonS3 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + this.segmentSize + this.segmentSize,
                               'button-circle', 
                               this.spell3buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS3.scale.x = 1
    buttonS3.scale.y = 1


    buttonS0.fixedToCamera = true
    buttonS1.fixedToCamera = true
    buttonS2.fixedToCamera = true
    buttonS3.fixedToCamera = true

}


TouchControls.prototype.actionOnClick = function() {

}

TouchControls.prototype.spell0buttonAction = function() {
    // switch firemode

    debugMessage(0)
}

TouchControls.prototype.spell1buttonAction = function() {
    debugMessage(1)   
}

TouchControls.prototype.spell2buttonAction = function() {
    debugMessage(2)
}

TouchControls.prototype.spell3buttonAction = function() {
    debugMessage(3)
}

TouchControls.prototype.processInput = function(character) {

    if (this.movementDirectionVectorX == 1)
        character.shouldMoveRight = true
    if (this.movementDirectionVectorX == -1)
        character.shouldMoveLeft = true
    if (this.movementDirectionVectorY == 1)
        character.shouldMoveBottom = true
    if (this.movementDirectionVectorY == -1)
        character.shouldMoveTop = true
}
