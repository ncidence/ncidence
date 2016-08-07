var Group = {tableName:"group"};

Group.model = {
	name : {
		type : "text",
		size : 64,
		unique : true
	},
	url : {
		type : "text",
		size : 32,
		unique : true
	}
}

Group.methods = null;


Group.define = function(db){
	return db.define(Group.tableName, Group.model, Group.methods);
}

try {
	exports.tableName = Group.tableName;
    exports.model = Group.model;
    exports.methods = Group.methods;
    exports.define = Group.define;
}
catch(err) {
    
}