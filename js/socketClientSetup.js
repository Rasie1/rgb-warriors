var Server;
var ready = false;
var found = false;
var Client = {};

Client.socket = io.connect();

var SocketClientSetup = function() {
	console.log('ID: ' + Client.socket.id);
}