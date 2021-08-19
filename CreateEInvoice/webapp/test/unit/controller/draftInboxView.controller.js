/*global QUnit*/

sap.ui.define([
	"com/incture/CreateEInvoice/controller/draftInboxView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("draftInboxView Controller");

	QUnit.test("I should test the draftInboxView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});