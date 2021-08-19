sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator"
], function (Controller, UIComponent, Fragment, BusyIndicator) {
	"use strict";

	return Controller.extend("com.inc.ZTaskApp.controller.TaskApproval", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.inc.ZTaskApp.view.TaskApproval
		 */
		onInit: function () {
			// var oRouter = this.getRouter();

			// oRouter.getRoute("taskApproval");
			// this.oRouter = this.getOwnerComponent().getRouter();
			// this.oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function (oEvent) {
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			// var reqNmbr = oGlobalModel.getProperty("/currentRequestNumber");
			var reqNmbr = oEvent.getParameters().arguments.reqId;
			var TaskStatus = oGlobalModel.getProperty("/currentTaskStatus");
			var TaskID = oGlobalModel.getProperty("/currentTaskID");
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			var oBaseModel = this.getView().getModel("baseModel");
			this.count = 0;
			if (TaskID === "usertask1") {
				// this.byId("cancelBtnID").setVisible(false);
				oBaseModel.getData().cancelBtnVis = false;
			} else if (TaskID === "usertask2") {
				// this.byId("cancelBtnID").setVisible(true);
				oBaseModel.getData().cancelBtnVis = true;
			}
			if (TaskStatus !== "READY") {
				oBaseModel.getData().acceptBtnVis = false;
				oBaseModel.getData().rejectBtnVis = false;
				oBaseModel.getData().resendBtnVis = false;
				// this.byId("acceptBtnID").setVisible(false);
				// this.byId("rejectBtnID").setVisible(false);
				// this.byId("resendBtnID").setVisible(false);
				oBaseModel.getData().cancelBtnVis = false;
			} else {
				oBaseModel.getData().acceptBtnVis = true;
				oBaseModel.getData().rejectBtnVis = true;
				oBaseModel.getData().resendBtnVis = true;
				// this.byId("acceptBtnID").setVisible(true);
				// this.byId("rejectBtnID").setVisible(true);
				// this.byId("resendBtnID").setVisible(true);
				if (TaskID === "usertask2") {
					oBaseModel.getData().cancelBtnVis = true;
				}
			}
			oBaseModel.refresh();
			var that = this;
			if (reqNmbr) {
				var tableModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(tableModel, "hdrMdl");
				$.ajax({
					url: "VendorReturns/returnsRequest?requestId=" + reqNmbr,
					method: "GET",
					async: true,
					success: function (result, xhr, data) {
						tableModel.setProperty("/results", result);
						for (var i = 0; i < result.returnsItems.length; i++) {
							result.returnsItems[i].actionTaken = false;
						}
						// if (result.returnsItems.length == 1)
						// 	that.byId("resendBtnID").setEnabled(false);
						// else
						// 	that.byId("resendBtnID").setEnabled(true);
					}
				});
			}
		},
		onListItemPressRet: function (oEvent) {
			var tblModel = new sap.ui.model.json.JSONModel();
			var aData = {};
			var obj = oEvent.getSource().getBindingContext("hdrMdl").getObject();
			var oButton = oEvent.getSource();
			Fragment.load({
				name: "com.inc.ZTaskApp.Fragment.ReturnsPopover",
				controller: this
			}).then(function (pPopover) {
				this._oPopover = pPopover;
				this.getView().addDependent(this._oPopover);

				aData = {
					/*"batch": obj.batch,*/
					"grNumber": obj.grNumber,
					"grItem": obj.grItem,
					"plant": obj.plant,
					"poItem": obj.poItem,
					"storgeLocation": obj.storgeLocation,
					"poNumber": obj.poNumber
				};

				tblModel.setData(aData);
				this._oPopover.setModel(tblModel, "tblModel");
				this._oPopover.openBy(oButton);

			}.bind(this));
		},
		onResendChange: function (oEvent) {
			var model = oEvent.getSource().getBindingContext("fragModel");
			var path = model.sPath;
			if (model.getObject().actionTaken == false)
				this.count++;
			model.getObject().actionTaken = true;
			this.getView().getModel("hdrMdl").setProperty(path + "/actionTaken", true);
			if (oEvent.getSource().getSelectedKey() == "SBApproved") {
				this.getView().getModel("hdrMdl").setProperty(path + "/status", "ACCEPTED");
			} else {
				this.getView().getModel("hdrMdl").setProperty(path + "/status", "REJECTED");
			}
		},
		onOK: function () {
			if (this.count == this.getView().getModel("hdrMdl").getData().result.returnsItems.length) {
				var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
				var TaskID = oGlobalModel.getProperty("/currentTaskID");
				var tableModel = this.getView().getModel("hdrMdl");
				var objectIsNew = jQuery.extend({}, tableModel.getData().results);
				objectIsNew.returnsHeader.status = "RESEND";
				if (TaskID === "usertask1") {
					objectIsNew.returnsHeader.statusBy = "VENDOR";
				} else if (TaskID === "usertask2") {
					objectIsNew.returnsHeader.statusBy = "BUYER";
				}

				// for (var i = 0; i < objectIsNew.returnsItems.length; i++) {
				// 	objectIsNew.returnsItems[i].status = "ACCEPTED";
				// }
				objectIsNew.returnsAttachmentList = [];
				BusyIndicator.show(0);
				var that = this;
				$.ajax({
					url: "VendorReturns/action/update",
					method: "POST",
					async: true,
					contentType: 'application/json',
					data: JSON.stringify(objectIsNew),
					success: function (result, xhr, data) {
						BusyIndicator.hide();

						if (!that.actionMsg) {
							that.actionMsg = sap.ui.xmlfragment("com.inc.ZTaskApp.Fragment.ActionMsg", that);
							that.getView().addDependent(that.actionMsg);
							that.actionMsg.addStyleClass("sapUiSizeCompact");
						}
						that.actionMsg.open();

					}
				});
			} else {
				sap.m.MessageToast.show("please take action on all items to proceed");
			}

		},
		onAccept: function () {
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			var TaskID = oGlobalModel.getProperty("/currentTaskID");

			var tableModel = this.getView().getModel("hdrMdl");
			var objectIsNew = jQuery.extend({}, tableModel.getData().results);
			// var oUpdatePayload = {
			// 	"response": {
			//         "status": "Success",
			//         "code": "0",
			//         "message": "Task ACCEPTED Successfully"
			//     },
			//     "returnsDto": {}
			// };

			objectIsNew.returnsHeader.status = "ACCEPTED";
			if (TaskID === "usertask1") {
				objectIsNew.returnsHeader.statusBy = "VENDOR";
			} else if (TaskID === "usertask2") {
				objectIsNew.returnsHeader.statusBy = "BUYER";
			}

			for (var i = 0; i < objectIsNew.returnsItems.length; i++) {
				objectIsNew.returnsItems[i].status = "ACCEPTED";
			}
			objectIsNew.returnsAttachmentList = [];
			BusyIndicator.show(0);
			// oUpdatePayload.returnsDto= objectIsNew;
			var that = this;
			$.ajax({
				url: "VendorReturns/action/update",
				method: "POST",
				async: true,
				contentType: 'application/json',
				data: JSON.stringify(objectIsNew),
				success: function (result, xhr, data) {
					BusyIndicator.hide();
					var responseMsg = result.response.message;
					oGlobalModel.setProperty("/responseMsg", responseMsg);
					// oGlobalModel.setProperty("/updateResponse")
					if (!that.actionMsg) {
						that.actionMsg = sap.ui.xmlfragment("com.inc.ZTaskApp.Fragment.ActionMsg", that);
						that.getView().addDependent(that.actionMsg);
						that.actionMsg.addStyleClass("sapUiSizeCompact");
					}
					that.actionMsg.open();

				}
			});
		},
		mandatoryCheck: function (tableModel) {
			if (tableModel.getData().results.returnsCommentsList.length == 0) {
				sap.m.MessageToast.show("please enter comment to Reject");
				return false;
			}
			return true;
		},
		onReject: function () {
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			var TaskID = oGlobalModel.getProperty("/currentTaskID");
			var tableModel = this.getView().getModel("hdrMdl");
			if (this.mandatoryCheck(tableModel)) {
				var objectIsNew = jQuery.extend({}, tableModel.getData().results);
				objectIsNew.returnsHeader.status = "REJECTED";

				if (TaskID === "usertask1") {
					objectIsNew.returnsHeader.statusBy = "VENDOR";
				} else if (TaskID === "usertask2") {
					objectIsNew.returnsHeader.statusBy = "BUYER";
				}

				// objectIsNew.returnsHeader.statusBy = "VENDOR";
				for (var i = 0; i < objectIsNew.returnsItems.length; i++) {
					objectIsNew.returnsItems[i].status = "REJECTED";
				}
				objectIsNew.returnsAttachmentList = [];
				BusyIndicator.show(0);
				var that = this;
				$.ajax({
					url: "VendorReturns/action/update",
					method: "POST",
					async: true,
					contentType: 'application/json',
					data: JSON.stringify(objectIsNew),
					success: function (result, xhr, data) {
						// sap.m.MessageToast.show("Task Submitted Sucessfully");
						BusyIndicator.hide();
						var responseMsg = result.response.message;
						oGlobalModel.setProperty("/responseMsg", responseMsg);
						if (!that.actionMsg) {
							that.actionMsg = sap.ui.xmlfragment("com.inc.ZTaskApp.Fragment.ActionMsg", that);
							that.getView().addDependent(that.actionMsg);
							that.actionMsg.addStyleClass("sapUiSizeCompact");
						}
						that.actionMsg.open();
					}
				});
			}
		},
		onCancel: function () {
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			// var TaskID = oGlobalModel.getProperty("/currentTaskID");

			var tableModel = this.getView().getModel("hdrMdl");
			var objectIsNew = jQuery.extend({}, tableModel.getData().results);
			objectIsNew.returnsHeader.status = "CANCELLED";
			// if (TaskID === "usertask1") {
			// 	objectIsNew.returnsHeader.statusBy = "VENDOR";
			// } else if (TaskID === "usertask2") {
			objectIsNew.returnsHeader.statusBy = "BUYER";
			// }

			for (var i = 0; i < objectIsNew.returnsItems.length; i++) {
				objectIsNew.returnsItems[i].status = "CANCELLED";
			}
			objectIsNew.returnsAttachmentList = [];
			BusyIndicator.show(0);
			var that = this;
			$.ajax({
				url: "VendorReturns/action/update",
				method: "POST",
				async: true,
				contentType: 'application/json',
				data: JSON.stringify(objectIsNew),
				success: function (result, xhr, data) {
					BusyIndicator.hide();
					var responseMsg = result.response.message;
					oGlobalModel.setProperty("/responseMsg", responseMsg);
					if (!that.actionMsg) {
						that.actionMsg = sap.ui.xmlfragment("com.inc.ZTaskApp.Fragment.ActionMsg", that);
						that.getView().addDependent(that.actionMsg);
						that.actionMsg.addStyleClass("sapUiSizeCompact");
					}
					that.actionMsg.open();

				}
			});
		},
		onPostComment: function (oEvent) {
			var returnModel = this.getView().getModel("hdrMdl");
			var sValue = oEvent.getParameter("value");
			var dDate = new Date();
			var sDate = dDate.getTime();
			if (!returnModel.getData().results.returnsCommentsList) {
				returnModel.getData().results.returnsCommentsList = [];
			}
			//	var cValue = returnModel.getProperty("/inputComment");
			var oComment = {
				"comment": sValue,
				"createdBy": null,
				"createdAt": sDate,
				"updatedBy": null,
				"updatedAt": null,
				"user": null
			};
			var aEntries = returnModel.getData().results.returnsCommentsList;
			aEntries.unshift(oComment);
			returnModel.setProperty("/inputComment", "");
			this.getView().getModel("hdrMdl").refresh();
		},
		fnDeleteComment: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("hdrMdl").getPath();
			var returnModel = this.getView().getModel("hdrMdl");
			var index = sPath.split("/").pop();
			returnModel.getData().returnsCommentsList.splice(index, 1);
			returnModel.refresh();
		},
		onPressRemarks: function () {
			var that = this;
			if (!that.Remark) {
				that.Remark = sap.ui.xmlfragment("com.inc.ZTaskApp.Fragment.Remark", that);
				that.getView().addDependent(that.Remark);
				that.Remark.addStyleClass("sapUiSizeCompact");
			}
			that.Remark.open();
		},
		onResend: function () {
			var tableModel = this.getView().getModel("hdrMdl");
			var objectIsNew = jQuery.extend({}, tableModel.getData().results);
			var fragModel = new sap.ui.model.json.JSONModel();
			fragModel.setData(objectIsNew);
			fragModel.refresh();
			// if (!this.resend) {
				this.resend = sap.ui.xmlfragment("com.inc.ZTaskApp.Fragment.resend", this);
				this.getView().addDependent(this.Remark);
				this.resend.addStyleClass("sapUiSizeCompact");
				this.resend.setModel(tableModel, "fragModel");
			// }
			this.resend.open();
		},
		onCancelFrag: function () {
			this.count = 0;
			for (var i = 0; i < this.getView().getModel("hdrMdl").getData().result.returnsItems.length; i++) {
				this.getView().getModel("hdrMdl").getData().returnsItems[i].actionTaken = false;
			}
			this.resend.close();
		},
		onPressResetRemark: function () {
			this.Remark.close();
		},
		onOKRemark: function () {
			this.Remark.close();
		},
		onCancelRemark: function () {
			this.onPressResetRemark();
			this.Remark.close();
		},
		onOKActionMsg: function () {
			this.actionMsg.close();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("taskScreen");
		},
		onCancelActionMsg: function () {
				this.actionMsg.close();
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.inc.ZTaskApp.view.TaskApproval
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.inc.ZTaskApp.view.TaskApproval
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.inc.ZTaskApp.view.TaskApproval
		 */
		//	onExit: function() {
		//
		//	}

	});

});