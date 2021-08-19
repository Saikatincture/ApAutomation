sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.displayPOdetails", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("displayPOdetails").attachPatternMatched(this._onObjectMatched, this);
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			var mHistoryDetails = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV");
			this.getView().setModel(mHistoryDetails, "mHistoryDetails");
		},
		handleIconTabSelectChangeSelection: function (oEvent) {
			var mPropertyModel = this.getView().getModel("mPropertyModel");
			var selectedKey = oEvent.getSource().getProperty("selectedKey");
			if (selectedKey) {
				if (selectedKey === "POKey") {
					mPropertyModel.setProperty("/selectedIconTab", selectedKey);
				} else {
					mPropertyModel.setProperty("/selectedIconTab", selectedKey);
				}
			}
		},

		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrder");
		},
		_onObjectMatched: function (oEvent) {
			
			this.getView().byId("ObjectPageLayout").setSelectedSection(this.getView().byId("InvoiceInfo"));
			var obj = {
				"selectedIconTab": "summary"
			};
			var mPropertyModel = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(mPropertyModel, "mPropertyModel");
			mPropertyModel.setProperty("/selectedIconTab", obj.selectedIconTab);
			var that = this;
			var data = this.getView().getModel("selectedObject").getData();
			var poHeaderSet = new sap.ui.model.json.JSONModel({
				"results": data
			});
			this.getView().setModel(poHeaderSet, "poHeaderSet");
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			oPODetailModel.read("/L_EKKOSet('" + data.Purch_Ord + "')/HeadToItem", {
				async: false,
				success: function (oData, oResponse) {
					busyDialog.close();
					
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].taxCode = "V1";
						oData.results[i].taxPer = "10";
						oData.results[i].taxAmount = (parseFloat(oData.results[i].Net_Value) * (parseFloat(oData.results[i].taxPer) / 100)).toFixed(2);
					}
					var poItemSet = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(poItemSet, "poItemSet");

					var mReviewModel = that.getOwnerComponent().getModel("mReviewModel");
					var totalAmount = 0;
					var taxAmount = 0;
					var dueAmount = 0;
					mReviewModel.setProperty("/totalAmount", totalAmount.toFixed(2));
					mReviewModel.setProperty("/dueAmount", dueAmount.toFixed(2));
					mReviewModel.setProperty("/taxAmount", taxAmount.toFixed(2));
					var date = new Date();
					var mon = date.getMonth() + 1;
					var dDate = date.getDate();
					var year = date.getFullYear();
					var currentDate = year + "-" + mon + "-" + dDate;
					poItemSet.setProperty("/invDate", currentDate);
				},
				error: function (error) {
					busyDialog.close();
					var errorMsg = JSON.parse(error.responseText);
					errorMsg = errorMsg.error.message.value;
					that.errorMsg(errorMsg);
				}
			});

			oPODetailModel.read("/L_EKKOSet('" + data.Purch_Ord + "')/HeadToCond", {
				async: false,
				success: function (oData, oResponse) {
					var mconditionModel = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(mconditionModel, "mconditionModel");
				},
				error: function (error) {
					var errorMsg = JSON.parse(error.responseText);
					errorMsg = errorMsg.error.message.value;
					that.errorMsg(errorMsg);
				}
			});
			/*	
				var mHistoryModel = this.getView().getModel("mHistoryModel");
				mHistoryModel.read("/Header_DataSet", {
					urlParameters: "?$filter=Purchaseorder eq'" + data.Purch_Ord +
						"'&$expand=HTH,HTI/ITA,HTHIS,HTHT,HTSCH,HTR,HTA&$format=json",
					success: function (oData) {
						
						var mHistoryDetails = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(mHistoryDetails, "mHistoryDetails");
					},
					error: function (oError) {
						var errorMsg = JSON.parse(oError.responseText);
						errorMsg = errorMsg.error.message.value;
						that.errorMsg(errorMsg);
					}
				});*/

			this.getPOHistory();
		},
		getPOHistory: function () {

			var data = this.getView().getModel("selectedObject").getData();
			var mHistoryDetails = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mHistoryDetails, "mHistoryDetails");
			var url =
				"DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV/Header_DataSet?$filter=Purchaseorder eq '" + data.Purch_Ord +
				"'&$expand=HTH,HTI/ITA,HTHIS,HTHT,HTSCH,HTR,HTA&$format=json";
			mHistoryDetails.loadData(url, null, true);
			mHistoryDetails.attachRequestCompleted(null, function () {
				mHistoryDetails.refresh();
			});

			/*	var mHistoryDetails = this.getView().getModel("mHistoryDetails");
				mHistoryDetails.read("/Header_DataSet", {
					urlParameters: "$filter=Purchaseorder eq '4500000093'&$expand=HTH,HTI/ITA,HTHIS,HTHT,HTSCH,HTR,HTA&$format=json",
					success: function (oData) {
						
					},
					error: function (oError) {

					}
				});*/
		},
		onPressMatcode: function (oEvent) {
			var oButton = oEvent.getSource();
			var poItemSet = this.getView().getModel("poItemSet");
			var sPath = oEvent.getSource().getBindingContext("poItemSet").getPath();
			var selectedObject = poItemSet.getProperty(sPath);
			var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/MaterialDetailsSet?$filter=Material eq '" + selectedObject.Material +
				"'&$format=json";
			var that = this;
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						var matModel = new sap.ui.model.json.JSONModel();
						that.getView().setModel(matModel, "matModel");
						matModel.setProperty("/results", result.d.results);
						that.viewMatDetails = sap.ui.xmlfragment("viewMatDetails", "com.incture.CreateEInvoice.Fragments.viewMatDetails", that);
						that.viewMatDetails.setModel(matModel);
						that.getView().addDependent(that.viewMatDetails);
						that.viewMatDetails.openBy(oButton);
					},
					error: function (err) {
						sap.m.MessageToast.show(err.statusText);
					}
				});
		},
		onCloseviewMatDetails: function () {
			this.viewMatDetails.close();
		}
	});

});