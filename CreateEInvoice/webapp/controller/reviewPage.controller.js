sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.previewPage", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var mattachmentModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mattachmentModel, "mattachmentModel");
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
			oRouter.navTo("createEInvoice");
		},
		onSaveasDraft: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
			var ainvoiceOverheadCharges = mHeaderDetailsData.invoiceOverheadCharges;
			var aRemitTo = mHeaderDetailsData.invoicebp[0];
			var aBillTo = mHeaderDetailsData.invoicebpBillto[0];
			var mReviewModelData = mReviewModel.getData();
			var createdAtInDB = mHeaderDetails.getProperty("/createdAtInDB");
			var currentDate = Date.now();
			var newDate = new Date();
			var sYear = newDate.getFullYear();
			var sMon = newDate.getMonth() + 1;
			var sDate = newDate.getDate();
			if (sMon.toString().length < 2) {
				sMon = "0" + sMon.toString();
			}
			if (sDate.toString().length < 2) {
				sDate = "0" + sDate.toString();
			}
			var createdAt = sYear + "-" + sMon + "-" + sDate;
			var loggedinUserDetails = mHeaderDetails.getProperty("/loggedinUserData");
			var loggedinuser = loggedinUserDetails.email;
			var requestId = mHeaderDetails.getProperty("/reqId");
			var id = mHeaderDetails.getProperty("/id");
			var remittoId = mHeaderDetails.getProperty("/remitToid");
			var BillToid = mHeaderDetails.getProperty("/BillToid");
			if (requestId && id) {
				var obj = {
					"requestId": requestId,
					"vendorName": mHeaderDetailsData.vendorName,
					"ocrBatchId": null,
					"headerText": null,
					"id": id,
					"extInvNum": mReviewModelData.invNo,
					"invoiceDate": mReviewModelData.invDate,
					"dueDate": null,
					"createdAt": createdAt,
					"vendorId": mHeaderDetailsData.vendorID,
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
					"createdByInDb": loggedinuser,
					"createdAtInDB": createdAtInDB,
					"updatedBy": null,
					"updatedAt": null,
					"accountNumber": null,
					"postingDate": currentDate,
					"assignedTo": "MARLENE",
					"disAmt": mReviewModelData.discount,
					"deposit": null,
					"invoiceItems": [],
					"costAllocation": null,
					"commentDto": mReviewModelData.commentDto,
					"workflowResponse": null,
					"errorMsgesOnSAPPosting": null,
					"attachments": mReviewModelData.docManagerDto,
					"invoiceOverheadCharges": ainvoiceOverheadCharges,
					"invoiceTaxDetails": null,
					"remitTo": {
						"id": remittoId,
						"requestId": requestId,
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
						"id": BillToid,
						"requestId": requestId,
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
						"itemId": poItemData[i].itemId,
						"requestId": requestId,
						"itemLifeCycleStatus": "00",
						"itemLifeCycleStatusText": "DRAFT",
						"itemCode": poItemData[i].itemCode,
						"itemText": poItemData[i].itemText,
						//"shortText": poItemData[i].Material,
						"extItemId": "",
						"customerItemID": "0",
						"invQty": poItemData[i].invQty,
						"qtyUom": poItemData[i].Unit,
						"price": poItemData[i].price,
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
						"netWorth": poItemData[i].poNetPrice,
						"itemComment": null,
						"isTwowayMatched": false,
						"isThreewayMatched": false,
						"matchDocNum": "",
						"matchDocItem": "",
						"matchParam": null,
						"unusedField1": null,
						"unusedField2": null,
						"createdByInDb": loggedinuser,
						"createdAtInDB": createdAtInDB,
						"updatedBy": null,
						"updatedAt": null,
						"isSelected": false,
						"refDocCat": null,
						"refDocNum": poItemData[i].refDocNum,
						"threeWayMessae": null,
						"isThreewayQtyIssue": null,
						"isThreewayPriceIssue": null,
						"poAvlQtyOPU": null,
						"poAvlQtyOU": 0.00,
						"poAvlQtySKU": null,
						"unitPriceOPU": poItemData[i].price,
						"unitPriceOU": null,
						"unitPriceSKU": null,
						"poNetPrice": poItemData[i].poNetPrice,
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
									that.oRouter.navTo("draftInboxView");
								}
							});
						} else {
							sap.m.MessageBox.information(message, {
								actions: [sap.m.MessageBox.Action.OK]
							});
						}
					}
				});
			} else {
				var obj = {
					"vendorName": mHeaderDetailsData.vendorName,
					"ocrBatchId": null,
					"headerText": null,
					"extInvNum": mReviewModelData.invNo,
					"invoiceDate": mReviewModelData.invDate,
					"dueDate": null,
					"createdAt": createdAt,
					"vendorId": mHeaderDetailsData.vendorID,
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
					"paymentTerms": mHeaderDetailsData.PaymentTerms,
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
					"createdByInDb": loggedinuser,
					"createdAtInDB": createdAtInDB,
					"updatedBy": null,
					"updatedAt": null,
					"accountNumber": null,
					"postingDate": currentDate,
					"assignedTo": "MARLENE",
					"disAmt": mReviewModelData.discount,
					"deposit": null,
					"invoiceItems": [],
					"costAllocation": null,
					"commentDto": mReviewModelData.commentDto,
					"workflowResponse": null,
					"errorMsgesOnSAPPosting": null,
					"attachments": mReviewModelData.docManagerDto,
					"invoiceOverheadCharges": ainvoiceOverheadCharges,
					"invoiceTaxDetails": null,
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
						"itemId": poItemData[i].itemId,
						"itemLifeCycleStatus": "00",
						"itemLifeCycleStatusText": "DRAFT",
						"itemCode": poItemData[i].itemCode,
						"itemText": poItemData[i].itemText,
						//"shortText": poItemData[i].Material,
						"extItemId": "",
						"customerItemID": "0",
						"invQty": poItemData[i].invQty,
						"qtyUom": poItemData[i].Unit,
						"price": poItemData[i].price,
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
						"netWorth": poItemData[i].poNetPrice,
						"itemComment": null,
						"isTwowayMatched": false,
						"isThreewayMatched": false,
						"matchDocNum": "",
						"matchDocItem": "",
						"matchParam": null,
						"unusedField1": null,
						"unusedField2": null,
						"createdByInDb": loggedinuser,
						"createdAtInDB": createdAtInDB,
						"updatedBy": null,
						"updatedAt": null,
						"isSelected": false,
						"refDocCat": null,
						"refDocNum": poItemData[i].refDocNum,
						"threeWayMessae": null,
						"isThreewayQtyIssue": null,
						"isThreewayPriceIssue": null,
						"poAvlQtyOPU": null,
						"poAvlQtyOU": 0.00,
						"poAvlQtySKU": null,
						"unitPriceOPU": poItemData[i].price,
						"unitPriceOU": null,
						"unitPriceSKU": null,
						"poNetPrice": poItemData[i].poNetPrice,
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
									that.oRouter.navTo("draftInboxView");
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
		},
		onSubmit: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
			var ainvoiceOverheadCharges = mHeaderDetailsData.invoiceOverheadCharges;
			var aRemitTo = mHeaderDetailsData.invoicebp[0];
			var aBillTo = mHeaderDetailsData.invoicebpBillto[0];
			var mReviewModelData = mReviewModel.getData();
			var createdAtInDB = mHeaderDetails.getProperty("/createdAtInDB");
			var currentDate = Date.now();
			var newDate = new Date();
			var sYear = newDate.getFullYear();
			var sMon = newDate.getMonth() + 1;
			var sDate = newDate.getDate();
			if (sMon.toString().length < 2) {
				sMon = "0" + sMon.toString();
			}
			if (sDate.toString().length < 2) {
				sDate = "0" + sDate.toString();
			}
			var createdAt = sYear + "-" + sMon + "-" + sDate;
			var loggedinUserDetails = mHeaderDetails.getProperty("/loggedinUserData");
			var loggedinuser = loggedinUserDetails.email;
			var requestId = mHeaderDetails.getProperty("/reqId");
			var id = mHeaderDetails.getProperty("/id");
			var remittoId = mHeaderDetails.getProperty("/remitToid");
			var BillToid = mHeaderDetails.getProperty("/BillToid");
			var remitTo, billTo;

			if (aBillTo) {
				billTo = {
					"id": BillToid,
					"requestId": requestId,
					"partnerRole": "",
					"partnerName": aBillTo.partnerName,
					"postalCode": aBillTo.postalCode,
					"city": aBillTo.city,
					"street": aBillTo.street,
					"country": aBillTo.country,
					"partnerNo": "",
					"telephone": aBillTo.telephone
				};
			} else {
				billTo = null;
			}
			if (aRemitTo) {
				remitTo = {
					"id": remittoId,
					"requestId": requestId,
					"partnerRole": "",
					"partnerName": aRemitTo.partnerName,
					"postalCode": aRemitTo.postalCode,
					"city": aRemitTo.city,
					"street": aRemitTo.street,
					"country": aRemitTo.country,
					"partnerNo": "",
					"telephone": aRemitTo.telephone
				};
			} else {
				remitTo = null;
			}
			if (requestId && id) {
				var obj = {
					"requestId": requestId,
					"id": id,
					"vendorName": mHeaderDetailsData.vendorName,
					"ocrBatchId": null,
					"headerText": null,
					"extInvNum": mReviewModelData.invNo,
					"invoiceDate": mReviewModelData.invDate,
					"dueDate": null,
					"createdAt": createdAt,
					"vendorId": mHeaderDetailsData.vendorID,
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
					"paymentTerms": mHeaderDetailsData.PaymentTerms,
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
					"createdByInDb": loggedinuser,
					"createdAtInDB": createdAtInDB,
					"updatedBy": null,
					"updatedAt": null,
					"accountNumber": null,
					"postingDate": currentDate,
					"assignedTo": "MARLENE",
					"disAmt": mReviewModelData.discount,
					"deposit": null,
					"invoiceItems": [],
					"costAllocation": null,
					"commentDto": mReviewModelData.commentDto,
					"workflowResponse": null,
					"errorMsgesOnSAPPosting": null,
					"attachments": mReviewModelData.docManagerDto,
					"invoiceOverheadCharges": ainvoiceOverheadCharges,
					"invoiceTaxDetails": null,
					"remitTo": remitTo,
					"billTo": billTo,
					"screenVariantForCADtoList": null
				};
				var invItemList = {};
				for (var i = 0; i < poItemData.length; i++) {
					invItemList = {
						"id": poItemData[i].id,
						"itemId": poItemData[i].itemId,
						"requestId": requestId,
						"itemLifeCycleStatus": "01",
						"itemLifeCycleStatusText": "Open",
						"itemCode": poItemData[i].itemCode,
						"itemText": poItemData[i].itemText,
						"shortText": poItemData[i].itemText,
						"extItemId": "",
						"customerItemID": "0",
						"invQty": poItemData[i].invQty,
						"qtyUom": poItemData[i].qtyUom,
						"price": poItemData[i].price,
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
						"netWorth": poItemData[i].poNetPrice,
						"itemComment": null,
						"isTwowayMatched": true,
						"isThreewayMatched": false,
						"matchDocNum": "",
						"matchDocItem": "",
						"matchParam": null,
						"unusedField1": null,
						"unusedField2": null,
						"createdByInDb": "saikat.bhowmick@incture.com",
						"createdAtInDB": createdAtInDB,
						"updatedBy": null,
						"updatedAt": null,
						"isSelected": true,
						"refDocCat": null,
						"refDocNum": poItemData[i].refDocNum,
						"threeWayMessae": null,
						"isThreewayQtyIssue": null,
						"isThreewayPriceIssue": null,
						"poAvlQtyOPU": null,
						"poAvlQtyOU": 0.00,
						"poAvlQtySKU": null,
						"unitPriceOPU": null,
						"unitPriceOU": null,
						"unitPriceSKU": null,
						"poNetPrice": poItemData[i].poNetPrice,
						"poTaxCode": "",
						"poTaxPer": null,
						"poTaxValue": null,
						"poMaterialNum": poItemData[i].itemCode,
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
									that.oRouter.navTo("draftInboxView");
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
		}
	});

});