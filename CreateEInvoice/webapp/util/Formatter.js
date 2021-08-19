jQuery.sap.declare("com.incture.CreateEInvoice.util.Formatter");
com.incture.CreateEInvoice.util.Formatter = {
	boolean: function (value) {
		if (value)
			return true;
		return false;
	},
	commentDate: function (value) {
		if (value) {
			return new Date(value).toDateString();
		}
	}
};