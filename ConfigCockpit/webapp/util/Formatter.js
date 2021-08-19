jQuery.sap.declare("com.inc.ConfigCockpit.util.Formatter");

com.inc.ConfigCockpit.util.Formatter = {
	removeZero: function (value) {
		if (value) {
			return value.replace(/\b0+/g, '');
		} else {
			return "";
		}
	}
};
