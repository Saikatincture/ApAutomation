jQuery.sap.declare("incture.com.APCreateInvoice.util.Formatter");
incture.com.APCreateInvoice.util.Formatter = {
	boolean: function (value) {
		if (value)
			return true;
		return false;
	},
	commentDate: function (value) {
		if (value) {
			return new Date(value).toDateString();
		}
	},
	currencySymbolWithValue: function (curVal) {
		if (curVal) {
			var currSymbol = {
				"USD": "$",
				"EUR": "€",
				"CRC": "₡",
				"GBP": "£",
				"ILS": "₪",
				"INR": "₹",
				"JPY": "¥",
				"KRW": "₩",
				"NGN": "₦",
				"PHP": "₱",
				"PLN": "zł",
				"PYG": "₲",
				"THB": "฿",
				"UAH": "₴",
				"VND": "₫"
			};
			// value = (value) ? value : "";
			// var parts = value.toString().split(".");
			// parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			// value = parts.join(".");
			var currncy = currSymbol[curVal] ? currSymbol[curVal] : "";
			return currncy;
		}
	},

	itemDate: function (value) {
		var d = new Date(value);
		var newValue = (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear());
		return newValue;
	},
	
	roundToInteger: function(val) {
		var newValue = Math.floor(val);
		return newValue;
	},
	
	getCompanyCode: function(companyCode, companyName){
		var newName = companyName+ "(" + companyCode + ")";
		return newName;
	},
	
	// decimalFixed: function(value){
	// 	if(value){
	// 		return Number(value).toFixed(2);
	// 	}
	// },
	
	// decimalFixedThree: function(value){
	// 	if(value){
	// 		return Number(value).toFixed(3);
	// 	}
	// }
};