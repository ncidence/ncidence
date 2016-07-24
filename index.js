console.log('..........................................................');
console.log('..........................................................');
console.log('..........................................................');
console.log('....................Launching Ncidence....................');
console.log('..........................................................');
console.log('..........................................................');
//
// A simple chat server using Socket.IO, Express, and Async.
//
console.log('............................');
console.log('var publicdir = ' + __dirname + '/client');
var publicdir = __dirname + '/client';
console.log('............................');


var path = path = require('path');
var fs = require('fs');
var http = require('http');
var mkpath = require('mkpath');
var moment = require('moment-timezone');

var https = null;
var useHttpsTemp = process.env.HTTPS || null;
var useHttps = false;


console.log('');
console.log('');
console.log('................................................');
console.log('...............HTTPS............................');
console.log('................................................');
console.log('................................................');
if(useHttpsTemp !== undefined && useHttpsTemp!= null && (useHttpsTemp === true || useHttpsTemp.toLowerCase() =='true')){
    console.log('............................');
    console.log('HTTPS=true');
    console.log('............................');
    useHttps = true;
    https = require('https');
}else{
  console.log('............................');
    console.log('HTTPS=false');
    console.log('............................');
}



console.log('................................................');
console.log('...............MYSQL............................');
console.log('................................................');
console.log('................................................');
var mySqlIp = process.env.MYSQL_PORT_3306_TCP_ADDR || null;
mySqlIp = mySqlIp !== undefined && mySqlIp !== null ?  mySqlIp : (process.env.MYSQL_IP || null);

var mySqlConnection = null;
if(mySqlIp !== null && mySqlIp !== null){
	console.log('connecting mysql: ' + mySqlIp);
	var password = process.env.MYSQL_ENV_MYSQL_ROOT_PASSWORD || null;
	password = password !== undefined && password !== null ?  password : (process.env.MYSQL_PASSWORD || null);
    try {
    	
    	var mysqlClient = require('mysql');
         mySqlConnection = mysqlClient.createConnection({
             host: mySqlIp,
             user: 'root',
             password: password,
             database : 'ncidence'
         });
         console.log('............................');
         console.log('mysql LOADED.. ');
         console.log('............................');
         mySqlConnection.on('error', function(err) {
             console.log('............................');
             console.log('db error', err);
             console.log('............................');
         });
         
         
    }catch (e) {
        console.log('............................');
        console.log('FAILED TO LOAD mysql.. ');
        console.log(e);
        console.log('............................');
    }
    
    
    
    console.log('................................................');
    console.log('...............ORM..............................');
    console.log('................................................');
    console.log('................................................');
    try {
         var orm = require("orm");
            orm.connect("mysql://root:"+password+"@"+mySqlIp+"/ncidence", function (err, db) {
              if (err) throw err;
              
                var User = db.define ("User", {
                    username    : { type: "text", size: 20, unique: true  },
                    password    : String,
                    salt    : String,
                    email    : { type: "text", size: 254, unique: true  },
                    isLocked    : { type: "boolean", defaultValue: false },
                    loginattemptsSinceLastSuccess: { type: "integer", size:2, defaultValue:0 },
                    lastLoginTime   : { type: "date", time: true },
                    status : { type: "enum", values: [ "User", "Rep", "Admin" ] },
                    signUpTime   : { type: "date", time: true },
                    lockDate   : { type: "date", time: true }
                }, {
                    methods: {
                        userNameAndEmail: function () {
                            return this.username + ' (' + this.email + ')';
                        }
                    }
                });
                
                console.log('............................');
                console.log('Begin sync... ');
                console.log('............................');
                db.sync(function(err) {
                    if (err){
                        console.log('............................');
                        console.log('Sync err: ' + err);
                        console.log('............................');
                    }
                    console.log('............................');
                    console.log('End sync... ');
                    console.log('............................');
                });
                
            });
            console.log('............................');
            console.log('orm LOADED.. ');
            console.log('............................');
         
    }catch (e) {
          console.log('............................');
        console.log('FAILED TO LOAD orm.. ');
        console.log(e);
        console.log('............................');
    }
}else{
	console.log('MYSQL_PORT_3306_TCP_ADDR not defined');
}





