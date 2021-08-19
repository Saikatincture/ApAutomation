jQuery.sap.declare("com.inc.ZTaskApp.utility.formatter");
com.inc.ZTaskApp.utility.formatter = {

	UserArrayFormatter: function (aValue) {
		var sUser = [];
		var num = aValue.length;
		for (var i = 0; i < num - 1; i++) {
			sUser.push({
				"user": aValue[i]
			});
		}
		return sUser;
	},

	formatRowHighlight: function (sValue) {
		// Your logic for rowHighlight goes here
		if (sValue == "READY") {
			return "Success";
		} else if (sValue == "COMPLETED") {
			return "Information";
		} else if (sValue == "CANCELED") {
			return "Error";
		}
		return "None";
	},

	itemDate: function (value) {
		if (value) {
			var d = new Date(value);
			var newValue = (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear());
			return newValue;
		}
	},
	
	decimalFixed: function(value){
		if(value){
			return Number(value).toFixed(2);
		}
	},
	
	decimalFixedThree: function(value){
		if(value){
			return Number(value).toFixed(3);
		}
	},
	

};