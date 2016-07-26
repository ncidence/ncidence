var Organization = {tableName:"organization"};

Organization.model = {
	name : {
		type : "text",
		size : 64,
		unique : true
	},
	url : {
		type : "text",
		size : 32,
		unique : true
	},
	thing_id : {
		type : "integer",
		foreignKey : {
			table : 'thing'
		}
	}
}

Organization.methods = null;


Organization.define = function(db){
	return db.define(Organization.tableName, Organization.model, Organization.methods);
}

try {
	exports.tableName = Organization.tableName;
    exports.model = Organization.model;
    exports.methods = Organization.methods;
    exports.define = Organization.define;
}
catch(err) {
    
}