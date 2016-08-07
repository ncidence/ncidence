////////////////////////////
//Server Side nodejs code
////////////////////////////
var hostDomainName = "ncidence.org";
var SocketServer = {};
SocketServer.sockets = null;
SocketServer.async = null;
SocketServer.children = null;

SocketServer.init = function(data){
    console.log("Socket Server Starting...");
    SocketServer.async = data.async;
    SocketServer.sockets = [];
    SocketServer.children = data.children;
    SocketServer.realm = hostDomainName;
    data.socketHub = SocketServer;
    
    if(SocketServer.children !== undefined && SocketServer.children !== null){
      SocketServer.children.forEach(function (child) {
        child.init(data);
      });
    }
};


SocketServer.onConnection = function (socket) {
    console.log("Socket Server connection.");

    SocketServer.sockets.push(socket);

    socket.on('disconnect', function () {
      SocketServer.sockets.splice(SocketServer.sockets.indexOf(socket), 1);
      
      if(SocketServer.children !== undefined && SocketServer.children !== null){
        SocketServer.children.forEach(function (child) {
          if(child.onDisconnection !== undefined){
            child.onDisconnection(SocketServer.sockets);
          }
        });
      }
      
    });
    
    if(SocketServer.children !== undefined && SocketServer.children !== null){
      SocketServer.children.forEach(function (child) {
        child.onConnection(socket);
      });
    }
    
};
    

SocketServer.broadcast = function(event, data) {
  SocketServer.sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

try {
    exports.init = SocketServer.init;
    exports.onConnection = SocketServer.onConnection;
    exports.broadcast = SocketServer.broadcast;
}
catch(err) {
    
}