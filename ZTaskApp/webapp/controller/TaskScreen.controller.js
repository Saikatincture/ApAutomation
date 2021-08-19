sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"sap/m/MessageBox",
	"../utility/formatter"
], function (Controller, UIComponent, JSONModel, CoreLibrary, MessageBox, formatter) {
	"use strict";

	var ValueState = CoreLibrary.ValueState;
	return Controller.extend("com.inc.ZTaskApp.controller.TaskScreen", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.inc.ZTaskApp.view.TaskScreen
		 */
		onInit: function () {
			$("#splash-screen").remove();

			// this.oRouter = this.getOwnerComponent().getRouter();
			// sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			
			
			
			// this.busyDialog = new sap.m.BusyDialog();
			var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			this.getView().setModel(oGlobalModel, "GlobalModel");
			
			
			// oGlobalModel.setProperty("/taskFilter", {});
			// oGlobalModel.getData().taskFilter = {};
			
			// oGlobalModel.setProperty("/taskFilter/status","all");
			
			// oGlobalModel.refresh();
			// this.oRouter = this.getOwnerComponent().getRouter();
			var dataModel = new JSONModel();
			this.getView().setModel(dataModel, "dataModel");
			dataModel.getData().taskFilter = {};
			dataModel.getData().taskFilter.status = "all";
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.getTaskList, this);

			// this.getTaskList();

		},

		// _onRouteMatched: function () {
		// 	var baseModel = new sap.ui.model.json.JSONModel();
		// 	this.getView().setModel(baseModel, "baseModel");
		// 	this.getRetuenRequest();
		// 	this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
		// 	this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
		// 	this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
		// },

		onPressCollapse: function () {
			var oBaseModel = this.getView().getModel("baseModel");
			oBaseModel.getData().openVisiblity = true;
			oBaseModel.getData().CollapseVisiblity = false;
			oBaseModel.getData().SearchVisiblity = false;
			oBaseModel.refresh();
		},

		onPressOpen: function () {
			var oBaseModel = this.getView().getModel("baseModel");
			oBaseModel.getData().openVisiblity = false;
			oBaseModel.getData().CollapseVisiblity = true;
			oBaseModel.getData().SearchVisiblity = true;
			oBaseModel.refresh();
		},

		// getLoggedInUser: function() {
		// 	var url = "SPUserDetails/v1/sayHello";
		// 	var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
		//          this.mloginModel = new sap.ui.model.json.JSONModel();
		//          this.getView().setModel(this.mloginModel, "mloginModel");
		//          jQuery
		//              .ajax({
		//                  url: url,
		//                  type: "GET",
		//                  dataType: "json",
		//                  success: function (result) {
		//                      this.mloginModel.setData(result);
		//                      // oGlobalModel.setProperty("/loggedinUserData", result);

		//                  }
		//              });

		// },

		getTaskList: function () {

			// var userData = this.mloginModel.getData();
			var that =this;
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			var dataModel = this.getView().getModel("dataModel");
			var oBaseModel = this.getView().getModel("baseModel");
			oBaseModel.getData().openVisiblity = false;
			oBaseModel.getData().CollapseVisiblity = true;
			oBaseModel.getData().SearchVisiblity = true;
			oBaseModel.getData().fwdTask = false;
			oBaseModel.getData().cancelTask = false;
			oBaseModel.getData().terminateTask = false;
			oBaseModel.refresh();
			// var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			var url = "SPUserDetails/v1/sayHello";
			 this.oHeader = {
                "Accept": "application/json",
                "Content-Type": "application/json"
            };
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					async: false,
					success: function (result) {
						// mloginModel.setData(result);
						// oGlobalModel.setProperty("/loggedinUserData", result);
						// oGlobalModel.refresh();	
						// var loggenInUserData = oGlobalModel.getProperty("/loggedinUserData");
						// var userEmail = loggenInUserData.email;
						 var userEmail = result.email;
					
						dataModel.setProperty("/taskFilter/recipientUsers", userEmail);
						// oGlobalModel.setProperty("/taskFilter/recipientUsers", userEmail);

						var sUrlTaskList = "VendorReturns/workflow/getTask?recipientUsers=" + userEmail;
						// oGlobalModel.loadData(sUrlTaskList,"", false, "GET", false, false, this.oHeader);
						// oGlobalModel.attachRequestCompleted(function (oEvent) {
						// 		var data = oEvent.getSource().getData();
						// 		if (data.response.status === "Failure") {
						// 			sap.m.MessageToast.show("No task available for this user.");
						// 		} else {
						// 			oGlobalModel.getData().taskListAll = data;
									
						// 			// var taskList= oGlobalModel.getProperty("/taskListAll/workflowTaskDto");
						// 			var taskList = oGlobalModel.getData().taskListAll.workflowTaskDto;
						// 			for (var i = 0; i < taskList.length; i++) {
						// 				var aUser = taskList[i].recipientUsers;
						// 				var userList = [];
						// 				for (var j = 0; j < aUser.length; j++) {
						// 					userList.push({
						// 						"user": aUser[j]
						// 					});
						// 				}
										// oGlobalModel.setProperty("/taskListAll/workflowTaskDto/"+i+"/userList", userList);
							// 			oGlobalModel.getData().taskListAll.workflowTaskDto[i].userList = userList;
							// 			}
							// 	}
							
							// oGlobalModel.refresh();
						// var sUrlTaskList = "VendorReturns/workflow/getTask?recipientUsers=dipanjan.baidya@incture.com";
						$.ajax({
							type: "GET",
							url: sUrlTaskList,
							async: false,
							dataType: "json",
							contentType: "application/json; charset=utf-8",
							error: function (err) {
								// sap.m.MessageToast.show("Destination Failed");
							},
							success: function (data, textStatus, jqXHR) {
							
								if (data.response.status === "Failure") {
									// sap.m.MessageToast.show("No task available for this user.");
								} else {
									dataModel.getData().taskListAll = data;
									
									// var taskList= oGlobalModel.getProperty("/taskListAll/workflowTaskDto");
									var taskList = dataModel.getData().taskListAll.workflowTaskDto;
									for (var i = 0; i < taskList.length; i++) {
										var aUser = taskList[i].recipientUsers;
										var userList = [];
										for (var j = 0; j < aUser.length; j++) {
											userList.push({
												"user": aUser[j]
											});
										}
										// oGlobalModel.setProperty("/taskListAll/workflowTaskDto/"+i+"/userList", userList);
										dataModel.getData().taskListAll.workflowTaskDto[i].userList = userList;
									}
									// oGlobalModel.getData().taskFilter.recipientUsers = userEmail;
						
									dataModel.refresh();
								}
							}
						});
					// });
					}
				});

			// var ototalTaskCount = this.getView().getModel().getProperty("/taskListAll/recordCount");
			// oGlobalModel.setProperty("/totalTaskCount", ototalTaskCount);
		},

		onStatusFilter: function (oEvent) {

			// var oGlobalModel = this.getOwnerComponent().getModel("GlobalModel");
			// this.getView().setModel(oGlobalModel, "GlobalModel");

			var dataModel = this.getView().getModel("dataModel");
			var sKey = oEvent.getParameter("selectedKey");
			// oGlobalModel.setProperty("/taskFilter/subject","");
			// oGlobalModel.setProperty("/taskFilter/workflowDefinitionId","");
			dataModel.getData().taskFilter.subject = "";
			dataModel.getData().taskFilter.workflowDefinitionId = "";
			var sStatusFilterUrl;

			// var userEmail = oGlobalModel.getProperty("/taskFilter/recipientUsers");
			var userEmail = dataModel.getData().taskFilter.recipientUsers;
			// oGlobalModel.setProperty("/taskFilter/status",sKey);
			dataModel.getData().taskFilter.status = sKey;
			dataModel.refresh();
			this.byId("taskTable").setMode("None");
			if (sKey == "all") {

				sStatusFilterUrl = "VendorReturns/workflow/getTask?recipientUsers=" + userEmail;
			} else if (sKey == "ready") {
				this.byId("taskTable").setMode("MultiSelect");
				sStatusFilterUrl = "VendorReturns/workflow/getTask?recipientUsers=" + userEmail + "&status=" + sKey;
			} else {

				sStatusFilterUrl = "VendorReturns/workflow/getTask?recipientUsers=" + userEmail + "&status=" + sKey;
			}
			$.ajax({
				type: "GET",
				url: sStatusFilterUrl,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					// sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data, textStatus, jqXHR) {
					// oGlobalModel.setProperty("/taskListAll", data);
					dataModel.getData().taskListAll = data;
					// var taskList= oGlobalModel.getProperty("/taskListAll/workflowTaskDto");
					var taskList = dataModel.getData().taskListAll.workflowTaskDto;
					for (var i = 0; i < taskList.length; i++) {
						var aUser = taskList[i].recipientUsers;
						var userList = [];
						for (var j = 0; j < aUser.length; j++) {
							userList.push({
								"user": aUser[j]
							});
						}
						// oGlobalModel.setProperty("/taskListAll/workflowTaskDto/"+i+"/userList", userList);
						dataModel.getData().taskListAll.workflowTaskDto[i].userList = userList;
					}
					dataModel.refresh();

				}
			});

		},

		onPressSearchTask: function (oEvent) {
			var that = this;
			sap.ui.core.BusyIndicator.show();
			// that.busyDialog.open();
			// var oGlobalModel = this.getView().getModel("GlobalModel");

			var oFilterModel = this.getView().getModel("dataModel");
			// var oFilterData = oFilterModel.getProperty("/taskFilter");
			var oFilterData = oFilterModel.getData().taskFilter;
			var filterUrl = "VendorReturns/workflow/getTask?";
			if (oFilterData.recipientUsers) {
				filterUrl += "recipientUsers=" + oFilterData.recipientUsers;
			}
			if (oFilterData.workflowDefinitionId) {
				filterUrl += "&workflowDefinitionId=" + oFilterData.workflowDefinitionId;
			}
			if (oFilterData.subject) {
				filterUrl += "&subject=" + oFilterData.subject;
			}
			if (oFilterData.createdFrom && oFilterData.createdUpto) {
				filterUrl += "&createdFrom=" + oFilterData.createdFrom;
				filterUrl += "&createdUpTo=" + oFilterData.createdUpto;
			}
			if (oFilterData.status != "all") {
				filterUrl += "&status=" + oFilterData.status;
			}
			$.ajax({
				type: "GET",
				url: filterUrl,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					// that.busyDialog.close();
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data, textStatus, jqXHR) {
					// oFilterModel.setProperty("/taskListAll", data);
					// that.busyDialog.close();
					sap.ui.core.BusyIndicator.hide();
					if (data.response.status === "Failure") {
						MessageBox.error("No tasks are available for the given input", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								oFilterModel.getData().taskListAll = {};
								oFilterModel.refresh();
							}
						});
					} else {
						oFilterModel.getData().taskListAll = data;
						// var taskList= oFilterModel.getProperty("/taskListAll/workflowTaskDto");
						var taskList = oFilterModel.getData().taskListAll.workflowTaskDto;
						for (var i = 0; i < taskList.length; i++) {
							var aUser = taskList[i].recipientUsers;
							var userList = [];
							for (var j = 0; j < aUser.length; j++) {
								userList.push({
									"user": aUser[j]
								});
							}
							// oFilterModel.setProperty("/taskListAll/workflowTaskDto/"+i+"/userList", userList);
							oFilterModel.getData().taskListAll.workflowTaskDto[i].userList = userList;
						}
						oFilterModel.refresh();
					}
				}

			});

		},

		handleDateRangeChange: function (oEvent) {
			var oFrom = oEvent.getParameters("from");
			var oTo = oEvent.getParameters("to");
			var bValid = oEvent.getParameter("valid");
			var oEventSource = oEvent.getSource();

			if (bValid) {
				oEventSource.setValueState(ValueState.None);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ssZ"
				});
				var dateFrom = dateFormat.format(oFrom.from);
				var dateTo = dateFormat.format(oTo.to);
				var aFrom = dateFrom.split("+");
				var sFrom = aFrom[0] + ".000Z";
				var aTo = dateTo.split("+");
				var sTo = aTo[0] + ".000Z";
				var dataModel = this.getView().getModel("dataModel");
				// oGlobalModel.setProperty("/taskFilter/createdFrom",sFrom);
				// oGlobalModel.setProperty("/taskFilter/createdUpto",sTo);
				dataModel.getData().taskFilter.createdFrom = sFrom;
				dataModel.getData().taskFilter.createdUpto = sTo;
				dataModel.refresh();
			} else {
				oEventSource.setValueState(ValueState.Error);
			}
		},

		// onPressCollapse : function (oEvent) {
		// 	var oPanel = this.byId("expandablePanel");
		// 	oPanel.setExpanded(!oPanel.getExpanded());
		// 	var oCollapseBtn = this.byId("collapseBtn");
		// 	if(oPanel.getExpanded()){
		// 		oCollapseBtn.setText("Collapse Search");
		// 	} else {
		// 		oCollapseBtn.setText("Expand Search");	
		// 	}
		// },

		taskSelect: function () {

			var oBaseModel = this.getView().getModel("baseModel");
			oBaseModel.getData().fwdTask = true;
			oBaseModel.getData().cancelTask = true;
			oBaseModel.getData().terminateTask = true;
			oBaseModel.refresh();
			// this.byId("fwdTaskId").setEnabled(true);
			// this.byId("cancelTaskId").setEnabled(true);
			// this.byId("terminateTaskId").setEnabled(true);
		},

		onPressNavigate: function (oEvent) {
			var oGlobalModdel = this.getView().getModel("GlobalModel");
			var dataModel = this.getView().getModel("dataModel");
			var oRouter = this.getOwnerComponent().getRouter();
			var object = oEvent.getSource().getBindingContext("dataModel").getObject();
			var status = oEvent.getSource().getBindingContext("dataModel").getObject().status;
			var taskID = oEvent.getSource().getBindingContext("dataModel").getObject().activityId;

			oGlobalModdel.setProperty("/currentTaskStatus", status);
			// oGlobalModel.setProperty("/currentRequestNumber",reqNo);
			oGlobalModdel.setProperty("/currentTaskID", taskID);
			if (object.workflowDefinitionId === "VendorApprovalWorkflow") {
				oRouter.navTo("taskVendorApproval", {
					reqId: object.subject
				});
			} else if (object.workflowDefinitionId === "PoConfirmationWorkflow") {
				oRouter.navTo("TaskPOApproval", {
					reqId: object.subject
				});
			} else if (object.workflowDefinitionId === "ap_processworkflow" && status !== "COMPLETED") {
				location.href =
					"https://incture-technologies-hrapps-ap-automation-mta-returnapp1dab219c.cfapps.eu10.hana.ondemand.com/uiinctureAPTest/index.html#/invoiceTask/" +
					object.subject + "$";
			} else if (object.workflowDefinitionId === "ap_processworkflow" && status === "COMPLETED") {
				MessageBox.information("Task has already been COMPLETED.");
			}
			// var reqNo = oEvent.getSource().getBindingContext("GlobalModel").getObject().subject;

			// oRouter.navTo("taskApproval");   
		},

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		onPressResetTask: function () {
			var oFilterModel = this.getView().getModel("dataModel");
			// var dataModel = this.getView().getModel("dataModel");
			// var filterData = oFilterModel.getProperty("/taskFilter");
			var filterData = oFilterModel.getData().taskFilter;
			filterData.workflowDefinitionId = "";
			filterData.requestor = "";
			filterData.recipientUsers = "";
			filterData.subject = "";
			filterData.createdFrom = "";
			filterData.createdUpto = "";
			oFilterModel.refresh();
			this.byId("DateRangeId2").setDateValue(null);
			this.byId("DateRangeId2").setSecondDateValue(null);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.inc.ZTaskApp.view.TaskScreen
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.inc.ZTaskApp.view.TaskScreen
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.inc.ZTaskApp.view.TaskScreen
		 */
		//	onExit: function() {
		//
		//	}

	});

});