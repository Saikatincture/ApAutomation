/*global QUnit*/

sap.ui.define([
	"com/inc/ConfigCockpit/controller/Cockpit.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Cockpit Controller");

	QUnit.test("I should test the Cockpit controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});