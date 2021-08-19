sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.reviewPage", {
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
			oRouter.navTo("invoiceCreate");
		},
		onDownloadPdf: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var street = mHeaderDetails.getProperty("/invoicebpstreet");
			var city = mHeaderDetails.getProperty("/invoicebpcity");
			var postalCode = mHeaderDetails.getProperty("/invoicebppostalCode");
			var purchaseOrder = mHeaderDetails.getProperty("/Purch_Ord");
			var vendor = mHeaderDetails.getProperty("/vendorName");
			var columns = ["Item", "Product Description", "Unit", "QTY LBS", "Net Price", "Net Amount"];
			var oData = mReviewModel.getProperty("/results");
			var data = [];
			for (var i = 0; i < oData.length; i++) {
				data[i] = [oData[i].Material, oData[i].ShortText, oData[i].PoUnit, oData[i].Quantity, oData[i].NetPrice, oData[i].netWorth];
			}
			var doc = new jsPDF("p", "pt");
			doc.setFontSize(20);
			doc.setFontType("bold");
			doc.text(240, 30, "INVOICE");
			doc.setFont("Times New Roman");
			doc.setFontSize(12);
			doc.setFontType("normal");
			doc.rect(40, 75, 515, 90);
			doc.rect(40, 165, 515, 95);
			doc.rect(40, 50, 515, 25);
			doc.line(255, 50, 255, 75);
			doc.line(40, 190, 555, 190);
			doc.line(255, 165, 255, 190);
			doc.setLineWidth(0.5);
			doc.text(45, 65, vendor);
			doc.setFontSize(10);
			doc.text(45, 100, vendor);
			doc.text(45, 115, street);
			doc.text(45, 130, city);
			doc.text(300, 100, "PO #");
			doc.text(325, 100, purchaseOrder);
			doc.text(300, 120, "Invoice Date #");
			doc.text(300, 140, "Currency #");
			doc.setFontType("bold");
			doc.text(45, 180, "SHIP VIA");
			doc.text(300, 180, "DIRECT DELIVERY");
			doc.setFontType("normal");
			doc.text(45, 200, "Bill To");
			doc.text(45, 220, street);
			doc.text(45, 240, city);
			doc.text(90, 240, postalCode);
			doc.autoTable(columns, data, {
				tableLineColor: [0, 0, 0],
				tableLineWidth: 0.75,
				theme: "plain",
				startY: 260,
				startX: 20,
				margin: {
					top: 60
				},
				headerStyles: {
					lineWidth: 1,
					lineColor: [0, 0, 0]
				}
			});
			doc.save("Invoice.pdf");
		},
		
		
		
		// onSignInvoice: function() {
		// 	// this.openBusyDialog();
		// 	var that = this;
		// 	var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
		// 	var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
		// 	// var userEmail = mHeaderDetails.getProperty("/loggedinUserData").email;
		// 	var getInvoiceUrl = 'InctureApDest/attachment?requestId=APA-000450';
		// 	// var signInvoiceUrl = 'DocuSign_Test/docusign/createEnvelope';
		//   	var signInvoiceUrl = "DocuSign_Test/eg011/createEnvelope";
		//   	var authUrl1 = "DocuSign_Auth/auth?response_type=code&scope=signature click.manage&client_id=cb5e6ea4-2858-4bb4-83b4-5d09d9f407f7&";
		//   	var authUrl2=  "redirect_uri='https://cw4quuwhzv0yfdhktaskapp-approuter.cfapps.eu10.hana.ondemand.com/cominctureCreateEInvoice-1.0.0/index.html'";
		//   	var getAuthUrl = authUrl1 + authUrl2;
		//   	// window.open(signInvoiceUrl, '_blank');
		// 		// jQuery
		// 		// .ajax({
		// 		// 	url: getInvoiceUrl,
		// 		// 	type: "GET",
		// 		// 	dataType: "json",
		// 		// 	success: function (result) {
		// 		// 		mReviewModel.getData().pdfFile = result.attachmentList[0];
		// 		// 		mReviewModel.refresh();
		// 		// 		var filePayload = {
		// 		// 			"signerEmail": "arijeet@incture.com",
		// 		// 			"signerName": "Niharika",
		// 		// 			"documentName": mReviewModel.getData().pdfFile.fileName ,
		// 		// 			"documentInfo": mReviewModel.getData().pdfFile.fileBase64
		// 		// 		};
		// 		// 		// var url='/eg011/createEnvelope'; 




		// 		// 		// jQuery.ajax({
		// 		// 		// 	type: "GET",
		// 		// 		// 	contentType: "application/json",
		// 		// 		// 	url: signInvoiceUrl,
		// 		// 		// 	dataType: "json",
		// 		// 		// 	// data: JSON.stringify(filePayload),
						
		// 		// 		// 	success: function (data, textStatus, jqXHR) {
		// 		// 		// 		sap.m.MessageBox.success("Document sent to DocuSign");	
		// 		// 		// 	}
		// 		// 		// });
		// 		// 	}
		// 		// });
		// 		jQuery
		// 		.ajax({
		// 			url: signInvoiceUrl,
		// 			type: "GET",
		// 			contentType: "application/json",
		// 			success: function (result) {
		// 					sap.m.MessageBox.success("Document sent to DocuSign");
		// 				// mReviewModel.getData().pdfFile = result.attachmentList[0];
		// 				// mReviewModel.refresh();
		// 				// var filePayload = {
		// 				// 	"signerEmail": "arijeet@incture.com",
		// 				// 	"signerName": "Niharika",
		// 				// 	"documentName": mReviewModel.getData().pdfFile.fileName ,
		// 				// 	"documentInfo": mReviewModel.getData().pdfFile.fileBase64
		// 				}
		// 				// var url='/eg011/createEnvelope'; 




		// 				// jQuery.ajax({
		// 				// 	type: "GET",
		// 				// 	contentType: "application/json",
		// 				// 	url: signInvoiceUrl,
		// 				// 	dataType: "json",
		// 				// 	// data: JSON.stringify(filePayload),
						
		// 				// 	success: function (data, textStatus, jqXHR) {
		// 				// 		sap.m.MessageBox.success("Document sent to DocuSign");	
		// 				// 	}
		// 				// });
					
		// 		});
		// },
		onSaveasDraft: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			//var mattachmentModel = this.getView().getModel("mattachmentModel");
			var poItemData = mReviewModel.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			//var aShippingHandeling = mHeaderDetailsData.shippingHandling;
			//var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
			var ainvoiceOverheadCharges = mHeaderDetailsData.invoiceOverheadCharges;

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
				"vendorName": mHeaderDetailsData.vendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": createdAt,
				"vendorId": mReviewModelData.vendorId,
				"clerkId": null,
				"compCode": mHeaderDetailsData.Company_Code,
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
				"invoiceOverheadCharges": ainvoiceOverheadCharges,
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
					//"shortText": poItemData[i].Material,
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
					"unitPriceOPU": poItemData[i].NetPrice,
					"unitPriceOU": null,
					"unitPriceSKU": null,
					"poNetPrice": poItemData[i].netWorth,
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
				"vendorName": mHeaderDetailsData.vendorName,
				"ocrBatchId": null,
				"headerText": null,
				"extInvNum": mReviewModelData.invNo,
				"invoiceDate": mReviewModelData.invDate,
				"dueDate": null,
				"createdAt": createdAt,
				"vendorId": mHeaderDetailsData.vendorID,
				"clerkId": null,
				"compCode": mHeaderDetailsData.Company_Code,
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
					"qtyUom": poItemData[i].PoUnit,
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
					"matchParam": poItemData[i].ShortText,
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
					"unitPriceOPU": poItemData[i].NetPrice,
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
	});

});