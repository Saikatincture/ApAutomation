sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
	"use strict";
	return Controller.extend("com.inc.SearchPurchaseOrder.controller.previewPage", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("previewPage").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function () {
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
			oRouter.navTo("invoiceCreate");
		},
		onSaveasDraft: function () {

			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			/*	var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
				var ainvoiceOverheadCharges = mHeaderDetailsData.invoiceOverheadCharges;*/
			//Remit To details 
			var aRemitTocity = mHeaderDetails.getProperty("/invoicebpcity");
			var aRemitTocountry = mHeaderDetails.getProperty("/invoicebpcountry");
			var aRemitTopostalCode = mHeaderDetails.getProperty("/invoicebppostalCode");
			var aRemitTostreet = mHeaderDetails.getProperty("/invoicebpstreet");
			var aRemitTopartnerName = mHeaderDetails.getProperty("/invoicebppartnerName");
			//Bill to details 
			var aBillTocity = mHeaderDetails.getProperty("/billtocity");
			var aBillTocountry = mHeaderDetails.getProperty("/billtocountry");
			var aBillTopostalCode = mHeaderDetails.getProperty("/billtopostalCode");
			var aBillTostreet = mHeaderDetails.getProperty("/billtostreet");
			var aBillTopartnerName = mHeaderDetails.getProperty("/billtopartnerName");
			var mReviewModelData = mReviewModel.getData();
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
			var obj = {
				"vendorName": mHeaderDetailsData.SelectedVendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": createdAt,
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
				"createdByInDb": loggedinuser,
				"createdAtInDB": currentDate,
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
				"invoiceOverheadCharges": null,
				"invoiceTaxDetails": null,
				"remitTo": {
					"partnerRole": "",
					"partnerName": aRemitTopartnerName,
					"postalCode": aRemitTopostalCode,
					"city": aRemitTocity,
					"street": aRemitTostreet,
					"country": aRemitTocountry,
					"partnerNo": "",
					"telephone": ""
				},
				"billTo": {
					"partnerRole": "",
					"partnerName": aBillTopartnerName,
					"postalCode": aBillTopostalCode,
					"city": aBillTocity,
					"street": aBillTostreet,
					"country": aBillTocountry,
					"partnerNo": "",
					"telephone": ""
				},
				"screenVariantForCADtoList": null
			};
			var invItemList = {};
			for (var i = 0; i < poItemData.length; i++) {
				invItemList = {
					"itemId": poItemData[i].PoItem,
					"itemLifeCycleStatus": "00",
					"itemLifeCycleStatusText": "DRAFT",
					"itemCode": poItemData[i].Material,
					"itemText": poItemData[i].ShortText,
					"extItemId": "",
					"customerItemID": "0",
					"invQty": poItemData[i].Quantity,
					"qtyUom": poItemData[i].PoUnit,
					"price": poItemData[i].NetPrice,
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
					"netWorth": poItemData[i].netWorth,
					"itemComment": null,
					"isTwowayMatched": false,
					"isThreewayMatched": false,
					"matchDocNum": "",
					"matchDocItem": "",
					"matchParam": null,
					"unusedField1": null,
					"unusedField2": null,
					"createdByInDb": loggedinuser,
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
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			//Remit To details 
			var aRemitTocity = mHeaderDetails.getProperty("/invoicebpcity");
			var aRemitTocountry = mHeaderDetails.getProperty("/invoicebpcountry");
			var aRemitTopostalCode = mHeaderDetails.getProperty("/invoicebppostalCode");
			var aRemitTostreet = mHeaderDetails.getProperty("/invoicebpstreet");
			var aRemitTopartnerName = mHeaderDetails.getProperty("/invoicebppartnerName");
			//Bill to details 
			var aBillTocity = mHeaderDetails.getProperty("/billtocity");
			var aBillTocountry = mHeaderDetails.getProperty("/billtocountry");
			var aBillTopostalCode = mHeaderDetails.getProperty("/billtopostalCode");
			var aBillTostreet = mHeaderDetails.getProperty("/billtostreet");
			var aBillTopartnerName = mHeaderDetails.getProperty("/billtopartnerName");
			var mReviewModelData = mReviewModel.getData();
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
			var obj = {
				"vendorName": mHeaderDetailsData.SelectedVendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": createdAt,
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
				"createdAtInDB": currentDate,
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
				"invoiceOverheadCharges": null,
				"invoiceTaxDetails": null,
				"remitTo": {
					"partnerRole": "",
					"partnerName": aRemitTopartnerName,
					"postalCode": aRemitTopostalCode,
					"city": aRemitTocity,
					"street": aRemitTostreet,
					"country": aRemitTocountry,
					"partnerNo": "",
					"telephone": ""
				},
				"billTo": {
					"partnerRole": "",
					"partnerName": aBillTopartnerName,
					"postalCode": aBillTopostalCode,
					"city": aBillTocity,
					"street": aBillTostreet,
					"country": aBillTocountry,
					"partnerNo": "",
					"telephone": ""
				},
				"screenVariantForCADtoList": null
			};
			var invItemList = {};
			for (var i = 0; i < poItemData.length; i++) {
				invItemList = {
					"itemId": poItemData[i].PoItem,
					"itemLifeCycleStatus": "01",
					"itemLifeCycleStatusText": "Open",
					"itemCode": poItemData[i].Material,
					"itemText": poItemData[i].ShortText,
					"shortText": "",
					"extItemId": "",
					"customerItemID": "0",
					"invQty": poItemData[i].Quantity,
					"qtyUom": poItemData[i].Unit,
					"price": poItemData[i].NetPrice,
					"currency": "EUR",
					"pricingUnit": null,
					"unit": null,
					"disAmt": mReviewModelData.discount,
					"disPer": null,
					"deposit": null,
					"shippingAmt": null,
					"shippingPer": null,
					"taxAmt": null,
					"taxPer": null,
					"netWorth": poItemData[i].netWorth,
					"itemComment": null,
					"isTwowayMatched": true,
					"isThreewayMatched": false,
					"matchDocNum": "",
					"matchDocItem": "",
					"matchParam": null,
					"unusedField1": null,
					"unusedField2": null,
					"createdByInDb": loggedinuser,
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
					"unitPriceOPU": null,
					"unitPriceOU": null,
					"unitPriceSKU": null,
					"poNetPrice": poItemData[i].netWorth,
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
		},
		onDownloadPdf: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			//Remit To details 
			var aRemitTocity = mHeaderDetails.getProperty("/invoicebpcity");
			var aRemitTocountry = mHeaderDetails.getProperty("/invoicebpcountry");
			var aRemitTopostalCode = mHeaderDetails.getProperty("/invoicebppostalCode");
			var aRemitTostreet = mHeaderDetails.getProperty("/invoicebpstreet");
			var aRemitTopartnerName = mHeaderDetails.getProperty("/invoicebppartnerName");
			//Bill to details 
			var aBillTocity = mHeaderDetails.getProperty("/billtocity");
			var aBillTocountry = mHeaderDetails.getProperty("/billtocountry");
			var aBillTopostalCode = mHeaderDetails.getProperty("/billtopostalCode");
			var aBillTostreet = mHeaderDetails.getProperty("/billtostreet");
			var aBillTopartnerName = mHeaderDetails.getProperty("/billtopartnerName");
			var mReviewModelData = mReviewModel.getData();
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
			var obj = {
				"vendorName": mHeaderDetailsData.SelectedVendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": createdAt,
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
				"createdAtInDB": currentDate,
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
				"invoiceOverheadCharges": null,
				"invoiceTaxDetails": null,
				"remitTo": {
					"partnerRole": "",
					"partnerName": aRemitTopartnerName,
					"postalCode": aRemitTopostalCode,
					"city": aRemitTocity,
					"street": aRemitTostreet,
					"country": aRemitTocountry,
					"partnerNo": "",
					"telephone": ""
				},
				"billTo": {
					"partnerRole": "",
					"partnerName": aBillTopartnerName,
					"postalCode": aBillTopostalCode,
					"city": aBillTocity,
					"street": aBillTostreet,
					"country": aBillTocountry,
					"partnerNo": "",
					"telephone": ""
				},
				"screenVariantForCADtoList": null
			};
			var invItemList = {};
			for (var i = 0; i < poItemData.length; i++) {
				invItemList = {
					"itemId": poItemData[i].PoItem,
					"itemLifeCycleStatus": "01",
					"itemLifeCycleStatusText": "Open",
					"itemCode": poItemData[i].Material,
					"itemText": poItemData[i].ShortText,
					"shortText": "",
					"extItemId": "",
					"customerItemID": "0",
					"invQty": poItemData[i].Quantity,
					"qtyUom": poItemData[i].Unit,
					"price": poItemData[i].NetPrice,
					"currency": "EUR",
					"pricingUnit": null,
					"unit": null,
					"disAmt": mReviewModelData.discount,
					"disPer": null,
					"deposit": null,
					"shippingAmt": null,
					"shippingPer": null,
					"taxAmt": null,
					"taxPer": null,
					"netWorth": poItemData[i].netWorth,
					"itemComment": null,
					"isTwowayMatched": true,
					"isThreewayMatched": false,
					"matchDocNum": "",
					"matchDocItem": "",
					"matchParam": null,
					"unusedField1": null,
					"unusedField2": null,
					"createdByInDb": loggedinuser,
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
					"unitPriceOPU": null,
					"unitPriceOU": null,
					"unitPriceSKU": null,
					"poNetPrice": poItemData[i].netWorth,
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
			var url = "InctureApTest/attachment/downloadPDF/";
			var that = this;
			that.openBusyDialog();
			jQuery.ajax({
				type: "POST",
				contentType: "application/json",
				url: url,
				dataType: "json",
				data: JSON.stringify(obj),
				success: function (data, textStatus, jqXHR) {
					var Base64 = data.base64;
					var fileName = data.namePo;
					/*if (fileName && fileName.split(".") && fileName.split(".")[fileName.split(".").length - 1]) {
						var fileType = fileName.split(".")[fileName.split(".").length - 1].toLowerCase();
					}*/
					if (!jQuery.isEmptyObject(Base64)) {
						var u8_2 = new Uint8Array(atob(Base64).split("").map(function (c) {
							return c.charCodeAt(0);
						}));
						var a = document.createElement("a");
						document.body.appendChild(a);
						a.style = "display: none";
						var blob = new Blob([u8_2], {
							type: "application/pdf",
							name: fileName
						});
						var bUrl = window.URL.createObjectURL(blob);
						a.href = bUrl;
						a.download = fileName;
						a.click();
						that.closeBusyDialog();
					}

				}
			});

		}
	});

});