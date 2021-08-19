sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.displayPage", {
		onInit: function () {
			this.getView().byId("ObjectPageLayout").setSelectedSection(this.getView().byId("SUMMARY"));
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var sPath = mDraftDetails.getProperty("/Path");
			var aDraftData = mDraftDetails.getProperty(sPath);
			this.getAllDetails();
		},
		getAllDetails: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var sPath = mDraftDetails.getProperty("/Path");
			var aDraftDetails = mDraftDetails.getProperty(sPath);
			var reqId = aDraftDetails.requestId;
			var that = this;
			jQuery
				.ajax({
					url: "InctureApDest/invoiceHeader?requestId=" + reqId,
					type: "GET",
					dataType: "json",
					success: function (result) {
						
						var obj = {
							"PaymentTerms": "N30",
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
							}]
						};
						var invoiceHeader = result.invoiceHeader;
						var invoicebp = [];
						invoicebp.push(result.remitTo);
						var invoicebpBillto = [];
						invoicebpBillto.push(result.billTo);
						mHeaderDetails.setProperty("/invoiceTotal", invoiceHeader.invoiceTotal);
						mHeaderDetails.setProperty("/taxAmount", invoiceHeader.taxAmount);
						mHeaderDetails.setProperty("/selectedCompanyCode", invoiceHeader.compCode);
						mHeaderDetails.setProperty("/invoicetype", invoiceHeader.refDocCat);
						mHeaderDetails.setProperty("/VendorID", invoiceHeader.vendorId);
						mHeaderDetails.setProperty("/SelectedVendorName", invoiceHeader.vendorName);
						mHeaderDetails.setProperty("/type", invoiceHeader.invoiceType);
						mHeaderDetails.setProperty("/invoicebp", invoicebp);
						mHeaderDetails.setProperty("/invoicebpBillto", invoicebpBillto);
						var poNo = result.invoiceHeader.refDocNum.toString();
						mHeaderDetails.setProperty("/poNumber", poNo);
						var mReviewModel = that.getOwnerComponent().getModel("mReviewModel");
						var totalAmount = 0;
						var taxAmount = 0;
						var dueAmount = 0;
						var discount = 0;
						mReviewModel.setProperty("/dueAmount", dueAmount.toFixed(2));
						mReviewModel.setProperty("/discount", discount.toFixed(2));
						var invTotal = mHeaderDetails.getProperty("/invoiceTotal");
						var tAmt = mHeaderDetails.getProperty("/taxAmount");
						if (invTotal) {
							mReviewModel.setProperty("/totalAmount", invTotal);
						} else {
							mReviewModel.setProperty("/totalAmount", totalAmount.toFixed(2));
						}
						if (tAmt) {
							mReviewModel.setProperty("/taxAmount", tAmt);
						} else {
							mReviewModel.setProperty("/taxAmount", taxAmount.toFixed(2));
						}

						if (result.invoiceTaxDetails === null) {
							mHeaderDetails.setProperty("/invoiceTaxDetails", obj.invoiceTaxDetails);
						} else {
							mHeaderDetails.setProperty("/invoiceTaxDetails", result.invoiceTaxDetails);
						}
						mHeaderDetails.setProperty("/invNo", invoiceHeader.extInvNum);
						mHeaderDetails.setProperty("/invDate", invoiceHeader.invoiceDate);
						mHeaderDetails.setProperty("/Purch_Ord", invoiceHeader.refDocNum);
						mHeaderDetails.setProperty("/vendorName", invoiceHeader.vendorName);
						mHeaderDetails.setProperty("/vendorID", invoiceHeader.vendorId);
						var poItemSet = new sap.ui.model.json.JSONModel();
						that.getView().setModel(poItemSet, "poItemSet");
						var d = Date.parse(invoiceHeader.invoiceDate);
						var invDate = new Date(d);
						poItemSet.setProperty("/invDate", invDate);
						if (result.invoiceItems) {
							for (var i = 0; i < result.invoiceItems.length; i++) {
								result.invoiceItems[i].taxCode = "V1";
								if (result.invoiceItems[i].taxAmount) {
									result.invoiceItems[i].taxPer = "10";
									result.invoiceItems[i].taxAmount = (parseFloat(result.invoiceItems[i].poNetPrice) * (parseFloat(result.invoiceItems[i].taxPer) /
										100)).toFixed(2);
								}
							}
						}
						poItemSet.setProperty("/results", result.invoiceItems);

						poItemSet.refresh();

					}
				});
		},
		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("draftInboxView");
		}
	});

});