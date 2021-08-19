sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("incture.com.APCreateInvoice.controller.App", {
		onInit: function () {
			// var that = this;
			
			var aParameter = window.location.href.split("/status/")[1];
			if (aParameter) {
				var arr = aParameter.split("^");
				var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
				if (arr[1] === "300866") {
					mHeaderDetails.setProperty("/VendorID", arr[1]);
					mHeaderDetails.setProperty("/SelectedVendorName", "Convergint Technologies");
				} else if (arr[1] === "INC") {
					mHeaderDetails.setProperty("/VendorID", arr[1]);
					mHeaderDetails.setProperty("/SelectedVendorName", "InstaBasket.com");
				} else if (arr[1] === "admin") {
					mHeaderDetails.setProperty("/VendorID", "");
					mHeaderDetails.setProperty("/SelectedVendorName", "");
					mHeaderDetails.setProperty("/dashVendor", null);
				}
				if (arr[3] === "all") {
					mHeaderDetails.setProperty("/selectedCompanyCode", "");
				} else {
					mHeaderDetails.setProperty("/selectedCompanyCode", arr[3]);
				}
				mHeaderDetails.setProperty("/Status", arr[0]);
				var startDate = Number(arr[4]);
				var firstDate = new Date(startDate);
				mHeaderDetails.setProperty("/dateValue", firstDate);
				var endDate = Number(arr[5]);
				var secondDate = new Date(endDate);
				mHeaderDetails.setProperty("/secondDateValue", secondDate);
			}
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.navTo("purchaseOrder");

		}
	});
});