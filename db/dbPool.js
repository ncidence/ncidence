/* jshint node:true *//* global define, escape, unescape */
'use strict';

var DbPool = {};
DbPool.host = null;
DbPool.pw = null;
DbPool.pool = null;
DbPool.ormPool = null;
DbPool.logger = null;

DbPool.entities = ['thing','organization','user'];

DbPool.init = function(data) {
	DbPool.host = data.host;
	DbPool.pw = data.pw;
	DbPool.logger = data.logger;
	DbPool.pool = {};
	DbPool.ormPool = {};
	DbPool.log("DbPool - starting...");
};

DbPool.resetSchema = function(schema) {
	DbPool.log('resetSchema: ' + schema);
	DbPool.pool[schema] = null;
	DbPool.ormPool[schema] = null;
}

DbPool.getOrm = function(schema, dropDatabase,  callback) {

	if (typeof (DbPool.ormPool[schema]) !== 'undefined'
			&& DbPool.ormPool[schema] !== undefined
			&& DbPool.ormPool[schema] !== null) {
		var db = DbPool.ormPool[schema];
		callback(db);
	} else {
		var mySqlIp = DbPool.host;
		if (mySqlIp !== null && mySqlIp !== null) {
			try {
				var orm = require("orm");
				DbPool.log('connecting orm: ' + mySqlIp);
				orm.connect("mysql://root:" + DbPool.pw + "@" + mySqlIp + "/"
						+ schema, function(err, db) {
					if (err)
						throw err;
					
					DbPool.log('............................');
					DbPool.log('orm LOADED for ' + schema + ' schema. ');
					DbPool.log('............................');
					
					db.schema = schema;
					db.dropDatabase = dropDatabase;
					DbPool.ormPool[schema] = db;
					
					callback(db);
				});

			} catch (e) {
				DbPool.log('............................');
				DbPool.logger
						.log('FAILED TO LOAD orm schema ' + schema + '.. ');
				DbPool.log(e);
				DbPool.log('............................');
			}
		} else {
			DbPool.log('MYSQL_PORT_3306_TCP_ADDR not defined');
		}
	}

}

DbPool.getConnection = function(schema, callback) {

	DbPool.log('getting connection: ' + schema);
	if (typeof (DbPool.pool[schema]) !== 'undefined'
			&& DbPool.pool[schema] !== undefined
			&& DbPool.pool[schema] !== null) {
		var mySqlConnection = DbPool.pool[schema];
		callback(mySqlConnection);
	} else {
		var mySqlIp = DbPool.host;

		if (mySqlIp !== null && mySqlIp !== null) {
			DbPool.log('connecting mysql: ' + mySqlIp);
			var password = DbPool.pw;

			try {

				var mysqlClient = require('mysql');
				var mySqlConnection = mysqlClient.createConnection({
					host : mySqlIp,
					user : 'root',
					password : password,
					database : schema
				});

				DbPool.log('............................');
				DbPool.log('mysql ' + schema + ' schema LOADED.. ');
				DbPool.log('............................');

				DbPool.pool[schema] = mySqlConnection;
				callback(mySqlConnection);

				mySqlConnection.on('error', function(err) {
					DbPool.log('............................');
					DbPool.log('db error LOADING ' + schema + ' schema',
							err);
					DbPool.log('............................');
				});

			} catch (e) {
				DbPool.log('............................');
				DbPool.log('FAILED TO LOAD mysql schema ' + schema
						+ '.');
				DbPool.log(e);
				DbPool.log('............................');
			}
		} else {
			DbPool.log('MYSQL_PORT_3306_TCP_ADDR not defined');
		}
	}

}

var loadForeignKeysAsync = function(db, tablesWithNextTables) {
	
	if(typeof(tablesWithNextTables.value) === 'undefined' || tablesWithNextTables.value === undefined || tablesWithNextTables.value === null){
		DbPool.log('!!!!!!!!!!!!!!tablesWithNextTables was null or undefined!!!!!!!!!!!!!!');
		return;
	}

	DbPool.log('loading foreign keys for ' + db.schema + '.' + tablesWithNextTables.value.tableName);
	
	
	var next = function(item, callback){
		if(item.finalCallback !== undefined){
			item.finalCallback(db);
		}else if(item.nextItem != undefined){		
			callback(db, item.nextItem);
		}
	}
	
	var columnCount = 0;
	var columnsWithNoForeignKeyCount = 0;
	for ( var column in tablesWithNextTables.value.model) {
		columnCount++;
		
		if (!tablesWithNextTables.value.model.hasOwnProperty(column)) {
			DbPool.log('no column error: ' + column);
			continue;
		}

		var foreignKey = tablesWithNextTables.value.model[column]['foreignKey'];
		if (foreignKey === undefined || foreignKey === null) {
			columnsWithNoForeignKeyCount++;
			continue;
		}

		DbPool.log('adding foreign key: ' + tablesWithNextTables.value.tableName + '.'
				+ foreignKey.table + '_id');
		
		db.models[tablesWithNextTables.value.tableName].hasOne(foreignKey.table,
				db.models[foreignKey.table]);
		
		
		DbPool.getConnection(db.schema, function(connection){
			try{
				var fkName = 'FK_'+ tablesWithNextTables.value.tableName + '_' + foreignKey.table;
				
				var checkForFkStatement = "SELECT COUNT(1) count" + 
				" FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " + 
				" WHERE CONSTRAINT_SCHEMA = '" + db.schema + "' " +
				" AND CONSTRAINT_NAME = '" + fkName + "'";
				
				var foreignKeyTable = foreignKey.table;
				
				connection.query(checkForFkStatement, 
						function(err, rows) {
				          if (err){
				        	  DbPool.log('Error while looking for foreign key [' + fkName + ']: ' + err);
				          }else{
				        	  if(rows[0].count > 0){
				        		  DbPool.log('Existing foreign key [' + fkName + '] was found');
				        	  }else{
				        		  DbPool.log('Creating foreign key [' + fkName + "]...");
				        		  
				        		  var createFkStatement = " ALTER TABLE " + tablesWithNextTables.value.tableName +
									" ADD foreign key " + fkName + "(" + foreignKeyTable + "_id)" +
									" REFERENCES " + db.schema + "." + foreignKeyTable + "(id)";
					        	  
					        	  connection.query(createFkStatement, 
										function(err, rows) {
								          if (err){
								        	  DbPool.log('Error while listing creating foreign key [' + fkName + ']: ' + err);
								          }else{
								        	  DbPool.log('Done creating foreign key [' + fkName + "]");
								        	  next(tablesWithNextTables, loadForeignKeysAsync);
								          }
								        }
									);
				        	  }
				          }
				        }
					);
				
				
		    }catch(ex){
		    	DbPool.log("Error loading foreign keys: " + ex);
		    }
		});

	
	}
	if(columnCount === columnsWithNoForeignKeyCount){
		DbPool.log('no foreignKeys found for ' + db.schema + '.' + tablesWithNextTables.value.tableName);
		next(tablesWithNextTables, loadForeignKeysAsync);
	}
	
	
	//next(tablesWithNextTables, loadForeignKeysAsync);
	/*
	if(tablesWithNextTables.finalCallback !== undefined){
		tablesWithNextTables.finalCallback(db);
	}else if(tablesWithNextTables.nextItem != undefined){		
		loadForeignKeysAsync(db, tablesWithNextTables.nextItem);
	}
	*/

}