var async = require('async');
var express = require('express');

//var getIp = require('ipware')().get_ip;
var getIp = function getIp(req){
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
     
     var clientIp = {clientIp:ip};
     
     return clientIp;
};




var router = express();
router.use(require('body-parser')());

var server = null;
var secureServer = null;


var secureServerErr = null;


if(useHttps === true && https != null){
   try{
       console.log('................................................');
       console.log('...............SSL..............................');
       console.log('................................................');
       console.log('................................................');
       var sslKeyFile = process.env.sslKeyFile || './ssl/domain-key.pem';
       console.log('sslKeyFile: ' + sslKeyFile);
       
       var sslDomainCertFile = process.env.sslDomainCertFile || './ssl/domain.org.crt';
       console.log('sslDomainCertFile: ' + sslDomainCertFile);
       
       var sslCaBundleFile = process.env.ssCaBundleFile || './ssl/bundle.crt';
       console.log('sslCaBundleFile: ' + sslCaBundleFile);
       
       var certFileEncoding = 'utf8';
       
       if (fs.existsSync(sslKeyFile) === false) {
           console.log('sslKeyFile  was not found!');
       }else if (fs.existsSync(sslDomainCertFile) === false) {
           console.log('sslDomainCertFile  was not found!');
       }
       else{
           var ssl = {
                key: fs.readFileSync(sslKeyFile, certFileEncoding),
                cert: fs.readFileSync(sslDomainCertFile, certFileEncoding)
            };
            
            if (fs.existsSync(sslCaBundleFile)) {
                console.log('sslCaBundleFile found.');
                
                var ca, cert, chain, line, _i, _len;
            
                ca = [];
            
                chain = fs.readFileSync(sslCaBundleFile, certFileEncoding);
            
                chain = chain.split("\n");
            
                cert = [];
            
                for (_i = 0, _len = chain.length; _i < _len; _i++) {
                  line = chain[_i];
                    if (!(line.length !== 0)) {
                        continue;
                    }
                    
                    cert.push(line);
                    
                    if (line.match(/-END CERTIFICATE-/)) {
                      ca.push(cert.join("\n"));
                      cert = [];
                    }
                }
            
                ssl.ca = ca;
            }
            
            secureServer = https.createServer(ssl, router);
            console.log('secureServer created');
       }
       

    }catch(err){
        secureServerErr = "Err1: " + err;
        console.log('Error creating https server: ' + err);
    } 
}






//////////////////////////
//BEGIN MIDDLEWARE///
//////////////////////////
function requireHTTPS(req, res, next) {
    if (!req.secure) {
      var redirectUrl = 'https://' + req.get('host') + req.url;
        console.log('REDIREC: ' + redirectUrl);
        return res.redirect(redirectUrl);
    }
    next();
}

if(useHttps === true){
    console.log('................................................');
    console.log('...........REQUIRE HTTPS........................');
    console.log('................................................');
    console.log('................................................');
    router.use(requireHTTPS);
}

//This allows for navigation to html pages without the .html extension
console.log('................................................');
console.log('...........REMOVE HTML REQUIREMENT..............');
console.log('................................................');
console.log('................................................');
if(path === undefined || path === null){
    router.use(function(req, res, next) {
        if (req.path.indexOf('.') === -1) {
            var file = publicdir + req.path + '.html';
            fs.exists(file, function(exists) {
              if (exists)
                req.url += '.html';
              next();
            });
        }
        else{
           next(); 
        }
    });
    console.log('express.static('+publicdir+')');
    router.use(express.static(publicdir));
}else{
	console.log('router.use(express.static(path.resolve('+__dirname+', \'client\')));');
    router.use(express.static(path.resolve(__dirname, 'client')));
}
//////////////////////////
//END MIDDLEWARE///
//////////////////////////


