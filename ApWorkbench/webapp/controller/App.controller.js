sap.ui.define([
	"com/inc/ApWorkbench/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.inc.ApWorkbench.controller.App", {
		onInit: function () {
			var that = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var url = window.location.href;
			if (url.includes("Action")) {
				if (url.split("?")[1].split("Action-")[1] == "workbench") {
					that.oRouter.navTo("Workbench");
				} else if (url.split("?")[1].split("Action-")[1] == "createinvoice") {
					that.oRouter.navTo("Process");
				} else if (url.split("?")[1].split("Action-")[1] == "expense") {
					that.oRouter.navTo("paymentRequest");
				} else if (url.split("?")[1].split("Action-")[1] == "dashboard") {
					that.oRouter.navTo("DashboardPage");
				}
			} else if (url.includes("FLP")) {
				var nav = url.split("/").pop();
				that.oRouter.navTo(nav);
			} else if (url.includes("invoiceTask")) {
				var value = url.split("/").pop();
				this.getRouter().navTo("invoiceTask", {
					value: value
				});
			} else {
				that.oRouter.navTo("DashboardPage");
			}
			// apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.handleSession();     
		}
	});
});