sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, Fragment, MenuItem, MessageToast) {
	"use strict";
	return Controller.extend("com.inc.homeApp.controller.homePage", {
		onInit: function () {
			this._oDSC = this.byId("DynamicSideContent");
			this._oToggleButton = this.byId("toggleButton");
			var poHeaderSet = this.getOwnerComponent().getModel("poHeaderSet");
			poHeaderSet.loadData("model/purchaseOrderList.json", null, false);
			poHeaderSet.refresh();
		},
		_updateToggleButtonState: function (sCurrentBreakpoint) {
			if (sCurrentBreakpoint === "S") {
				this._oToggleButton.setVisible(true);
			} else {
				this._oToggleButton.setVisible(false);
			}
		},
		handleToggleClick: function () {
			this._oDSC.toggle();
		}
	});

});