/* jshint node:true *//* global define, escape, unescape */
'use strict';

var SecureServerFactory = {};
SecureServerFactory.fs = null;
SecureServerFactory.https = null;
SecureServerFactory.router = router;
SecureServerFactory.logger = router;

ApiRoot.init = function(data){
    SecureServerFactory.logger.log("ApiRoot - starting...");
    SecureServerFactory.https = data.https;
    SecureServerFactory.router = data.router;
    SecureServerFactory.fs = data.fs;
    SecureServerFactory.logger = data.logger;
};

function getSecureServer(sslKeyFile, sslDomainCertFile, sslCaBundleFile){
	try {

		var certFileEncoding = 'utf8';

		if (SecureServerFactory.fs.existsSync(sslKeyFile) === false) {
			SecureServerFactory.logger.log('sslKeyFile  was not found!');
		} else if (SecureServerFactory.fs.existsSync(sslDomainCertFile) === false) {
			SecureServerFactory.logger.log('sslDomainCertFile  was not found!');
		} else {
			var ssl = {
				key : SecureServerFactory.fs.readFileSync(sslKeyFile, certFileEncoding),
				cert : SecureServerFactory.fs.readFileSync(sslDomainCertFile, certFileEncoding)
			};

			if (SecureServerFactory.fs.existsSync(sslCaBundleFile)) {
				SecureServerFactory.logger.log('sslCaBundleFile found.');

				var ca, cert, chain, line, _i, _len;

				ca = [];

				chain = SecureServerFactory.fs.readFileSync(sslCaBundleFile, certFileEncoding);

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

			secureServer = SecureServerFactory.https.createServer(ssl, router);
			SecureServerFactory.logger.log('secureServer created');
			
			return secureServer;
		}

	} catch (err) {
		secureServerErr = "Err1: " + err;
		SecureServerFactory.logger.log('Error creating https server: ' + err);
	}
	
	return null;
}


try {
    exports.getSecureServer = SecureServerFactory.getSecureServer;
}
catch(err) {
    
}