var Now = {};

var getDateTime = function() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

Now.log = function(message){
	console.log(getDateTime(), message)
}

Now.logSection = function(message){
	var time = getDateTime();
	
	var dots = '';
	var additionalDots = '';
	
	var lines = '';
	var additionalLines = '';
	
	for (i = 0; i < message.length; i++) { 
		additionalDots += '.';
		additionalLines += '_';
	}
	
	for (i = 0; i < (60-message.length)/2; i++) { 
		dots += '.';
		lines += '_';
	}
	
	var extraDot = '';
	var extraLine = '';
	if(message.length % 2 === 0){
		extraDot = '.';
		extraLine = '_';
	}
	
	
	console.log('');
	console.log('');
	console.log(time, '___' + additionalLines + lines + extraLine);
	console.log(time, '...' + additionalDots + dots + extraDot);
	console.log(time, '   ' + message);
	console.log(time, '...' + additionalDots + dots + extraDot);
	console.log(time, '___' + additionalLines + lines + extraLine);
}

try {
    exports.log = Now.log;
    exports.logSection = Now.logSection;
}
catch(err) {
    
}