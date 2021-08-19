sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/inc/ApWorkbench/model/models",
	"sap/m/MessageBox"
], function (UIComponent, Device, models, MessageBox) {
	"use strict";

	return UIComponent.extend("com.inc.ApWorkbench.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.checkSessionTimeout();
		},
		checkSessionTimeout: function () {

			var IDLE_TIMEOUT = 3601; //seconds
			var _idleSecondsTimer = null;
			var _idleSecondsCounter = 0;

			document.onclick = function () {
				_idleSecondsCounter = 0;
			};

			document.onmousemove = function () {
				_idleSecondsCounter = 0;
			};

			document.onkeypress = function () {
				_idleSecondsCounter = 0;
			};

			_idleSecondsTimer = window.setInterval(CheckIdleTime, 1000);

			function CheckIdleTime() {
				_idleSecondsCounter++;
				if (_idleSecondsCounter >= IDLE_TIMEOUT) {
					window.clearInterval(_idleSecondsTimer);
					MessageBox.warning("Session Timeout. Kindly Click OK to refresh the page.", {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (sAction) {
							if (sAction === "OK") {
								location.reload();
							}
						}
					});
				}
			}

		}
	});
});