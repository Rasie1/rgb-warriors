TouchControls = function(character)
{
    this.touchInput = { 
        joystickX:0.0, 
        joystickY:0.0,
        button0:false,
        button1:false,
        button2:false,
        button3:false,
        button4:false,
        button5:false,
        button6:false
    }
    this.character = character
    this.game = game

    this.movementDirectionVectorX = 0
    this.movementDirectionVectorY = 0

    this.touchedJoystick = false

    this.margin = 75
    this.segmentSize = 200
    this.offsetX = this.margin
    this.offsetY = window.innerHeight - this.segmentSize * 3 - this.margin
};

TouchControls.prototype.init = function create(game) {
    // buttonR = game.add.button(this.offsetX + this.segmentSize, 
    //                           this.offsetY + this.segmentSize,
    //                           'button-circle', 
    //                           this.actionOnClick, 
    //                           this, 
    //                           0, 0, 0);
    // buttonR.scale.x = 2
    // buttonR.scale.y = 6
    // buttonR.onInputUp.add(function() { this.movementDirectionVectorX = 0 }, this)
    // buttonR.onInputDown.add(function() { this.movementDirectionVectorX = 1 }, this)

    // buttonL = game.add.button(this.offsetX, 
    //                           this.offsetY + this.segmentSize,
    //                           'button-circle', 
    //                           this.actionOnClick, 
    //                           this, 
    //                           0, 0, 0);
    // buttonL.scale.x = 2
    // buttonL.scale.y = 6
    // buttonL.onInputUp.add(function() { this.movementDirectionVectorX = 0 }, this)
    // buttonL.onInputDown.add(function() { this.movementDirectionVectorX = -1 }, this)

    // buttonT = game.add.button(this.offsetX, 
    //                           this.offsetY + this.segmentSize,
    //                           'button-circle', 
    //                           this.actionOnClick, 
    //                           this, 
    //                           0, 0, 0);
    // buttonT.scale.x = 6
    // buttonT.scale.y = 2
    // buttonT.onInputUp.add(function() { this.movementDirectionVectorY = 0 }, this)
    // buttonT.onInputDown.add(function() { this.movementDirectionVectorY = -1 }, this)

    // buttonB = game.add.button(this.offsetX, 
    //                           this.offsetY + this.segmentSize + this.segmentSize,
    //                           'button-circle', 
    //                           this.actionOnClick, 
    //                           this, 
    //                           0, 0, 0);
    // buttonB.scale.x = 6
    // buttonB.scale.y = 2
    // buttonB.onInputUp.add(function() { this.movementDirectionVectorY = 0 }, this)
    // buttonB.onInputDown.add(function() { this.movementDirectionVectorY = 1 }, this)


    // buttonL.fixedToCamera = true
    // buttonR.fixedToCamera = true
    // buttonT.fixedToCamera = true
    // buttonB.fixedToCamera = true


    // spell buttons

    
    this.segmentSize = this.segmentSize / 2

    buttonS0 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY,
                               'logoS0', 
                               this.spell0buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS0.scale.x = 1
    buttonS0.scale.y = 1
    buttonS0.onInputUp.add(function() { this.touchInput.button0 = false }, this)
    buttonS0.onInputDown.add(function() { this.touchInput.button0 = true }, this)

    buttonS1 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize,
                              'logoS1', 
                               this.spell1buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS1.scale.x = 1
    buttonS1.scale.y = 1
    buttonS1.onInputUp.add(function() { this.touchInput.button1 = false }, this)
    buttonS1.onInputDown.add(function() { this.touchInput.button1 = true }, this)
    
    buttonS2 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + this.segmentSize,
                               'logoS2', 
                               this.spell2buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS2.scale.x = 1
    buttonS2.scale.y = 1
    buttonS2.onInputUp.add(function() { this.touchInput.button2 = false }, this)
    buttonS2.onInputDown.add(function() { this.touchInput.button2 = true }, this)

    buttonS3 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + this.segmentSize + this.segmentSize,
                               'logoS3', 
                               this.spell3buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS3.scale.x = 1
    buttonS3.scale.y = 1
    buttonS3.onInputUp.add(function() { this.touchInput.button3 = false }, this)
    buttonS3.onInputDown.add(function() { this.touchInput.button3 = true }, this)

    buttonS4 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + 
                               this.segmentSize + this.segmentSize + 
                               this.segmentSize,
                               'logoS4', 
                               this.spell4buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS4.scale.x = 1
    buttonS4.scale.y = 1
    buttonS4.onInputUp.add(function() { this.touchInput.button4 = false }, this)
    buttonS4.onInputDown.add(function() { this.touchInput.button4 = true }, this)

    buttonS5 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + 
                               this.segmentSize + this.segmentSize + 
                               this.segmentSize + this.segmentSize,
                               'logoS5', 
                               this.spell5buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS5.scale.x = 1
    buttonS5.scale.y = 1
    buttonS5.onInputUp.add(function() { this.touchInput.button5 = false }, this)
    buttonS5.onInputDown.add(function() { this.touchInput.button5 = true }, this)

    buttonS6 = game.add.button(window.innerWidth - this.segmentSize - this.margin, 
                               this.offsetY + this.segmentSize + 
                               this.segmentSize + this.segmentSize + 
                               this.segmentSize + this.segmentSize + this.segmentSize,
                               'logoS6', 
                               this.spell5buttonAction, 
                               this, 
                               0, 0, 0);
    buttonS6.scale.x = 1
    buttonS6.scale.y = 1
    buttonS6.onInputUp.add(function() { this.touchInput.button6 = false }, this)
    buttonS6.onInputDown.add(function() { this.touchInput.button6 = true }, this)

    if (!game.device.desktop)
    {
        joystick = game.add.button(this.margin, 
                                   this.offsetY,
                                   'button-circle', 
                                   this.joystickButtonAction, 
                                   this, 
                                   0, 0, 0);
        joystick.scale.x = 3
        joystick.scale.y = 3
        joystick.onInputUp.add(this.joystickUp, this)
        joystick.onInputDown.add(this.joystickDown, this)
        joystick.fixedToCamera = true
    }


    buttonS0.fixedToCamera = true
    buttonS1.fixedToCamera = true
    buttonS2.fixedToCamera = true
    buttonS3.fixedToCamera = true
    buttonS4.fixedToCamera = true
    buttonS5.fixedToCamera = true
    buttonS6.fixedToCamera = true





}