DbPool.log = function(message){
	DbPool.logger.log('[dbPool] - ' + message);
}

DbPool.dropTable = function(orm, tableWithNextTables) {
	
	if(typeof(tableWithNextTables) === 'undefined' || tableWithNextTables === undefined || tableWithNextTables === null){
		DbPool.log('Error in DbPool.dropTable. tableWithNextTables was undefined or null');
		return;
	}
	
	if(typeof(orm) === 'undefined' || orm === undefined || orm === null){
		DbPool.log('Error in DbPool.dropTable. orm was undefined or null');
		return;
	}

	var dropStatement = " DROP TABLE " + orm.schema + "." + tableWithNextTables.value;
	  DbPool.getConnection(orm.schema, function(connection){
		  connection.query(dropStatement, 
					function(err, rows) {
			          if (err){
			        	  DbPool.log('Error while dropping ' + orm.schema + "." + tableWithNextTables.value + "" + err);
			          }else{
			        	  DbPool.log('!Done dropping ' + orm.schema + "." + tableWithNextTables.value);
			          }
			          
			          if(tableWithNextTables.finalCallback !== undefined){
			        	  	orm.dropDatabase = false;
				      		tableWithNextTables.finalCallback(orm);
				      		
				      	}else if(tableWithNextTables.nextItem !== undefined){
				      		DbPool.dropTable(orm, tableWithNextTables.nextItem);
				      	}
			        }
				);
		  
	  });
}

DbPool.dropTables = function(orm, callback) {
	DbPool.logger.logSection("dropping database tables in schema [" + orm.schema + "]");
	var tableWithNextTables = DbPool.getRepeatedActionMap(DbPool.entities, callback, true);
	DbPool.dropTable(orm, tableWithNextTables);
}

DbPool.getRepeatedActionMap = function(items, finalCallback, reverse){
	var item = null;
	
	
	var direction = (typeof(reverse) !== 'undefined' && reverse !== undefined && reverse !== null && reverse === true) ? 1 : -1;

	var start = direction < 0 ? items.length - 1 : 0;
	var end = direction < 0 ? -1 : items.length;
	
	if(direction > 0){
		for (var i = start; i < end; i+=1) {
			if(i === start){
				item = {value:items[i], finalCallback:finalCallback};
			}else{
				item = {value:items[i], nextItem:item};
			}
		}
	}else{
		for (var i = start; i > end; i-=1) {
			if(i === start){
				item = {value:items[i], finalCallback:finalCallback};
			}else{
				item = {value:items[i], nextItem:item};
			}
		}
	}
	
	return item;
}


/**
 * DbPool.registerOrm 
 */
DbPool.registerOrm = function(orm) {
	
	if(orm.dropDatabase !== undefined && orm.dropDatabase !== null && orm.dropDatabase === true){
		DbPool.dropTables(orm, DbPool.registerOrm);
	}else{
		var entities = [];
		
		for (var i = 0; i < DbPool.entities.length; i++) {
			DbPool.log('loading ' + DbPool.entities[i]);
			var entity = require('./entities/' + DbPool.entities[i] + 'Entity.js');
			var model = entity.define(orm);
			entities.push(entity);
		}
		
		DbPool.logger.logSection('DB SYNC');
		orm.sync(function(err) {
			if (err) {
				DbPool.log('DB Sync err: ' + err);
			} else {
				
				var tablesWithNextTables = DbPool.getRepeatedActionMap(entities, function(){DbPool.log('End db sync.');});
				
				if(tablesWithNextTables === null){
					DbPool.log('!tablesWithNextTablesString was null ' + entities.length);
				}else{
					loadForeignKeysAsync(orm, tablesWithNextTables);
				}
			}
		});
	}


}

try {
	exports.init = DbPool.init;
	exports.getOrm = DbPool.getOrm;
	exports.getConnection = DbPool.getConnection;
	exports.resetSchema = DbPool.resetSchema;
	exports.registerOrm = DbPool.registerOrm;
} catch (err) {

}