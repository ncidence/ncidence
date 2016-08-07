////////////////////////////
//AngularJs Code
////////////////////////////
function ChatterController($scope) {
    var socket = io.connect();
    
    $scope.messages = [];
    $scope.roster = [];
    $scope.name = '';
    $scope.text = '';
    
    socket.on('connect', function () {
      $scope.setName();
    });
    
    socket.on('chatter.message', function (msg) {
      $scope.messages.push(msg);
      $scope.$apply();
    });
    
    socket.on('chatter.roster', function (names) {
    	console.log('roster:', names);
      $scope.roster = names;
      $scope.$apply();
    });
    
    $scope.send = function send() {
      console.log('Sending message:', $scope.text);
      socket.emit('chatter.message', $scope.text);
      $scope.text = '';
    };
    
    $scope.setName = function setName() {
      socket.emit('chatter.identify', $scope.name);
    };
    
    socket.emit('chatter.get-messages');
}


////////////////////////////
//Server Side nodejs code
////////////////////////////
var ChatterServer = {};
ChatterServer.messages = null;
ChatterServer.async = null;
ChatterServer.messages = null;


ChatterServer.init = function(data){
    console.log("Chat server initializing.");
    ChatterServer.async = data.async;
    ChatterServer.socketHub = data.socketHub;
    ChatterServer.messages = [];
};


ChatterServer.onDisconnection = function (sockets) {
    updateRoster(sockets);
}

ChatterServer.onConnection = function (socket) {
    console.log("Chat server connection.");
    
    socket.on('chatter.get-messages', function () {
        ChatterServer.messages.forEach(function (data) {
            socket.emit('chatter.message', data);
        });
    });

    socket.on('chatter.message', function (msg) {
    	var text = String(msg || '');

    	if (!text){
    		return;
    	}

      	var data = {
          name: socket.username,
          text: text
        };

  		broadcast('chatter.message', data);
        ChatterServer.messages.push(data);
    });

    socket.on('chatter.identify', function (name) {
        console.log("IDENTIFY: " + name);
        socket.username=String(name || 'Anonymous');
        updateRoster(ChatterServer.socketHub.sockets);
    });
};
    
function updateRoster(sockets) {
	
	var chatters = [];
	
	if(sockets !== undefined && sockets !== null){
		for (var i = 0; i < sockets.length; i++) {
			chatters.push(sockets[i].username);
		}
	}

	console.log("sending roster: ", chatters);
	broadcast('chatter.roster', chatters);

}

function broadcast(event, data) {
  ChatterServer.socketHub.broadcast(event, data);
}




try {
    exports.init = ChatterServer.init;
    exports.onConnection = ChatterServer.onConnection;
    exports.onDisconnection = ChatterServer.onDisconnection;
}
catch(err) {
    
}