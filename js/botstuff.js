Character.prototype.updateBot = function(){ 
    //If bot's dead there's no need to update
    if(!this.alive)
        return;

    this.updateGenericBefore();

    //Aliases for touching
    for(t in this.baseSprite.body.touching){
        this.touching[t] = this.baseSprite.body.blocked[t] ? this.baseSprite.body.blocked[t] : this.baseSprite.body.touching[t];
    }

    //Speed of the bot (no reason to have x and y separately tbh)
    //Also lower bots speed for testing
    this.realSpeed = this.SpeedX*this.speedMultiplier-50;

    //Remember previous state before updating
    this.statusChanged = false;
    for(a in this.statusActual){
        this.status[a] = this.statusActual[a];
    }

    //Decide on behavior
    //chooseTarget -> findItem -> faceTarget -> attackTarget -> chooseDestination(goForItem\closeInOnTarget) -> moveToDestination
    //The target is always another character; the destination can be an iten, the target or area around the target. faceTarget can face target or destination
    if (game.time.now > this.nextClosestTargetCheck){
        this.nextClosestTargetCheck = game.time.now + this.targetCheckRate;
        this.chooseTarget();
        if(!this.closestTarget)
            this.closestTarget = this;
        this.findItem();
    }
    this.faceTarget();
    if(this.canFire())
        this.attackTarget();
    this.moveToDestination();

    //Update stuff that's the same for bots and players
    this.updateGenericAfter();

    //Collect data for the server
    this.statusActual = {
        x:this.baseSprite.x,
        y:this.baseSprite.y,
        rot:this.headSprite.rotation,
        velX:Math.round(this.baseSprite.body.velocity.x),
        velY:Math.round(this.baseSprite.body.velocity.y)
    }

    //Check if bot's velocity has changed
    if(this.statusActual.velX != this.status.velX || this.statusActual.velY != this.status.velY)
        this.statusChanged = true;

    //Send bot's state to the server if needed
    if (this.statusChanged)
        Server.updateBot(this.id,myId,this.statusActual)
}