console.log('................................................');
console.log('...........CONTROLLER ROUTES....................');
console.log('................................................');
console.log('................................................');
////////////////////////////
//BEGIN CONTROLLER ROUTES///
////////////////////////////





router.get('/api/init-db', function(req, res) {
    console.log('######################/api/init-db');
    try{
        if(mySqlIp !== null && mySqlIp !== null){
            var mysqlClient = require('mysql');
             mySqlConnection = mysqlClient.createConnection({
                 host: mySqlIp,
                 user: 'root',
                 password: process.env.MYSQL_ENV_MYSQL_ROOT_PASSWORD,
                 database : 'ncidence'
             });
             
             mySqlConnection.on('error', function(err) {
                 console.log('db error', err);
             });
             
             res.json(200, { msg: 'mysql connection established' });
        }else{
            res.json(200, { err: 'mysql connection not configured!' });
        } 
    }catch(ex){
        res.json(200, { err: 'mysql connection error: ' + ex });
    }
});


router.get('/api/db', function(req, res) {
    console.log('!#####################/api/db');
    try{
        mySqlConnection.query('SHOW DATABASES', function(err, rows) {
          if (err){
            res.status(200).json({ error: 'Error while listing DBs: ' + err });
          }else{
        	  res.status(200).json({ rows: rows });
          }
        });
    }catch(ex){
        res.status(200).json({ err: ex });
    }
});


router.get('/api/createSchema', function(req, res) {
    console.log('######################/api/createSchema');
    try{
        mySqlConnection.query('CREATE SCHEMA ' + req.query.schema, function(err, rows) {
          if (err){
            res.json(200, { error: 'Error while listing DBs: ' + err });
          }
          res.json(200, { rows: rows });
        });
    }catch(ex){
        res.json(200, { err: ex });
    }
});

router.get('/api/db2', function(req, res) {
    console.log('######################/api/db2');
    try{
        mySqlConnection.query(req.query.sql, function(err, rows) {
          if (err){
            console.log('------------error in query: ' + err);
            res.json(200, { rows: err });
          }
          res.json(200, { rows: rows });
        });
    }catch(ex){
        console.log('------------execption in query caught: ' + ex);
        res.json(200, { err: ex });
    }
});

router.get('/api/persons', function(req, res) {
    console.log('######################/api/persons');
    mySqlConnection.query(req.query.sql, function(err, rows) {
      if (err){
          res.json(200, { err: err });
      }else{
          res.json(200, { rows: rows });
      }
        
      
    });
    
});


router.get('/api/addperson', function(req, res) {
    console.log('######################/api/addperson');
    try{
        if(mySqlConnection != null){
            var query = mySqlConnection.query('INSERT INTO Persons SET ?', {
              "PersonID": "2",
              "LastName": "Ruffino2",
              "FirstName": "Tony2",
              "Address": null,
              "City": null
            }, function(err, result) {
                if (err){
                    res.json(200, { err: err });
                }else{
                    res.send(result);
                }
            });
        }else{
            res.send('mySqlConnection not initialized!');
        }
    }catch(ex){
        res.json(200, { err: ex });
    }
    
});


//////////////////////////
//END CONTROLLER ROUTES///
//////////////////////////





console.log('................................................');
console.log('...........START SERVER.........................');
console.log('................................................');
console.log('................................................');
//////////////////////////
//START UP SERVER(S)//////
//////////////////////////

//HTTPS
if(secureServer != null){
	console.log('...........HTTPS');
    try{
        secureServer.listen(process.env.SECURE_PORT || 443, process.env.SECURE_IP || "0.0.0.0", function(){
            var addr = secureServer.address();
            console.log("Secure server listening at", addr.address + ":" + addr.port);
        });
    }
    catch(err2){
        console.log("Err: " + err2);
        secureServerErr = "Err: " + err2;
    }
}


if(server === undefined || server === null){
	console.log('...........HTTP');
    server = http.createServer(router);
}

//HTTP
console.log('...........STARTING....');
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("HTTP server listening at", addr.address + ":" + addr.port);
});