
var debugMessageSprite
function initDebugMessage(game) {
    debugMessageSprite = game.add.text(10, 10, "", 
        { font: "32px Arial", fill: "#ff5555", align: "left" });
    debugMessageSprite.fixedToCamera = true;
    debugMessageSprite.cameraOffset.setTo(10, 100);

}
// shows text on screen
function debugMessage(s) {
    debugMessageSprite.setText(s);
}
