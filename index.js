console.log('..........................................................................................');
console.log('..........................................................................................');
console.log('..........................................................................................');
console.log('....................................Launching Ncidence....................................');
console.log('..........................................................................................');
console.log('..........................................................................................');


var logger = require('./utils/logger.js');

var publicdir = __dirname + '/client';

var path = path = require('path');
var fs = require('fs');
var http = require('http');
var mkpath = require('mkpath');
var moment = require('moment-timezone');
var guid = require('./utils/guid.js');
var async = require('async');
var express = require('express');
var router = express();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
	extended : true
}));
router.use(bodyParser.json());

var server = null;
var secureServer = null;
var secureServerErr = null;


//////////////////////////
//BEGIN SSL///
//////////////////////////
logger.logSection('SSL');

var https = null;
var useHttpsTemp = process.env.HTTPS || null;
var useHttps = false;

if (useHttpsTemp !== undefined && useHttpsTemp != null
		&& (useHttpsTemp === true || useHttpsTemp.toLowerCase() == 'true')) {
	logger.log('HTTPS:true');
	useHttps = true;
	https = require('https');
} else {
	logger.log('HTTPS:false');
}

if (useHttps === true && https != null) {
	
	var sslKeyFile = process.env.sslKeyFile || './ssl/domain-key.pem';
	logger.log('sslKeyFile: ' + sslKeyFile);

	var sslDomainCertFile = process.env.sslDomainCertFile || './ssl/domain.org.crt';
	logger.log('sslDomainCertFile: ' + sslDomainCertFile);

	var sslCaBundleFile = process.env.ssCaBundleFile || './ssl/bundle.crt';
	logger.log('sslCaBundleFile: ' + sslCaBundleFile);

	var certFileEncoding = 'utf8';

	if (fs.existsSync(sslKeyFile) === false) {
		logger.log('sslKeyFile  was not found!');
	} else if (fs.existsSync(sslDomainCertFile) === false) {
		logger.log('sslDomainCertFile  was not found!');
	} else if (fs.existsSync(sslCaBundleFile) === false) {
		logger.log('sslCaBundleFile  was not found!');
	} else {
		var secureServerFactory = require('./utils/secureServerFactory.js');
		secureServerFactory.init({https:https, router:router, fs:fs, logger:logger})
		secureServer = secureServerFactory.getSecureServer(sslKeyFile, sslDomainCertFile, sslCaBundleFile); 
	}
}
//////////////////////////
//END SSL///
//////////////////////////



//////////////////////////
//BEGIN MIDDLEWARE///
//////////////////////////
logger.logSection('MIDDLEWARE');
logger.log('publicdir: ' + publicdir);

function requireHTTPS(req, res, next) {
	if (!req.secure && req.get('host') !== 'localhost') {
		var redirectUrl = 'https://' + req.get('host') + req.url;
		logger.log('REDIREC: ' + redirectUrl);
		return res.redirect(redirectUrl);
	}
	next();
}

if (useHttps === true) {
	logger.log('require https');
	router.use(requireHTTPS);
}

function interceptApiRequests(req, res, next) {
	var host = req.get('host');

	if (req.url !== undefined && req.url !== null && req.url.startsWith('/api/')) {
		logger.log('API CALL -> HOST: ' + host);
	}else{
		//logger.log('NON-API CALL -> HOST: ' + req.url);
	}

	next();
}
router.use(interceptApiRequests);

// This allows for navigation to html pages without the .html extension
logger.log('remove .html extension requirement');
if (path === undefined || path === null) {
	router.use(function(req, res, next) {
		if (req.path.indexOf('.') === -1) {
			var file = publicdir + req.path + '.html';
			fs.exists(file, function(exists) {
				if (exists)
					req.url += '.html';
				next();
			});
		} else {
			next();
		}
	});
	router.use(express.static(publicdir));
} else {
	router.use(express.static(path.resolve(__dirname, 'client')));
}
// ////////////////////////
// END MIDDLEWARE///
// ////////////////////////



//////////////////////////
//BEGIN PERSISTENCE///
//////////////////////////
logger.logSection('PERSISTENCE');

var mySqlIp = process.env.MYSQL_PORT_3306_TCP_ADDR || null;
mySqlIp = mySqlIp !== undefined && mySqlIp !== null ? mySqlIp
		: (process.env.MYSQL_IP || null);

var mySqlConnection = null;
var password = process.env.MYSQL_ENV_MYSQL_ROOT_PASSWORD || null;
password = password !== undefined && password !== null ? password
		: (process.env.MYSQL_PASSWORD || null);

var dbPool = require('./db/dbPool.js');
dbPool.init({host:mySqlIp, pw:password, logger:logger});

if (mySqlIp !== null && mySqlIp !== null) {
	dbPool.getOrm('ncidence', true, dbPool.registerOrm);
} else {
	logger.log('NO PERSISTENCE DEFINED!!!!');
}
//////////////////////////
//END PERSISTENCE///
//////////////////////////




// //////////////////////////
// BEGIN CONTROLLER ROUTES////
// //////////////////////////
logger.logSection('CONTROLLER ROUTES');

var apiRoot = require('./api/apiRoot.js');
apiRoot.init({dbPool:dbPool, schema:'ncidence', guid: guid, logger:logger});
apiRoot.register(router);


router.get('/api/init-db', function(req, res) {
	logger.log('######################/api/init-db');
	try {
		dbPool.resetSchema('ncidence');
	} catch (ex) {
		res.status(200).json({
			err : 'mysql connection error: ' + ex
		});
	}
});

// ////////////////////////
// END CONTROLLER ROUTES////
// ////////////////////////



// ////////////////////////
// START UP SERVER(S)//////
// ////////////////////////
logger.logSection('START SERVER');
// HTTPS
if (secureServer != null) {
	logger.log('starting https server...');
	try {
		secureServer.listen(process.env.SECURE_PORT || 443,
				process.env.SECURE_IP || "0.0.0.0", function() {
					var addr = secureServer.address();
					logger.log("https server listening at", addr.address
							+ ":" + addr.port);
				});
	} catch (err2) {
		logger.log("Err: " + err2);
		secureServerErr = "Err: " + err2;
	}
}

if (server === undefined || server === null) {
	server = http.createServer(router);
}

// HTTP
logger.log('starting http server...');;
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0",
		function() {
			var addr = server.address();
			logger.log("http server listening at", addr.address + ":"
					+ addr.port);
		});