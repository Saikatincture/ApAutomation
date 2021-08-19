sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("incture.com.APCreateInvoice.controller.reviewPage", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var mattachmentModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mattachmentModel, "mattachmentModel");
		},
		openBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.open();
			} else {
				this._BusyDialog = new sap.m.BusyDialog({
					busyIndicatorDelay: 0
				});
				this._BusyDialog.open();
			}
		},
		closeBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.close();
			}
		},
		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("invoiceCreate");
		},
		onSaveasDraft: function () {

			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			//var mattachmentModel = this.getView().getModel("mattachmentModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			//var aShippingHandeling = mHeaderDetailsData.shippingHandling;
			var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
			var ainvoiceOverheadCharges = mHeaderDetailsData.invoiceOverheadCharges;
			var aRemitTo = mHeaderDetailsData.invoicebp[0];
			var aBillTo = mHeaderDetailsData.invoicebpBillto[0];
			var mReviewModelData = mReviewModel.getData();
			var currentDate = Date.now();
			var obj = {
				"vendorName": mHeaderDetailsData.vendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": currentDate,
				"vendorId": mReviewModelData.VendorID,
				"clerkId": null,
				"compCode": mHeaderDetailsData.selectedCompanyCode,
				"refDocNum": mHeaderDetailsData.Purch_Ord,
				"clerkEmail": "shirishasb@incture.com",
				"channelType": "E-Invoice",
				"refDocCat": mHeaderDetailsData.invoicetype,
				"invoiceType": mHeaderDetailsData.type,
				"grossAmount": mReviewModelData.totalAmount,
				"discount": null,
				"invoiceTotal": mReviewModelData.totalAmount,
				"sapInvoiceNumber": 0,
				"fiscalYear": null,
				"currency": "EUR",
				"paymentTerms": null,
				"taxAmount": "0.000",
				"shippingCost": 0.0,
				"lifecycleStatus": "00",
				"lifecycleStatusText": "DRAFT",
				"taskStatus": null,
				"version": null,
				"emailFrom": null,
				"balance": "0.000",
				"reasonForRejection": null,
				"rejectionText": "",
				"exceptionMessage": null,
				"createdByInDb": "saikat.bhowmick@incture.com",
				"createdAtInDB": currentDate,
				"updatedBy": null,
				"updatedAt": null,
				"accountNumber": null,
				"postingDate": currentDate,
				"assignedTo": "MARLENE",
				"disAmt": null,
				"deposit": null,
				"invoiceItems": [],
				"costAllocation": null,
				"commentDto": mReviewModelData.commentDto,
				"workflowResponse": null,
				"errorMsgesOnSAPPosting": null,
				"attachments": mReviewModelData.docManagerDto,
				"invoiceOverheadCharges": ainvoiceOverheadCharges,
				"invoiceTaxDetails": ainvoiceTaxDetails,
				"remitTo": {
					"partnerRole": "",
					"partnerName": "",
					"postalCode": aRemitTo.postalCode,
					"city": aRemitTo.city,
					"street": aRemitTo.street,
					"country": aRemitTo.country,
					"partnerNo": "",
					"telephone": aRemitTo.telephone
				},
				"billTo": {
					"partnerRole": "",
					"partnerName": "",
					"postalCode": aBillTo.postalCode,
					"city": aBillTo.city,
					"street": aBillTo.street,
					"country": aBillTo.country,
					"partnerNo": "",
					"telephone": aBillTo.telephone
				},
				"screenVariantForCADtoList": null
			};
			var invItemList = {};
			for (var i = 0; i < poItemData.length; i++) {
				invItemList = {
					"itemId": poItemData[i].Item,
					"itemLifeCycleStatus": "00",
					"itemLifeCycleStatusText": "DRAFT",
					"itemCode": poItemData[i].Material,
					"itemText": poItemData[i].Decription,
					//"shortText": poItemData[i].Material,
					"extItemId": "",
					"customerItemID": "0",
					"invQty": parseInt(poItemData[i].Quantity),
					"qtyUom": poItemData[i].Unit,
					"price": parseInt(poItemData[i].Net_Price),
					"currency": "EUR",
					"pricingUnit": null,
					"unit": null,
					"disAmt": null,
					"disPer": null,
					"deposit": null,
					"shippingAmt": null,
					"shippingPer": null,
					"taxAmt": null,
					"taxPer": null,
					"netWorth": parseInt(poItemData[i].Net_Value),
					"itemComment": null,
					"isTwowayMatched": false,
					"isThreewayMatched": false,
					"matchDocNum": "",
					"matchDocItem": "",
					"matchParam": null,
					"unusedField1": null,
					"unusedField2": null,
					"createdByInDb": "saikat.bhowmick@incture.com",
					"createdAtInDB": currentDate,
					"updatedBy": null,
					"updatedAt": null,
					"isSelected": false,
					"refDocCat": null,
					"refDocNum": poItemData[i].Purch_Ord,
					"threeWayMessae": null,
					"isThreewayQtyIssue": null,
					"isThreewayPriceIssue": null,
					"poAvlQtyOPU": null,
					"poAvlQtyOU": 0.00,
					"poAvlQtySKU": null,
					"unitPriceOPU": parseInt(poItemData[i].Net_Price),
					"unitPriceOU": null,
					"unitPriceSKU": null,
					"poNetPrice": parseInt(poItemData[i].Net_Value),
					"poTaxCode": "",
					"poTaxPer": null,
					"poTaxValue": null,
					"poMaterialNum": "",
					"poVendMat": "",
					"poUPC": null,
					"matchedBy": "Not Matched",
					"amountDifference": "",
					"isDeleted": false,
					"isAccAssigned": "",
					"invItemAcctDtoList": [],
					"excpetionMessage": null,
					"invoiceUPCCode": ""
				};
				obj.invoiceItems.push(invItemList);
			}

			var url = "InctureApDest/eInvoice/createEInvoice";
			var that = this;
			that.openBusyDialog();
			jQuery.ajax({
				type: "POST",
				contentType: "application/json",
				url: url,
				dataType: "json",
				data: JSON.stringify(obj),
				async: true,
				success: function (data, textStatus, jqXHR) {
					that.closeBusyDialog();
					var aEmpty = [];
					mHeaderDetails.setProperty("/invoiceTaxDetails", aEmpty);
					mHeaderDetails.setProperty("/invoiceOverheadCharges", aEmpty);
					mHeaderDetails.setProperty("/shippingHandling", aEmpty);
					mHeaderDetails.setProperty("/selectedCompanyCode", "");
					mHeaderDetails.setProperty("/docManagerDto", aEmpty);
					mHeaderDetails.setProperty("/commentDto", aEmpty);
					var message = data.message;

					if (data.status === "Success") {
						sap.m.MessageBox.success(message, {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								that.oRouter.navTo("purchaseOrder");
							}
						});
					} else {
						sap.m.MessageBox.information(message, {
							actions: [sap.m.MessageBox.Action.OK]
						});
					}
				}
			});
		},
		onSubmit: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			//var mattachmentModel = this.getView().getModel("mattachmentModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			//var aShippingHandeling = mHeaderDetailsData.shippingHandling;
			var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
			var ainvoiceOverheadCharges = mHeaderDetailsData.invoiceOverheadCharges;
			var aRemitTo = mHeaderDetailsData.invoicebp[0];
			var aBillTo = mHeaderDetailsData.invoicebpBillto[0];
			var mReviewModelData = mReviewModel.getData();
			var currentDate = Date.now();
			var obj = {
				"vendorName": mHeaderDetailsData.vendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": currentDate,
				"vendorId": mHeaderDetailsData.VendorID,
				"clerkId": null,
				"compCode": mHeaderDetailsData.selectedCompanyCode,
				"refDocNum": mHeaderDetailsData.Purch_Ord,
				"clerkEmail": "shirishasb@incture.com",
				"channelType": "E-Invoice",
				"refDocCat": mHeaderDetailsData.invoicetype,
				"invoiceType": mHeaderDetailsData.type,
				"grossAmount": mReviewModelData.totalAmount,
				"discount": null,
				"invoiceTotal": mReviewModelData.totalAmount,
				"sapInvoiceNumber": 0,
				"fiscalYear": null,
				"currency": "EUR",
				"paymentTerms": null,
				"taxAmount": "0.000",
				"shippingCost": 0.0,
				"lifecycleStatus": "01",
				"lifecycleStatusText": "Open",
				"taskStatus": null,
				"version": null,
				"emailFrom": null,
				"balance": "0.000",
				"reasonForRejection": null,
				"rejectionText": "",
				"exceptionMessage": null,
				"createdByInDb": "saikat.bhowmick@incture.com",
				"createdAtInDB": currentDate,
				"updatedBy": null,
				"updatedAt": null,
				"accountNumber": null,
				"postingDate": currentDate,
				"assignedTo": "MARLENE",
				"disAmt": null,
				"deposit": null,
				"invoiceItems": [],
				"costAllocation": null,
				"commentDto": mReviewModelData.commentDto,
				"workflowResponse": null,
				"errorMsgesOnSAPPosting": null,
				"attachments": mReviewModelData.docManagerDto,
				"invoiceOverheadCharges": ainvoiceOverheadCharges,
				"invoiceTaxDetails": ainvoiceTaxDetails,
				"remitTo": {
					"partnerRole": "",
					"partnerName": "",
					"postalCode": aRemitTo.postalCode,
					"city": aRemitTo.city,
					"street": aRemitTo.street,
					"country": aRemitTo.country,
					"partnerNo": "",
					"telephone": aRemitTo.telephone
				},
				"billTo": {
					"partnerRole": "",
					"partnerName": "",
					"postalCode": aBillTo.postalCode,
					"city": aBillTo.city,
					"street": aBillTo.street,
					"country": aBillTo.country,
					"partnerNo": "",
					"telephone": aBillTo.telephone
				},
				"screenVariantForCADtoList": null
			};
			var invItemList = {};
			for (var i = 0; i < poItemData.length; i++) {
				invItemList = {
					"itemId": poItemData[i].Item,
					"itemLifeCycleStatus": "01",
					"itemLifeCycleStatusText": "Open",
					"itemCode": poItemData[i].Material,
					"itemText": poItemData[i].Material,
					"shortText": poItemData[i].Material,
					"extItemId": "",
					"customerItemID": "0",
					"invQty": parseInt(poItemData[i].Quantity),
					"qtyUom": poItemData[i].Unit,
					"price": parseInt(poItemData[i].Net_Price),
					"currency": "EUR",
					"pricingUnit": null,
					"unit": null,
					"disAmt": null,
					"disPer": null,
					"deposit": null,
					"shippingAmt": null,
					"shippingPer": null,
					"taxAmt": null,
					"taxPer": null,
					"netWorth": parseInt(poItemData[i].Net_Value),
					"itemComment": null,
					"isTwowayMatched": true,
					"isThreewayMatched": false,
					"matchDocNum": "",
					"matchDocItem": "",
					"matchParam": poItemData[i].Decription,
					"unusedField1": null,
					"unusedField2": null,
					"createdByInDb": "saikat.bhowmick@incture.com",
					"createdAtInDB": currentDate,
					"updatedBy": null,
					"updatedAt": null,
					"isSelected": true,
					"refDocCat": null,
					"refDocNum": poItemData[i].Purch_Ord,
					"threeWayMessae": null,
					"isThreewayQtyIssue": null,
					"isThreewayPriceIssue": null,
					"poAvlQtyOPU": null,
					"poAvlQtyOU": 0.00,
					"poAvlQtySKU": null,
					"unitPriceOPU": parseInt(poItemData[i].Net_Price),
					"unitPriceOU": null,
					"unitPriceSKU": null,
					"poNetPrice": parseInt(poItemData[i].Net_Value),
					"poTaxCode": "",
					"poTaxPer": null,
					"poTaxValue": null,
					"poMaterialNum": poItemData[i].Material,
					"poVendMat": "",
					"poUPC": null,
					"matchedBy": "System",
					"amountDifference": "",
					"isDeleted": false,
					"isAccAssigned": "",
					"invItemAcctDtoList": [],
					"excpetionMessage": null,
					"invoiceUPCCode": ""
				};
				obj.invoiceItems.push(invItemList);
			}

			var url = "InctureApDest/eInvoice/createEInvoice";
			var that = this;
			that.openBusyDialog();
			jQuery.ajax({
				type: "POST",
				contentType: "application/json",
				url: url,
				dataType: "json",
				data: JSON.stringify(obj),
				async: true,
				success: function (data, textStatus, jqXHR) {
					that.closeBusyDialog();
					var aEmpty = [];
					mHeaderDetails.setProperty("/invoiceTaxDetails", aEmpty);
					mHeaderDetails.setProperty("/invoiceOverheadCharges", aEmpty);
					mHeaderDetails.setProperty("/shippingHandling", aEmpty);
					mHeaderDetails.setProperty("/selectedCompanyCode", "");
					mHeaderDetails.setProperty("/docManagerDto", aEmpty);
					mHeaderDetails.setProperty("/commentDto", aEmpty);
					var message = data.message;
					if (data.status === "Success") {
						sap.m.MessageBox.success(message, {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								that.oRouter.navTo("purchaseOrder");
							}
						});
					} else {
						sap.m.MessageBox.information(message, {
							actions: [sap.m.MessageBox.Action.OK]
						});
					}
				}
			});
		}
	});

});