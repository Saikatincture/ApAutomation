sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (Controller, Fragment, MessageBox) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.multiPOinvoicecreate", {
		onInit: function () {
			this.getView().byId("ObjectPageLayout").setSelectedSection(this.getView().byId("InvoiceInfo"));
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("multiPOinvoicecreate").attachPatternMatched(this._onObjectMatched, this);
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			var mpostModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mpostModel, "mpostModel");
			var mattachmentModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mattachmentModel, "mattachmentModel");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var obj = {
				"PaymentTerms": "N30",
				"shippingHandling": [{
					"companyShipToAddress": "",
					"description": "",
					"company": "",
					"partnerCode": ""
				}],
				"invoiceTaxDetails": [{
					"taxJurisdiction": "",
					"taxCode": "",
					"currencyOfCode": "Dollars",
					"shipTo": "",
					"purClassification": "",
					"shipFrom": "",
					"vatAmount": "",
					"vatRate": "",
					"taxPer": ""
				}],
				"invoiceOverheadCharges": [{
					"overheadCostCategory": "",
					"description": "",
					"amount": "",
					"spendCategory": "",
					"purchaseClass": "",
					"shipTo": "",
					"shipFrom": ""
				}]
			};
			mHeaderDetails.setProperty("/PaymentTerms", obj.PaymentTerms);
			mHeaderDetails.setProperty("/shippingHandling", obj.shippingHandling);
			mHeaderDetails.setProperty("/invoiceTaxDetails", obj.invoiceTaxDetails);
			mHeaderDetails.setProperty("/invoiceOverheadCharges", obj.invoiceOverheadCharges);
			this.getLoggedInUser();
		},
		getLoggedInUser: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var url = "SPUserDetails/v1/sayHello";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						mHeaderDetails.setProperty("/loggedinUserData", result);
					}
				});
		},
		_onObjectMatched: function (oEvent) {
			
			this.getView().byId("ObjectPageLayout").setSelectedSection(this.getView().byId("InvoiceInfo"));
			var that = this;
			var data = this.getView().getModel("selectedObject").getData();
			var poHeaderSet = new sap.ui.model.json.JSONModel({
				"results": aselectedItems
			});
			this.getView().setModel(poHeaderSet, "poHeaderSet");
			var aResults = poHeaderSet.getProperty("/results");
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			/*	oPODetailModel.read("/L_EKKOSet('" + data.Purch_Ord + "')/HeadToItem", {*/
			for (var t = 0; t < aResults.length; t++) {
				oPODetailModel.read("/Header_DataSet", {
					urlParameters: "$filter=Purchaseorder eq'" + data.Purch_Ord +
						"'&$expand=HTH,HTI/ITA,HTI/ITS,HTI/ITP,HTHIS,HTHT,HTSCH,HTA,HTP,HTR",
					//async: false,
					success: function (oData, oResponse) {
						busyDialog.close();
						var mHeaderDetails = that.getOwnerComponent().getModel("mHeaderDetails");
						var arr = oData.results[0].HTP.results[0];
						mHeaderDetails.setProperty("/invoicebpcity", arr.city);
						mHeaderDetails.setProperty("/invoicebpcountry", arr.country);
						mHeaderDetails.setProperty("/invoicebppostalCode", arr.postalCode);
						mHeaderDetails.setProperty("/invoicebpstreet", arr.street);
						mHeaderDetails.setProperty("/invoicebppartnerName", arr.partnerName);
						var billToarr = oData.results[0].HTP.results[1];
						mHeaderDetails.setProperty("/billtocity", billToarr.city);
						mHeaderDetails.setProperty("/billtocountry", billToarr.country);
						mHeaderDetails.setProperty("/billtopostalCode", billToarr.postalCode);
						mHeaderDetails.setProperty("/billtostreet", billToarr.street);
						mHeaderDetails.setProperty("/billtopartnerName", billToarr.partnerName);
						oData.totalNetvalue = 0;
						for (var i = 0; i < oData.results[0].HTI.results.length; i++) {
							oData.results[0].HTI.results[i].taxCode = "V1";
							oData.results[0].HTI.results[i].taxPer = "10";
							oData.results[0].HTI.results[i].NetPrice = (parseFloat(oData.results[0].HTI.results[i].NetPrice)).toFixed(2);
							oData.results[0].HTI.results[i].taxAmount = (parseFloat(oData.results[0].HTI.results[i].NetPrice) * (parseFloat(oData.results[
									0].HTI.results[i].taxPer) /
								100)).toFixed(
								2);
							oData.totalNetvalue += Number(oData.results[0].HTI.results[i].netWorth);
						}
						var poItemSet = new sap.ui.model.json.JSONModel({
							"results": oData.results[0].HTI.results
						});
						that.getView().setModel(poItemSet, "poItemSet");
						poItemSet.setProperty("/totalNetvalue", oData.totalNetvalue);
						var ainvoiceTaxDetails = mHeaderDetails.getProperty("/invoiceTaxDetails");
						if (ainvoiceTaxDetails.length > 0) {
							for (var j = 0; j < ainvoiceTaxDetails.length; j++) {
								var taxPer = "10";
								var totalNetvalue = poItemSet.getProperty("/totalNetvalue");
								var taxAmount = (parseFloat(totalNetvalue) * (parseFloat(taxPer) / 100)).toFixed(
									2);
								mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxPer", taxPer);
								mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxAmount", taxAmount);
								mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/shipTo", billToarr.city);
								mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/shipFrom", arr.city);
								mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxableAmount", totalNetvalue);
							}
						}
						var mReviewModel = that.getOwnerComponent().getModel("mReviewModel");
						var totalAmount = 0;
						var taxAmount = 0;
						var dueAmount = 0;
						var discount = 0;
						mReviewModel.setProperty("/totalAmount", totalAmount.toFixed(2));
						mReviewModel.setProperty("/dueAmount",
							dueAmount.toFixed(2));
						mReviewModel.setProperty("/discount", discount.toFixed(2));
						mReviewModel.setProperty("/taxAmount",
							taxAmount.toFixed(2));
						var date = new Date();
						var mon = date.getMonth() + 1;
						var dDate = date.getDate();
						var year = date.getFullYear();
						if (mon.toString().length < 2) {
							mon = "0" + mon.toString();
						}
						if (dDate.toString().length < 2) {
							dDate = "0" + dDate.toString();
						}
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
			}
		}
	});
});