TouchControls.prototype.actionOnClick = function() {

}

TouchControls.prototype.spell0buttonAction = function() {
}

TouchControls.prototype.spell1buttonAction = function() {
}

TouchControls.prototype.spell2buttonAction = function() {
}

TouchControls.prototype.spell3buttonAction = function() {
}

TouchControls.prototype.spell4buttonAction = function() {
}

TouchControls.prototype.spell5buttonAction = function() {
}

TouchControls.prototype.spell6buttonAction = function() {
}

TouchControls.prototype.joystickButtonAction = function() {
}

TouchControls.prototype.joystickUp = function() {
    if (!game.device.desktop)
    {
        this.touchInput.joystickX = 0.0
        this.touchInput.joystickY = 0.0
        this.touchedJoystick = false
    }
}

TouchControls.prototype.joystickDown = function() { 
    if (!game.device.desktop)
        this.touchedJoystick = true
}

TouchControls.prototype.processInput = function(character) {
    if (!game.device.desktop)
    {
        if (this.touchedJoystick == true)   
        {
            var x = (game.input.activePointer.clientX - this.margin - this.segmentSize / 2) / this.segmentSize
            var y = (game.input.activePointer.clientY - this.offsetY - this.segmentSize / 2) / this.segmentSize
            this.touchInput.joystickX = x
            this.touchInput.joystickY = y
        }
    }
}
