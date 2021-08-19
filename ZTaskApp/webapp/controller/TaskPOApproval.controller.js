sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox"
], function (Controller, JSONModel, BusyIndicator, MessageBox) {
	"use strict";

	return Controller.extend("com.inc.ZTaskApp.controller.TaskPOApproval", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.inc.ZTaskApp.view.TaskPOApproval
		 */
		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getRoute("TaskList").attachPatternMatched(this.onRouteMatched, this);
			this.oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
			this.busyDialog = new sap.m.BusyDialog();
		},

		onRouteMatched: function (oEvent) {
			var oPOConfirmModel = new JSONModel();
			this.getView().setModel(oPOConfirmModel, "oPOConfirmModel");
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			var reqNmbr = oEvent.getParameters().arguments.reqId;
			var TaskStatus = oGlobalModel.getProperty("/currentTaskStatus");
			var TaskID = oGlobalModel.getProperty("/currentTaskID");
			this.count = 0;
			if (TaskID === "usertask1") {
				this.byId("cancelBtnID").setVisible(false);
			} else if (TaskID === "usertask2") {
				this.byId("cancelBtnID").setVisible(true);
			}
			if (TaskStatus !== "READY") {
				this.byId("acceptBtnID").setVisible(false);
				this.byId("rejectBtnID").setVisible(false);
				// this.byId("resendBtnID").setVisible(false);
				this.byId("cancelBtnID").setVisible(false);
			} else {
				this.byId("acceptBtnID").setVisible(true);
				this.byId("rejectBtnID").setVisible(true);
				// this.byId("resendBtnID").setVisible(true);
				if (TaskID === "usertask2") {
					this.byId("cancelBtnID").setVisible(true);
				}
			}
			var that = this;
			// this.busyDialog.open();
			if (reqNmbr) {
				var tableModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(tableModel, "hdrMdl");
				$.ajax({
					url: "InctureApDest/poConfirmation/getbyConfirmationNo/" + reqNmbr,
					method: "GET",
					async: true,
					success: function (result, xhr, data) {
						// that.busyDialog.close();
						var oPOConfirmModel = that.getView().getModel("oPOConfirmModel");
						// if(result.poConfirmationItems) {
						oPOConfirmModel.setProperty("/poConfirmationItems", result.poConfirmationItems);
						oPOConfirmModel.setProperty("/purchaseHeader", result.purchaseHeader);
						oPOConfirmModel.setProperty("/purchaseItemList", result.purchaseItemList);
						if (result.poConfirmationItems.length) {
							oPOConfirmModel.setProperty("/confirmationSerialNo", result.poConfirmationItems[0].confirmationSerialNo);
						}
						if (result.purchaseHeader.comment) {
							oPOConfirmModel.setProperty("/commentsVisible", true);
						} else {
							oPOConfirmModel.setProperty("/commentsVisible", false);
						}

						if (result.poConfirmationItems) {
							for (var i = 0; i < result.poConfirmationItems.length; i++) {
								if (result.poConfirmationItems[i].confirmationStatus.toUpperCase() === "ACCEPT") {
									oPOConfirmModel.setProperty("/poConfirmationItems/" + i + "/sHighLight", "Success");
								} else if (result.poConfirmationItems[i].confirmationStatus.toUpperCase() === "REJECT") {
									oPOConfirmModel.setProperty("/poConfirmationItems/" + i + "/sHighLight", "Error");
								}
							}
						}
						oPOConfirmModel.refresh();
					},
					error: function (err) {
						sap.m.MessageToast.show("Destination Failed");
					}
				});
			}
		},

		onAccept: function () {
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			var TaskID = oGlobalModel.getProperty("/currentTaskID");
			var payloadObj = [];
			var oPOConfirmModel = this.getView().getModel("oPOConfirmModel");
			var poConfirmationItems = oPOConfirmModel.getData().poConfirmationItems;
			var objectIsNew = jQuery.extend([], oPOConfirmModel.getData().poConfirmationItems);

			for (var i = 0; i < objectIsNew.length; i++) {
				if(!objectIsNew[i].promisedDeliveryDate){
					objectIsNew[i].promisedDeliveryDate = new Date("9999-12-31T00:00:00").getTime();
				}
				objectIsNew[i].Unit = objectIsNew[i].uom;
				delete objectIsNew[i].sHighLight;
				delete objectIsNew[i].actions;
				delete objectIsNew[i].Unit;
			}
			payloadObj = {
				"actionStatus": "Accept",
				"purchaseHeader": oPOConfirmModel.getData().purchaseHeader,
				"poConfirmationItemList": objectIsNew
			};
			this.busyDialog.open();
			var that = this;
			$.ajax({
				url: "InctureApDest/poConfirmation/postPoConfirmationToSAP",
				method: "POST",
				async: true,
				contentType: 'application/json',
				data: JSON.stringify(payloadObj),
				success: function (result, xhr, data) {
					// BusyIndicator.hide();
					// var PONumber = that.getView().getModel("oPOConfirmModel").getData().purchaseHeader.documentNumber;
					that.busyDialog.close();
					if (result.status === "Failed") {
						var msg = result.message;
						MessageBox.error(msg);
					} else {
						var msg = "Confirmation submitted successfully";
						MessageBox.success(msg, {
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === MessageBox.Action.OK) {
									that.oRouter.navTo("taskScreen");
								}
							}.bind(this)
						});
					}
				},
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				}
			});
		},

		onDialogPOReject: function () {
			var sMessageBoxType = "warning";
			var sMessage = "Are you sure you want to reject?";
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this.onReject();
					}
					if (oAction === MessageBox.Action.NO) {

					}
				}.bind(this)
			});
		},

		onPressRejectTask: function (oEvent) {
			if (!this.oRejectPODialog) {
				this.oRejectPODialog = new sap.m.Dialog({
					title: "Reject",
					type: sap.m.DialogType.Message,
					content: [
						new sap.m.Label({
							text: "Do you want to reject this Task?",
							labelFor: "rejectionNote"
						}),
						new sap.m.TextArea("rejectionNote", {
							width: "100%",
							placeholder: "Add note (optional)",
							liveChange: function (oEvent) {
								var rejectionNote = oEvent.getParameter("value");
								this.oRejectPODialog.getBeginButton().setEnabled(rejectionNote.length > 0);
								this.getView().getModel("oPOConfirmModel").setProperty("/rejectionNote", rejectionNote);
							}.bind(this)
						})
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Reject",
						enabled: false,
						press: function () {
							// var rejectionNote = sap.ui.core.Core.byId("rejectionNote").getValue();
							// sap.m.MessageToast.show("Note is: " + sText);

							this.oRejectPODialog.close();
							this.onReject();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function () {
							this.oRejectPODialog.close();
						}.bind(this)
					})
				});
			}

			this.oRejectPODialog.open();
		},

		onReject: function () {
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			var TaskID = oGlobalModel.getProperty("/currentTaskID");
			var payloadObj = [];
			var oPOConfirmModel = this.getView().getModel("oPOConfirmModel");
			var poConfirmationItems = oPOConfirmModel.getData().poConfirmationItems;
			var objectIsNew = jQuery.extend([], oPOConfirmModel.getData().poConfirmationItems);
			var rejectionNote = this.getView().getModel("oPOConfirmModel").getProperty("/rejectionNote");
			for (var i = 0; i < objectIsNew.length; i++) {
				if(!objectIsNew[i].promisedDeliveryDate){
					objectIsNew[i].promisedDeliveryDate = new Date("9999-12-31T00:00:00").getTime();
				}
				objectIsNew[i].Unit = objectIsNew[i].uom;
				delete objectIsNew[i].sHighLight;
				delete objectIsNew[i].actions;
				delete objectIsNew[i].Unit;
			}

			payloadObj = {
				"actionStatus": "Reject",
				"purchaseHeader": oPOConfirmModel.getData().purchaseHeader,
				"poConfirmationItemList": objectIsNew
			};
			payloadObj.purchaseHeader.comment = rejectionNote;
			this.busyDialog.open();
			var that = this;
			$.ajax({
				url: "InctureApDest/poConfirmation/postPoConfirmationToSAP",
				method: "POST",
				async: true,
				contentType: 'application/json',
				data: JSON.stringify(payloadObj),
				success: function (result, xhr, data) {
					// BusyIndicator.hide();
					var msg = result.message; // "Workflow Updated Succesfully"
					that.busyDialog.close();
					// var msg = " Posted successfully to ECC";
					MessageBox.success(msg, {
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === MessageBox.Action.OK) {
								that.oRouter.navTo("taskScreen");
							}
						}.bind(this)
					});

				},
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				}
			});
		},

		onNavBack: function () {
			this.oRouter.navTo("taskScreen");
		}

	});

});