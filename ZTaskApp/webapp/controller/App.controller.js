sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.inc.ZTaskApp.controller.App", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("taskScreen");
			// var url = window.location.href;
			// console.log(url)
		}
	});
});