Character.prototype.initBot = function(){
    this.chooseTarget = function(){ //Choose closest target
        this.closestTarget = null;
        for(p in charactersList){
            if(p != this.id){
                if(!this.closestTarget && charactersList[p].alive){
                    this.closestTarget = charactersList[p];
                }
                else{
                    if(
                        charactersList[p].alive && 
                        game.physics.arcade.distanceBetween(this.baseSprite, charactersList[p].baseSprite) < 
                        game.physics.arcade.distanceBetween(this.baseSprite, this.closestTarget.baseSprite)
                    ){
                        this.closestTarget = charactersList[p];                
                    }
                }
            }
        };
    };
    this.findItem = function(){
        this.newClosestItem = {};
        this.newClosestItem.alive = false;
        for(i in items){
            if(items[i].alive){
                if(!this.newClosestItem.alive){
                    this.newClosestItem = items[i];
                }
                else{
                    if(
                        game.physics.arcade.distanceBetween(this.baseSprite, items[i]) < 
                        game.physics.arcade.distanceBetween(this.baseSprite, this.newClosestItem)
                    ){
                        this.newClosestItem = items[i];                
                    }
                }
            }
        };
        if(this.newClosestItem != this.closestItem){
            var preferNewItem = false;
            if(this.closestItem.alive){
                if(
                    game.physics.arcade.distanceBetween(this.closestTarget.baseSprite, this.newClosestItem) < 
                    game.physics.arcade.distanceBetween(this.closestTarget.baseSprite, this.closestItem) ||
                    game.physics.arcade.distanceBetween(this.baseSprite, this.closestItem) < 300
                )
                    preferNewItem = true;
            }
            else
                preferNewItem = true;
            if(preferNewItem)
                this.closestItem = this.newClosestItem;
        }
    };
    this.attackTarget = function(){ //Shoot at target if close enough
        if (game.physics.arcade.distanceBetween(this.baseSprite, this.closestTarget.baseSprite) < 500){
            var pointX = this.closestTarget.baseSprite.x-100+Math.floor(Math.random()*200);
            var pointY = this.closestTarget.baseSprite.y-100+Math.floor(Math.random()*200);
            //this.statusChanged = this.spells.Fireball.cast(this,{x:pointX,y:pointY});
        }
    };
    this.faceTarget = function(){ //Set rotation to face closest target\destination
        if(this.canFire() || !this.closestItem.alive){
            this.headSprite.rotation = game.physics.arcade.angleBetween(
                {x:this.baseSprite.x,y:this.baseSprite.y},
                {x:this.closestTarget.baseSprite.x,y:this.closestTarget.baseSprite.y}
            ) + 3.14/2;
        }
        else{
            this.headSprite.rotation = game.physics.arcade.angleBetween(
                {x:this.baseSprite.x,y:this.baseSprite.y},
                {x:this.closestItem.x,y:this.closestItem.y}
            ) + 3.14/2; 
        }
    };
    this.closeInOnTarget = function(){ //Choose a destination based on target
        if(game.physics.arcade.distanceBetween(this.baseSprite, this.closestTarget.baseSprite) > 500){
            this.actualTarget.x = this.closestTarget.baseSprite.x;
            this.actualTarget.y = this.closestTarget.baseSprite.y;
        }
        else{
            this.actualTarget.x = this.closestTarget.baseSprite.x + Math.random()*500 - 250;
            this.actualTarget.y = this.closestTarget.baseSprite.y + Math.random()*500 - 250;
        }
    };
    this.goForItem = function(){ //Choose a destination based on item
        this.actualTarget.x = this.closestItem.x;
        this.actualTarget.y = this.closestItem.y;
    };

    this.itemCloserThanTarget = function(){
        return 
            game.physics.arcade.distanceBetween(this.closestTarget.baseSprite, this.closestItem) < 
            game.physics.arcade.distanceBetween(this.closestTarget.baseSprite, this.baseSprite);
    }
    this.canFire = function(){
        return (this.spellsAvailable[3] || this.spellsAvailable[4] || this.spellsAvailable[5])
    }

    this.chooseDestination = function(){ //Decide what the destination should be
        //Check if target has been reached
        if(game.physics.arcade.distanceBetween(this.baseSprite, this.actualTarget) < 100){
            if(!this.closestItem.alive)
                this.targetReached = true
            else if(!this.itemCloserThanTarget)
                this.targetReached = true;
        };
        if(game.time.now > this.nextActualTargetCheck || this.targetReached){
            this.nextActualTargetCheck = game.time.now + this.actualTargetCheckRate;
            this.targetReached = false;
            //console.log(this.canFire())
            if(this.canFire()){
                if(this.closestItem.alive){
                    if(this.itemCloserThanTarget())
                        this.goForItem()
                    else
                        this.closeInOnTarget();
                }
                else
                    this.closeInOnTarget();
            }
            else{
                if(this.closestItem.alive)
                    this.goForItem()
                else
                    this.closeInOnTarget();
            }
        }

    };
    this.moveToDestination = function(){//Choose destination and move to it
        //Update movement...
        if (game.time.now > this.nextStuckCheck){
            this.chooseDestination();
            //Move the bot
            if(this.touching.none){
                //Hack to ignore frames in which the game tells us the bot isn't stuck when it in fact is
                this.failSafeCounter--;
                if(this.failSafeCounter <= 0){
                    this.failSafeCounter = 30;
                    this.movementDecidedX = this.movementDecidedY = this.wasGoingRight = this.wasGoingLeft = this.wasGoingUp = this.wasGoingDown = this.cantGoLeft = this.cantGoRight = this.cantGoUp = this.cantGoDown = false;
                }
                game.physics.arcade.moveToObject(this.baseSprite, {x:this.actualTarget.x,y:this.actualTarget.y}, this.realSpeed);
            }
            //Try to get the bot unstuck
            else{
                this.nextStuckCheck = game.time.now + this.stuckCheckRate;
                this.goingX = this.goingY = 0;
                if(this.touching.up || this.touching.down){
                    //this.wasGoingUp = this.wasGoingDown = this.movementDecidedY = false;
                    if(this.touching.up)
                        this.cantGoUp = true;
                    if(this.touching.down)
                        this.cantGoDown = true;
                    //console.log('stuck up or down ',this.baseSprite.body.touching,this.cantGoRight,this.cantGoLeft)
                    if(!this.touching.right && !this.touching.left && !this.wasGoingLeft && !this.wasGoingRight && !this.cantGoRight && !this.cantGoLeft){
                        //console.log('left and right clear')
                        if(!this.movementDecidedX){
                            if(this.baseSprite.x < this.actualTarget.x){
                                this.goingX = this.wasGoingX = this.realSpeed;
                                this.baseSprite.body.velocity.x = this.goingX;
                            }
                            else{
                                this.goingX = this.wasGoingX = -this.realSpeed;
                                this.baseSprite.body.velocity.x = this.goingX;
                            }
                            this.movementDecidedX = true;
                        }
                        else{
                            this.baseSprite.body.velocity.x = this.goingX = this.wasGoingX;
                        }
                        
                    } else {
                        this.movementDecidedX = false;
                        if((!this.touching.right || this.wasGoingRight) && !this.cantGoRight){
                            //console.log('right clear');
                            this.goingX = this.realSpeed;
                            this.baseSprite.body.velocity.x = this.goingX;
                            this.wasGoingLeft = false;
                            this.wasGoingRight = true;
                        }
                        else if((!this.touching.left || this.wasGoingLeft) && !this.cantGoLeft){
                            //console.log('left clear');
                            this.goingX = -this.realSpeed;
                            this.baseSprite.body.velocity.x = this.goingX;
                            this.wasGoingRight = false;
                            this.wasGoingLeft = true;
                        }
                        else if(!this.touching.up){
                            //console.log('up clear');
                            this.goingY = this.realSpeed;
                            this.baseSprite.body.velocity.y = this.goingY;
                        }
                        else if(!this.touching.down){
                            //console.log('down clear');
                            this.goingY = -this.realSpeed;
                            this.baseSprite.body.velocity.y = this.goingY;
                        }
                        else{
                            console.log('Bot '+this.id+' got stuck')
                        }
                    }
                }
                else{
                    if(this.touching.right)
                        this.cantGoRight = true;
                    if(this.touching.left)
                        this.cantGoLeft = true;
                    //this.wasGoingLeft = this.wasGoingRight = this.movementDecidedX = false;
                    //console.log('stuck left or right',this.baseSprite.body.touching,this.cantGoUp,this.cantGoDown)
                    if(!this.touching.up && !this.touching.down && !this.wasGoingUp && !this.wasGoingDown && !this.cantGoDown && !this.cantGoUp){
                        //console.log('up and down clear');
                        if(!this.movementDecidedY){
                            if(this.baseSprite.y < this.actualTarget.y){
                                this.goingY = this.wasGoingY = this.realSpeed;
                                this.baseSprite.body.velocity.y = this.goingY;
                            }
                            else{
                                this.goingY = this.wasGoingY = -this.realSpeed;
                                this.baseSprite.body.velocity.y = this.goingY;
                            };
                            this.movementDecidedY = true;
                        }
                        else{
                            this.baseSprite.body.velocity.y = this.goingY = this.wasGoingY;
                        }
                    }
                    else{
                        this.movementDecidedY = false;
                        if((!this.touching.up || this.wasGoingUp) && !this.cantGoUp){
                            this.goingY = this.realSpeed;
                            this.baseSprite.body.velocity.y = this.goingY;
                            this.wasGoingDown = false;
                            this.wasGoingUp = true;
                        }
                        else if((!this.touching.down || this.wasGoingDown) && !this.cantGoDown){
                            this.goingY = -this.realSpeed;
                            this.baseSprite.body.velocity.y = this.goingY;
                            this.wasGoingUp = false;
                            this.wasGoingDown = true;
                        }
                        else if(!this.touching.right){
                            this.goingX = this.realSpeed;
                            this.baseSprite.body.velocity.x = this.goingX;
                        }
                        else if(!this.touching.left){
                            this.goingX = -this.realSpeed;
                            this.baseSprite.body.velocity.x = this.goingX;
                        }
                        else{
                            console.log('Bot '+this.id+' got stuck')
                        }
                    }
                }
            }
        }
        //...or apply previous speed 
        else{
            this.baseSprite.body.velocity.x = this.goingX;
            this.baseSprite.body.velocity.y = this.goingY;
        }
    };
}

Character.prototype.pickUpItemBot = function(itemSprite){
    itemSprite.kill();
    itemSprite.shadow.kill();
    Server.pickUpItem(itemSprite.id,itemSprite.element,this.id);

    this.targetReached = true;
    this.findItem();
    this.chooseDestination();
}