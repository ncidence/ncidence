/* jshint node:true *//* global define, escape, unescape */
'use strict';

var ApiRoot = {};
ApiRoot.dbPool = null;
ApiRoot.schema = null;
ApiRoot.logger = null;


/**
 * ApiRoot.init
 */
ApiRoot.init = function(data){
    ApiRoot.dbPool = data.dbPool;
    ApiRoot.schema = data.schema;
    ApiRoot.guid = data.guid;
    ApiRoot.logger = data.logger;
    ApiRoot.logger.log("ApiRoot - starting...");
};



/**
 * ApiRoot.register
 */
ApiRoot.register = function (router) {
    ApiRoot.logger.log("ApiRoot - registering endpoints...");
    
    ApiRoot.logger.log("ApiRoot - /api/db");
    
    
    /**
     * /api/db
     */
    router.get('/api/db', function(req, res) {
	
		var callback= function(db){
			try{
				db.query('SHOW DATABASES', function(err, rows) {
	    			if (err) {
	    				res.status(200).json({
	    					error : 'Error while listing DBs: ' + err
	    				});
	    			} else {
	    				res.status(200).json({
	    					rows : rows
	    				});
	    			}
	    		});
			}catch(ex){
				
				ApiRoot.dbPool.resetSchema(ApiRoot.schema);
				
				res.status(200).json({
	    			err : ex
	    		});
			}
		}
			
		ApiRoot.dbPool.getConnection(ApiRoot.schema, callback);
    		
    });
    
    
    
    
    ApiRoot.logger.log("ApiRoot - /api/db2");
    /**
     * /api/db2
     */
    router.get('/api/db2', function(req, res) {

		var callback= function(db){
			try{
				db.query('SHOW DATABASESS', function(err, rows) {
        			if (err) {
        				res.status(200).json({
        					error : 'Error while listing DBs: ' + err
        				});
        			} else {
        				res.status(200).json({
        					rows : rows
        				});
        			}
        		});
			}catch(ex){
				
				ApiRoot.dbPool.resetSchema(ApiRoot.schema);
				
				res.status(200).json({
	    			err : ex
	    		});
			}
		}
		
		ApiRoot.dbPool.getConnection(ApiRoot.schema, callback);
    		
    });
    
    
    
    ApiRoot.logger.log("ApiRoot - /api/tables");
    /**
     * /api/tables
     */
    router.get('/api/tables', function(req, res) {

		var callback= function(db){
			try{
				db.query('SHOW TABLES', function(err, rows) {
        			if (err) {
        				ApiRoot.dbPool.resetSchema(ApiRoot.schema);
        				res.status(200).json({
        					error : 'Error while listing TABLES: ' + err
        				});
        			} else {
        				res.status(200).json({
        					rows : rows
        				});
        			}
        		});
			}catch(ex){
				
				ApiRoot.dbPool.resetSchema(ApiRoot.schema);
				
				res.status(200).json({
	    			err : ex
	    		});
			}
		}
		
		ApiRoot.dbPool.getConnection(ApiRoot.schema, callback);
    		
    });
    
    
    /*
    ApiRoot.logger.log("ApiRoot - /api/user");
    router.get('/api/userPrime', function(req, res) {
    	ApiRoot.logger.log('#####################/api/userPrime');
    	
    	ApiRoot.dbPool.getOrm('ncidence')
    	
    	Animal.get(1, function (err, animal) {
    	    // animal is the animal model instance, if found
    	    animal.getOwner(function (err, person) {
    	        // if animal has really an owner, person points to it
    	    });
    	});
    });
    */

    
    ApiRoot.logger.log("ApiRoot - /api/guid");
    /**
     * /api/guid
     */
    router.get('/api/guid', function(req, res) {
    	res.status(200).json({
    		guid : ApiRoot.guid.generate(req.query.useDashes)
    	});
    });
}



try {
    exports.init = ApiRoot.init;
    exports.register = ApiRoot.register;
}
catch(err) {
    
}