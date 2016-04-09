var mapX   = 0;
var mapWidth  =  2000;
var mapY    = 0;
var mapHeight =  2000;

var cameraDeadzoneWidth = 0.25;
var cameraDeadzoneHeight = 0.25; 

var playerSpeedX = 300;
var playerSpeedY = 300;

var maxGameWidth = 3000; 
var maxGameHeight = 3000;

var maxHealth = 30
var basicDamage = 10

function def(arg,def) {
	return (typeof(arg)==='undefined') ? def : arg
}