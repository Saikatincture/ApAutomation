sap.ui.define([
		"ui/incture/APTest/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.inc.ApWorkbench.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("invoiceTask");
			}

		});

	}
);