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

    this.SBWidth = window.innerWidth < 820 ? window.innerWidth*0.9 : 820; 
    this.SBHeight = 300;
    this.SBOffsetX = (window.innerWidth - this.SBWidth)/2;
    this.SBOffsetY = (window.innerHeight - this.SBHeight)/2;
    this.SBColumnWidth = 150;
    this.SBHidden = true;


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
    this.createScoreBoard();
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
        //console.log(window.innerWidth - this.segmentSize - this.margin,this.offsetY + (this.segmentSize*i))
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

HUD.prototype.createScoreBoard = function(){

    this.scoreBoard = [];
    this.scoreBoardSorted = [];
    this.SBGroup = game.add.group();
    this.SBBackground = game.add.tileSprite(this.SBOffsetX, this.SBOffsetY, this.SBWidth, this.SBHeight , 'scoreboardbackground');
    this.SBBackground.fixedToCamera = true;
    this.SBBackground.alpha = 0.8;
    this.SBGroup.add(this.SBBackground);
    this.SBNames = game.add.text(
        this.SBOffsetX + 10,
        this.SBOffsetY + 10,
        'Players',
        { font: "32px Arial", fill: "#ffffff", align: "left" }
    );
    this.SBNames.fixedToCamera = true;
    this.SBGroup.add(this.SBNames);
    this.SBKills = game.add.text(
        this.SBOffsetX + 10 + this.SBColumnWidth*2 + 12,
        this.SBOffsetY + 10,
        'Kills',
        { font: "32px Arial", fill: "#ffffff", align: "left" }
    );
    this.SBKills.fixedToCamera = true;
    this.SBGroup.add(this.SBKills);
    this.SBDeaths = game.add.text(
        this.SBOffsetX + 10 + this.SBColumnWidth*3 + 12,
        this.SBOffsetY + 10,
        'Deaths',
        { font: "32px Arial", fill: "#ffffff", align: "left" }
    );
    this.SBDeaths.fixedToCamera = true;
    this.SBGroup.add(this.SBDeaths);
    this.SBSuicides = game.add.text(
        this.SBOffsetX + 10 + this.SBColumnWidth*4 + 12,
        this.SBOffsetY + 10,
        'Suicides',
        { font: "32px Arial", fill: "#ffffff", align: "left" }
    );
    this.SBSuicides.fixedToCamera = true;
    this.SBGroup.add(this.SBSuicides);
    this.SBGroup.bringToTop(this.SBGroup);
    for(c=0;c<this.SBGroup.children.length;c++)
        if(typeof this.SBGroup.children[c].kill != 'undefined')
            this.SBGroup.children[c].kill()
        else
            this.SBGroup.children[c].visible = false
}

HUD.prototype.updateScoreBoard = function(scoreBoard){
    this.scoreBoard = scoreBoard;
    this.scoreBoardSorted = [];
    var i = 0;
    for(p in this.scoreBoard){
        this.scoreBoardSorted[i] = [];
        for(e in this.scoreBoard[p])
            this.scoreBoardSorted[i][e] = this.scoreBoard[p][e];
        i++;
    }
    this.scoreBoardSorted = this.scoreBoardSorted.sort(function (a, b) {
      if (a.kills < b.kills) {
        return 1;
      }
      if (a.kills > b.kills) {
        return -1;
      }
      if (a.deaths < b.deaths) {
        return -1;
      }
      if (a.deaths > b.deaths) {
        return 1;
      }
      if (a.suicides < b.suicides) {
        return -1;
      }
      if (a.suicides > b.suicides) {
        return 1;
      }
      return 0;
    });

    this.SBNamesText = 'Players';
    this.SBKillsText = 'Kills';
    this.SBDeathsText = 'Deaths';
    this.SBSuicidesText = 'Suicides';
    for(p=0;p<this.scoreBoardSorted.length;p++){
        if(this.scoreBoardSorted[p].isBot)
            var name = this.scoreBoardSorted[p].id.substring(
                this.scoreBoardSorted[p].id.search('bot'),
                this.scoreBoardSorted[p].id.length
            )
        else
            var name = this.scoreBoardSorted[p].id.length>14 ? this.scoreBoardSorted[p].id.substring(0,13)+'...' : this.scoreBoardSorted[p].id;
        this.SBNamesText += '\n'+name;
        this.SBKillsText += '\n'+this.scoreBoardSorted[p].kills;
        this.SBDeathsText += '\n'+this.scoreBoardSorted[p].deaths;
        this.SBSuicidesText += '\n'+this.scoreBoardSorted[p].suicides;
    };
    this.SBNames.setText(this.SBNamesText);
    this.SBKills.setText(this.SBKillsText);
    this.SBDeaths.setText(this.SBDeathsText);
    this.SBSuicides.setText(this.SBSuicidesText);
}

HUD.prototype.updateStatus = function(player){
    this.healthIndicator.setText(Math.max(Math.round(player.health),0)+'/'+maxHealth);
    this.hpline.scale.setTo(Phaser.Math.max(player.health/maxHealth,0), 1);
    //player.hpline_secondary.scale.setTo(Phaser.Math.max((player.health-maxHealth)/180,0), 1);
    this.deaths_counter.setText(player.deaths+"")
    this.kills_counter.setText(player.kills+"")
}

HUD.prototype.toggleScoreboard = function(){
    if(!this.SBHidden){
        var word = 'kill';
        var state = false
    }
    else{
        var word = 'reset';
        var state = true
    }
    for(c=0;c<this.SBGroup.children.length;c++)
        if(typeof this.SBGroup.children[c].kill != 'undefined')
            this.SBGroup.children[c][word]()
        else
            this.SBGroup.children[c].visible = state;
    this.SBHidden = !this.SBHidden;
}