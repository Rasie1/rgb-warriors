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

    this.margin = 75;
    this.segmentSize = 150;
    this.offsetX = this.margin;
    this.offsetY = window.innerHeight - this.segmentSize * 3 - this.margin;
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
    this.buttons = [];
    this.buttonMapping = [];
    this.spellPowerCounter = [];
    this.elementReminder = [];
    this.reload = [];
    this.levelup = [];
    this.buttonsGroup = game.add.group(); 

    this.segmentSize = this.segmentSize / 2;

    this.frames = [
      [1,2], //heal      
      [0,1], //leap
      [1,1], //spike
      [0,0], //fireball
      [2,2], //freeze
      [0,2] //vape
    ]
    this.buttonMap = [
      'E',
      'space',
      'Q',
      1,
      2,
      3,
      4
    ]
    //if (game.device.desktop){
    //}

    //Make buttons
    for(i=0;i<=6;i++){
      //Spell buttons
      this.buttons[i] = game.add.button(
        window.innerWidth - this.segmentSize - this.margin, 
        this.offsetY + (this.segmentSize*i),
        'logoS'+i, 
        this['spell'+i+'buttonAction'], 
        this, 
        0, 0, 0
      );
      this.buttons[i].scale.x = 1
      this.buttons[i].scale.y = 1
      this.buttons[i].onInputUp.add(function() {this.touchInput['button'+i] = false }, this)
      this.buttons[i].onInputDown.add(function() {this.touchInput['button'+i] = true }, this)
      this.buttons[i].fixedToCamera = true;
      this.buttons[i].kill();
      this.buttons[i].alpha = 0;
      this.buttonsGroup.add(this.buttons[i]);

      //Keys for buttons
      if(this.buttonMap[i] == 'space'){
        var style = { font: "12px monospace", fill: "#ffffff", align: "right" };
        var x = window.innerWidth - 132 + 3;
        var y = this.offsetY + (this.segmentSize*i) + 55 - 13;
      }
      else{
        var style = { font: "18px monospace", fill: "#ffffff", align: "right" };
        var x = window.innerWidth - 132 + 26;
        var y = this.offsetY + (this.segmentSize*i) + 55 - 19;
      }

      this.buttonMapping[i] = game.add.text(
        x, 
        y,
        this.buttonMap[i],
        style
      );
      this.buttonMapping[i].fixedToCamera = true;
      this.buttonMapping[i].alpha = 0;

      //Colldown display
      this.reload[i] = game.add.sprite(
        window.innerWidth - this.segmentSize - this.margin, 
        this.offsetY + (this.segmentSize*i),
        'reload'
      );
      this.reload[i].alpha = 0.8;
      this.reload[i].scale.y = 0;
      this.reload[i].fixedToCamera = true;

      if(i!=6){
        //Element reminder for spells
        this.elementReminder[i] = game.add.sprite(
          window.innerWidth - this.segmentSize, 
          this.offsetY + (this.segmentSize*i),
          'inventoryItem'
        );
        //this.elementReminder[i].scale.setTo(wiScale,wiScale);
        this.elementReminder[i].fixedToCamera = true;
        this.elementReminder[i].alpha = 0.5;
        this.elementReminder[i].kill();

        //Spell power counter for spells
        this.spellPowerCounter[i] = game.add.text(
          window.innerWidth - this.segmentSize - this.margin + 8, 
          this.offsetY + (this.segmentSize*i) + 6,
          'lvl 1',
          { font: "14px Arial", fill: "#ffffff", align: "left" }
        );
        this.spellPowerCounter[i].fixedToCamera = true;
        this.spellPowerCounter[i].alpha = 0;

        //Level up icon
        this.levelup[i] = game.add.sprite(
        window.innerWidth - this.segmentSize - this.margin, 
        this.offsetY + (this.segmentSize*i),
        'levelup'
        );
        this.levelup[i].alpha = 0;
        this.levelup[i].fixedToCamera = true;
      }
    }    
    this.buttons[6].reset();
    this.buttons[6].alpha = 1;
    this.buttonMapping[6].alpha = 1;

    //Current spell highlight
    this.highlight = game.add.sprite(
      window.innerWidth - this.segmentSize - this.margin, 
      this.offsetY + (this.segmentSize*6),
      'highlight'
    );
    this.highlight.fixedToCamera = true;
    this.highlight.alpha = 1;
    this.moveHighlight = function(itemNumber){
      this.highlight.cameraOffset.y = this.offsetY + (this.segmentSize*itemNumber)
    }
    
    if (!game.device.desktop){
      joystick = game.add.button(
        this.margin, 
        this.offsetY,
        'button-circle', 
        this.joystickButtonAction, 
        this, 
        0, 0, 0
      );
      joystick.scale.x = 3
      joystick.scale.y = 3
      joystick.onInputUp.add(this.joystickUp, this)
      joystick.onInputDown.add(this.joystickDown, this)
      joystick.fixedToCamera = true
    }
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
