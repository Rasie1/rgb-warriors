HUD = function(){
    this.shift = 80;
    this.wiScale = 0.7;

    this.margin = 75;
    this.segmentSize = 75;
    this.offsetX = this.margin;
    this.offsetY = window.innerHeight - this.segmentSize * 6 - this.margin;

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

    //Creating HUDGroup
    this.HUDGroup = game.add.group();

    // spell buttons
    this.buttons = [];
    this.buttonMapping = [];
    this.spellPowerCounter = [];
    this.elementReminder = [];
    this.reload = [];
    this.levelup = [];

    this.buttonsGroup = game.add.group();

    this.createStatusbar();
    this.createSpellbar();

    return this;
}

HUD.prototype.createStatusbar = function(){
    //Healthbar
    
    //this.hpline_red = game.add.sprite(10+this.shift, 10, 'window_health_2')
    //this.hpline_red.fixedToCamera = true
    //this.HUDGroup.add(this.hpline_red)
    //this.hpline_red.kill()

    this.hpline_green = game.add.sprite(10+this.shift, 10, 'window_health_2')
    this.hpline_green.fixedToCamera = true
    this.HUDGroup.add(this.hpline_green)

    this.hpline = game.add.sprite(25+this.shift, 10, 'window_health_1')
    this.hpline.fixedToCamera = true
    this.HUDGroup.add(this.hpline)

    //this.hpline_secondary = game.add.sprite(12+this.shift, 10, 'window_health_secondary')
    //this.hpline_secondary.fixedToCamera = true
    //this.hpline_secondary.scale.setTo(0,1)
    //this.HUDGroup.add(this.hpline_secondary)

    this.healthIndicator = game.add.text(20+this.shift, 10, maxHealth+'/'+maxHealth,
        { font: "28px Arial", fill: "#ffffff", align: "left" });
    this.healthIndicator.fixedToCamera = true
    this.HUDGroup.add(this.healthIndicator);

    this.hpline_glass = game.add.sprite(10+this.shift, 10, 'window_health_0')
    this.hpline_glass.fixedToCamera = true
    this.HUDGroup.add(this.hpline_glass)

    //Inventory Item
    inventoryItem = game.add.sprite(10, 80, 'inventoryItem');
    inventoryItem.frame = 0;
    inventoryItem.scale.setTo(this.wiScale,this.wiScale);
    inventoryItem.fixedToCamera = true;
    inventoryItem.kill();
    this.HUDGroup.add(inventoryItem);

    //Counters
    var window_counter_circle_secondary = game.add.sprite(60, 10, 'window_counter')
    window_counter_circle_secondary.scale.setTo(this.wiScale,this.wiScale)
    window_counter_circle_secondary.fixedToCamera = true
    this.HUDGroup.add(window_counter_circle_secondary)

    this.deaths_counter = game.add.text(80, 20, "0",
        { font: "20px Arial", fill: "#ff0000", align: "center" })
    this.deaths_counter.fixedToCamera = true
    this.deaths_counter.anchor.setTo(0.5,0)
    this.HUDGroup.add(this.deaths_counter)

    var window_counter_circle = game.add.sprite(10, 10, 'window_counter')
    window_counter_circle.scale.setTo(1,1)
    window_counter_circle.fixedToCamera = true
    this.HUDGroup.add(window_counter_circle)

    this.kills_counter = game.add.text(38, 23, "0",
        { font: "32px Arial", fill: "#ffffff", align: "center" })
    this.kills_counter.fixedToCamera = true
    this.kills_counter.anchor.setTo(0.5,0)
    this.HUDGroup.add(this.kills_counter);
}

HUD.prototype.createSpellbar = function(){
    //Make buttons
    for(i=0;i<=6;i++){
        console.log(window.innerWidth - this.segmentSize - this.margin,this.offsetY + (this.segmentSize*i))
        //Spell buttons
        this.buttons[i] = game.add.button(
            window.innerWidth - this.segmentSize - this.margin, 
            this.offsetY + (this.segmentSize*i),
            'logoS'+i, 
            this['spell'+i+'buttonAction'], 
            this, 
            0, 0, 0
        );
        this.buttons[i].scale.x = 1;
        this.buttons[i].scale.y = 1;
        //this.buttons[i].onInputUp.add(function() {this.touchInput['button'+i] = false }, this)
        //this.buttons[i].onInputDown.add(function() {this.touchInput['button'+i] = true }, this)
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

    this.HUDGroup.bringToTop(this.HUDGroup);
}