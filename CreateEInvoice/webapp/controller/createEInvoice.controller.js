sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.createEInvoice", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("createEInvoice").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function () {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var sPath = mDraftDetails.getProperty("/Path");
			var aDraftData = mDraftDetails.getProperty(sPath);
			this.getAllDetails();
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
			oRouter.navTo("draftInboxView");
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
						mHeaderDetails.setProperty("/createdAtInDB", invoiceHeader.createdAtInDB);
						mHeaderDetails.setProperty("/PaymentTerms", obj.PaymentTerms);
						var invoicebp = [];
						invoicebp.push(result.remitTo);
						var invoicebpBillto = [];
						invoicebpBillto.push(result.billTo);

						if (result.billTo) {
							mHeaderDetails.setProperty("/billtocity", result.billTo.city);
							mHeaderDetails.setProperty("/BillToid", result.billTo.id);
						}
						if (result.remitTo) {
							mHeaderDetails.setProperty("/invoicebpcity", result.remitTo.city);
							mHeaderDetails.setProperty("/remitToid", result.remitTo.id);
						}
						mHeaderDetails.setProperty("/reqId", invoiceHeader.requestId);
						mHeaderDetails.setProperty("/id", invoiceHeader.id);
						mHeaderDetails.setProperty("/invoiceTotal", invoiceHeader.invoiceTotal);
						mHeaderDetails.setProperty("/taxAmount", invoiceHeader.taxAmount);
						mHeaderDetails.setProperty("/selectedCompanyCode", invoiceHeader.compCode);
						mHeaderDetails.setProperty("/invoicetype", invoiceHeader.refDocCat);
						mHeaderDetails.setProperty("/VendorID", invoiceHeader.vendorId);
						mHeaderDetails.setProperty("/SelectedVendorName", invoiceHeader.vendorName);
						mHeaderDetails.setProperty("/type", invoiceHeader.invoiceType);
						mHeaderDetails.setProperty("/invoicebp", invoicebp);
						mHeaderDetails.setProperty("/invoicebpBillto", invoicebpBillto);
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
						mHeaderDetails.setProperty("/Purch_Ord", invoiceHeader.refDocNum);
						mHeaderDetails.setProperty("/vendorName", invoiceHeader.vendorName);
						mHeaderDetails.setProperty("/vendorID", invoiceHeader.vendorId);
						var poItemSet = new sap.ui.model.json.JSONModel();
						that.getView().setModel(poItemSet, "poItemSet");
						var d = Date.parse(invoiceHeader.invoiceDate);
						var invDate = new Date(d);
						var sYear = invDate.getFullYear();
						var sMon = invDate.getMonth() + 1;
						var sDate = invDate.getDate();
						if (sMon.toString().length < 2) {
							sMon = "0" + sMon.toString();
						}
						if (sDate.toString().length < 2) {
							sDate = "0" + sDate.toString();
						}
						var dInvoice = sYear + "-" + sMon + "-" + sDate;
						poItemSet.setProperty("/invDate", dInvoice);
						poItemSet.setProperty("/invNo", result.invoiceHeader.extInvNum);
						result.totalNetvalue = 0;
						if (result.invoiceItems) {
							for (var i = 0; i < result.invoiceItems.length; i++) {
								result.invoiceItems[i].taxCode = "V1";
								result.invoiceItems[i].taxPer = "10";
								result.invoiceItems[i].taxAmount = (parseFloat(result.invoiceItems[i].poNetPrice) * (parseFloat(result.invoiceItems[i].taxPer) /
									100)).toFixed(2);
								result.totalNetvalue += Number(result.invoiceItems[i].poNetPrice);
							}
						}
						poItemSet.setProperty("/results", result.invoiceItems);
						poItemSet.setProperty("/totalNetvalue", result.totalNetvalue);
						poItemSet.refresh();
						/*	var ainvoiceTaxDetails = mHeaderDetails.getProperty("/invoiceTaxDetails");
							if (ainvoiceTaxDetails.length > 0) {
								for (var j = 0; j < ainvoiceTaxDetails.length; j++) {
									var taxPer = "10";
									var totalNetvalue = poItemSet.getProperty("/totalNetvalue");
									var taxAmount = (parseFloat(totalNetvalue) * (parseFloat(taxPer) / 100)).toFixed(
										2);
									mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxPer", taxPer);
									mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxAmount", taxAmount);
									mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxableAmount", totalNetvalue);
								}
							}*/

					}
				});
		},
		onAddRowTaxTable: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var mHeaderDetailsData = mHeaderDetails.getData();
			if (!mHeaderDetailsData.invoiceTaxDetails) {
				mHeaderDetailsData.invoiceTaxDetails = [];
			}
			var taxCode = "";
			var taxJurisdiction = "";
			//var shipTo = mHeaderDetails.getProperty("/billtocity");
			//var shipFrom = mHeaderDetails.getProperty("/invoicebpcity");
			//var taxPer = "10";
			//var totalNetvalue = mReviewModel.getProperty("/totalAmount");
			//var totalAmount = mReviewModel.getProperty("/totalAmount");
			//var taxAmount;
			/*	if (totalNetvalue) {
					taxAmount = (parseFloat(totalNetvalue) * (parseFloat(taxPer) / 100)).toFixed(
						2);
				}*/
			mHeaderDetailsData.invoiceTaxDetails.unshift({
				"taxCode": taxCode,
				"taxJurisdiction": taxJurisdiction,
				"shipTo": "",
				"shipFrom": "",
				"taxableAmount": "",
				"taxAmount": "",
				"taxPer": ""
			});
			mHeaderDetails.refresh();
		},
		onChangeTaxDetailsTaxPer: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var sPath = oEvent.getSource().getBindingContext("mHeaderDetails").getPath();
			var poItemSet = oEvent.getSource().getModel("poItemSet");
			var totalNetvalue = poItemSet.getProperty("/totalNetvalue");
			var taxAmount = (parseFloat(totalNetvalue) * (parseFloat(sValue) / 100)).toFixed(
				2);
			mHeaderDetails.setProperty(sPath + "/taxPer", sValue);
			mHeaderDetails.setProperty(sPath + "/taxAmount", taxAmount);
		},
		onDeleteRow: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var oTable = this.getView().byId("Invoice_Tax_Table");
			var aSelectedItems = this.getView().byId("Invoice_Tax_Table").getSelectedContextPaths();
			var sLength = aSelectedItems.length;
			if (sLength > 0) {
				for (var i = sLength - 1; i >= 0; i--) {
					var indx = aSelectedItems[i].split("/")[2];
					mHeaderDetails.getData().invoiceTaxDetails.splice(indx, 1);
				}
			} else {
				sap.m.MessageBox.warning("Please Select Tax Details!");
			}
			oTable.removeSelections(true);
			mHeaderDetails.refresh();
		},
		onTaxcodeChange: function (oEvent) {

			var value = oEvent.getSource().getProperty("value");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var sPath = oEvent.getSource().getBindingContext("mHeaderDetails").getPath();
			mHeaderDetails.setProperty(sPath + "/taxCode", value);
			var totalNetvalue = mReviewModel.getProperty("/totalAmount");
			mHeaderDetails.setProperty(sPath + "/taxableAmount", totalNetvalue);
			var shipTo = mHeaderDetails.getProperty("/billtocity");
			var shipFrom = mHeaderDetails.getProperty("/invoicebpcity");
			mHeaderDetails.setProperty(sPath + "/shipTo", shipTo);
			mHeaderDetails.setProperty(sPath + "/shipFrom", shipFrom);
			var taxAmount;
			if (value === "V1-Sales Tax") {
				var taxv1 = "10";
				mHeaderDetails.setProperty(sPath + "/taxPer", taxv1);
				taxAmount = (parseFloat(totalNetvalue) * (parseFloat(taxv1) / 100)).toFixed(
					2);
				mHeaderDetails.setProperty(sPath + "/taxAmount", taxAmount);
			} else if (value === "V2-Excise Duty") {
				var taxv2 = "7";
				mHeaderDetails.setProperty(sPath + "/taxPer", taxv2);
				taxAmount = (parseFloat(totalNetvalue) * (parseFloat(taxv2) / 100)).toFixed(
					2);
				mHeaderDetails.setProperty(sPath + "/taxAmount", taxAmount);
			} else if (value === "V3-Value Added Tax") {
				var taxv3 = "9";
				mHeaderDetails.setProperty(sPath + "/taxPer", taxv3);
				taxAmount = (parseFloat(totalNetvalue) * (parseFloat(taxv3) / 100)).toFixed(
					2);
				mHeaderDetails.setProperty(sPath + "/taxAmount", taxAmount);
			}

		},
		onChangeDiscount: function (oEvent) {
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var sValue = oEvent.getParameter("value");
			var value = sValue.split("$")[1];
			var distvalue = parseFloat(value).toFixed(2);
			var totalAmount = mReviewModel.getProperty("/totalAmount");
			var taxAmount = mReviewModel.getProperty("/taxAmount");
			var amtdue = (parseFloat(totalAmount) + parseFloat(taxAmount)) - parseFloat(distvalue).toFixed(2);
			mReviewModel.setProperty("/discount", distvalue);
			mReviewModel.setProperty("/dueAmount", amtdue);

		},
		onSelectionChange: function (oEvent) {
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var poItemSet = this.getView().getModel("poItemSet");
			var currentiIndex = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			var POData = this.getView().getModel("poItemSet").getData().results;
			var index;
			var lineItemTotalAmount = 0;
			var lineItemTaxAmount = 0;
			var amountDue = 0;
			//Added for demo - by saikat 02-02-2021	
			var tax = 0;
			if (currentiIndex.length !== 0) {
				for (var i = 0; i < currentiIndex.length; i++) {
					index = currentiIndex[i].split("/")[2];
					lineItemTotalAmount = lineItemTotalAmount + parseFloat(POData[index].poNetPrice, 10);
					lineItemTaxAmount = lineItemTaxAmount + parseFloat(POData[index].taxAmount, 10);
					amountDue = lineItemTotalAmount + lineItemTaxAmount;
					this.getView().getModel("poItemSet").getData().taxAmount = (lineItemTaxAmount).toFixed(2);
					this.getView().getModel("poItemSet").getData().totalAmount = (lineItemTotalAmount).toFixed(2);
					//Commented for demo - by saikat 02-02-2021	
					//	mReviewModel.setProperty("/taxAmount", (lineItemTaxAmount).toFixed(2));
					//Added for demo - by saikat 02-02-2021	
					mReviewModel.setProperty("/taxAmount", (tax).toFixed(2));
					mReviewModel.setProperty("/totalAmount", (lineItemTotalAmount).toFixed(2));
					mReviewModel.setProperty("/dueAmount", (amountDue).toFixed(2));
					this.getView().getModel("poItemSet").refresh();
					var totalAmount = mReviewModel.getProperty("/totalAmount");
					var taxAmount = mReviewModel.getProperty("/taxAmount");
					var discount = mReviewModel.getProperty("/discount");
					var amtdue = (parseFloat(totalAmount) + parseFloat(taxAmount)) - parseFloat(discount).toFixed(2);
					mReviewModel.setProperty("/discount", discount);
					mReviewModel.setProperty("/dueAmount", amtdue);
					var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
					var ainvoiceTaxDetails = mHeaderDetails.getProperty("/invoiceTaxDetails");
					if (ainvoiceTaxDetails.length > 0) {
						for (var j = 0; j < ainvoiceTaxDetails.length; j++) {
							var taxAmount = (parseFloat(totalAmount) * (parseFloat(ainvoiceTaxDetails[j].taxPer) / 100)).toFixed(
								2);
							mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxAmount", taxAmount);
							mHeaderDetails.setProperty("/invoiceTaxDetails/" + j + "/taxableAmount", totalAmount);
						}
					}
				}
			} else {
				this.getView().getModel("poItemSet").getData().taxAmount = (lineItemTaxAmount).toFixed(2);
				this.getView().getModel("poItemSet").getData().totalAmount = (lineItemTotalAmount).toFixed(2);
				this.getView().getModel("poItemSet").refresh();
				mReviewModel.setProperty("/taxAmount", (lineItemTaxAmount).toFixed(2));
				mReviewModel.setProperty("/totalAmount", (lineItemTotalAmount).toFixed(2));
				mReviewModel.setProperty("/dueAmount", (amountDue).toFixed(2));
			}
		},
		onBeforeUploadStarts: function (oEvent) {
			//var mattachmentModel = this.getView().getModel("mattachmentModel");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var fileName = oEvent.getParameter("newValue"),
				fileList = oEvent.getSource().oFileUpload.files[0],
				fileType = fileList.type,
				that = this;
			String.prototype.replaceAll = function (search, replacement) {
				var target = this;
				return target.replace(new RegExp(search, "g"), replacement);
			};
			fileName = fileName.replaceAll(" ", "_");
			fileName = fileName.replaceAll("#", "_");
			var reader = new FileReader();
			reader.onload = function (event) {
				var s = event.target.result;
				var base64 = s.substr(s.lastIndexOf(","));
				base64 = base64.split(",")[1];
				var cDate = new Date();
				var sDate = Date.now(cDate);
				var docDetails = {
					"fileName": fileName,
					"fileType": fileType,
					"fileBase64": base64,
					"createdAt": sDate
				};
				if (!mHeaderDetails.getData().docManagerDto) {
					mHeaderDetails.getData().docManagerDto = [];
				}
				mHeaderDetails.getData().docManagerDto.push(docDetails);
				mHeaderDetails.refresh();
			};
			if (fileList) {
				reader.readAsDataURL(fileList);
			}
		},
		fnDeleteAttachment: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("mHeaderDetails").getPath();
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var index = sPath.split("/").pop();
			mHeaderDetails.getData().docManagerDto.splice(index, 1);
			mHeaderDetails.refresh();
		},
		onPostComment: function (oEvent) {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			//	var mattachmentModel = this.getView().getModel("mattachmentModel");
			var sValue = oEvent.getParameter("value");
			var dDate = new Date();
			var sDate = dDate.getTime();
			if (!mHeaderDetails.getData().commentDto) {
				mHeaderDetails.getData().commentDto = [];
			}
			var sId = mHeaderDetails.getProperty("/commentId");
			var cValue = mHeaderDetails.getProperty("/input");
			var aCommentSelected = mHeaderDetails.getData().commentDto;
			var aComItem = aCommentSelected.find(function (oRow, index) {
				return oRow.comment === cValue;
			});
			var aSelected = mHeaderDetails.getData().commentDto;
			var aSelectedItem = aSelected.find(function (oRow, index) {
				return oRow.commentId === sId;
			});
			if (aSelectedItem) {
				var lDate = new Date();
				var uDate = lDate.getTime();
				aSelectedItem.comment = cValue;
				aSelectedItem.updatedAt = uDate;
				aSelectedItem.updatedBy = aSelectedItem.createdBy;

			} else if (aComItem) {
				var cDate = new Date();
				var nCDate = cDate.getTime();
				aComItem.comment = cValue;
				aComItem.updatedAt = nCDate;
				aComItem.updatedBy = aComItem.createdBy;
			} else {
				var oComment = {
					"comment": sValue,
					"createdAt": sDate
				};
				var aEntries = mHeaderDetails.getData().commentDto;
				aEntries.unshift(oComment);
			}
			mHeaderDetails.setProperty("/commentId", "");
			mHeaderDetails.refresh();
		},
		fnDeleteComment: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("mHeaderDetails").getPath();
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var index = sPath.split("/").pop();
			mHeaderDetails.getData().commentDto.splice(index, 1);
			mHeaderDetails.refresh();
		},
		onDownloadPdf: function () {

			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var aBilltoData = mHeaderDetails.getProperty("/invoicebpBillto");
			var street = aBilltoData[0].street;
			var city = aBilltoData[0].city;
			var postalCode = aBilltoData[0].postalCode;
			var purchaseOrder = mHeaderDetails.getProperty("/Purch_Ord").toString();
			var vendor = mHeaderDetails.getProperty("/SelectedVendorName");
			var columns = ["Item", "Product Description", "Unit", "QTY LBS", "Net Price", "Net Amount"];
			var poItemSet = this.getView().getModel("poItemSet");
			var oData = poItemSet.getProperty("/results");
			var data = [];
			for (var i = 0; i < oData.length; i++) {
				data[i] = [oData[i].itemCode, oData[i].itemText, oData[i].qtyUom, oData[i].invQty, oData[i].price, oData[i].poNetPrice];
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
		onQtyChange: function (oEvent) {

			var currentIndex = oEvent.getSource().getBindingContext("poItemSet").sPath.split("/")[2];
			var newValue = "";
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (!(/^([0-9]{1,12})(?:\.\d{0,3})?$/.test(newValue))) {
					newValue = newValue.slice(0, -1);
				}
			}
			var fValue = (parseFloat(newValue)).toFixed(2);
			oEvent.getSource().setValue(fValue);
			oEvent.getSource().setTooltip(fValue);
			var oModel = oEvent.getSource().getModel("poItemSet");
			var oItem = oEvent.getSource().getBindingContext("poItemSet").getObject();
			var selectedContexted = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			oItem.poNetPrice = parseFloat(parseFloat(oItem.price, 10) * parseFloat(oItem.invQty, 10), 10).toFixed(2);
			oItem.taxAmount = (parseFloat(oItem.poNetPrice) * (parseFloat(oItem.taxPer) / 100)).toFixed(2);
			oModel.refresh(true);
			for (var j = 0; j < selectedContexted.length; j++) {
				if (currentIndex === selectedContexted[j].split("/")[2]) {
					this.totalLineItemAmountCal();
					this.totalLineItemTaxCal();
				}
			}
		},
		totalLineItemAmountCal: function () {

			var currentiIndex = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			var POData = this.getView().getModel("poItemSet").getData().results;
			var index;
			var lineItemTotalAmount = 0;
			for (var i = 0; i < currentiIndex.length; i++) {
				index = currentiIndex[i].split("/")[2];
				lineItemTotalAmount = lineItemTotalAmount + parseFloat(POData[index].poNetPrice, 10);
				this.getView().getModel("poHeaderSet").getData().results.totalAmount = lineItemTotalAmount;
				this.getView().getModel("poHeaderSet").refresh();
			}
		},

		totalLineItemTaxCal: function () {

			var currentiIndex = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			var POData = this.getView().getModel("poItemSet").getData().results;
			var index;
			var lineItemTaxAmount = 0;
			for (var i = 0; i < currentiIndex.length; i++) {
				index = currentiIndex[i].split("/")[2];
				lineItemTaxAmount = lineItemTaxAmount + parseFloat(POData[index].poNetPrice, 10);
				this.getView().getModel("poHeaderSet").getData().results.taxAmount = lineItemTaxAmount;
				this.getView().getModel("poHeaderSet").refresh();
			}
		},
		onUnitPriceChange: function (oEvent) {
			var currentIndex = oEvent.getSource().getBindingContext("poItemSet").sPath.split("/")[2];
			var newValue = "";
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (!(/^([0-9]{1,12})(?:\.\d{0,3})?$/.test(newValue))) {
					newValue = newValue.slice(0, -1);
				}
			}
			var fValue = (parseFloat(newValue)).toFixed(2);
			oEvent.getSource().setValue(fValue);
			oEvent.getSource().setTooltip(fValue);
			var oModel = oEvent.getSource().getModel("poItemSet");
			var oItem = oEvent.getSource().getBindingContext("poItemSet").getObject();
			oItem.poNetPrice = (parseFloat(parseFloat(oItem.price, 10) * parseFloat(oItem.invQty, 10), 10)).toFixed(2);
			oItem.taxAmount = (parseFloat(oItem.poNetPrice) * (parseFloat(oItem.taxPer) / 100)).toFixed(2);
			oModel.refresh(true);
			var selectedContexted = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			for (var j = 0; j < selectedContexted.length; j++) {
				if (currentIndex === selectedContexted[j].split("/")[2]) {
					this.totalLineItemAmountCal();
					this.totalLineItemTaxCal();
				}
			}
		},
		onChangeTaxPer: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oModel = oEvent.getSource().getModel("poItemSet");
			var oItem = oEvent.getSource().getBindingContext("poItemSet").getObject();
			oItem.taxPer = sValue;
			oItem.taxAmount = (parseFloat(oItem.poNetPrice) * (parseFloat(oItem.taxPer) / 100)).toFixed(2);
			oModel.refresh(true);
		},
		onPreview: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var poItemSet = this.getView().getModel("poItemSet");
			//var mattachmentModel = this.getView().getModel("mattachmentModel");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var aAttachments = mHeaderDetails.getData().docManagerDto;
			var aComments = mHeaderDetails.getData().commentDto;
			if (aAttachments) {
				mReviewModel.setProperty("/docManagerDto", aAttachments);
			}
			if (aComments) {
				mReviewModel.setProperty("/commentDto", aComments);
			}
			var ItemData = this.getView().getModel("poItemSet").getData().results;
			var oTable = this.getView().byId("ID_TBL_PI_INVOICE_SECON");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			var invDate = this.getView().getModel("poItemSet").getData().invDate;
			var invNo = this.getView().getModel("poItemSet").getData().invNo;
			var vendorId = mHeaderDetails.getData().vendorID;
			var vendorName = mHeaderDetails.getData().vendorName;
			if (invDate && invNo) {
				if (itemIndex !== -1) {
					var selectedContext = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
					var poItemData = [];
					for (var j = 0; j < selectedContext.length; j++) {
						poItemData.push(ItemData[selectedContext[j].split("/")[2]]);
					}
					poItemSet.setProperty("/invNo", "");
					poItemSet.setProperty("/invDate", "");
					mReviewModel.setProperty("/results", poItemData);
					mReviewModel.setProperty("/invDate", invDate);
					mReviewModel.setProperty("/invNo", invNo);
					mReviewModel.setProperty("/vendorId", vendorId);
					mReviewModel.setProperty("/vendorName", vendorName);
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("reviewPage");
				} else {
					MessageBox.error("Please Select any purchase order item!");
				}
			} else {
				MessageBox.error("Please Select Invoice Date & Invoice Number!");
			}
		},
		onSaveasDraft: function () {

			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mReviewModel = this.getOwnerComponent().getModel("mReviewModel");
			var mReviewModelData = mReviewModel.getData();
			var poItemSet = this.getView().getModel("poItemSet");
			var poItemData = poItemSet.getData().results;
			var mHeaderDetailsData = mHeaderDetails.getData();
			var ainvoiceTaxDetails = mHeaderDetailsData.invoiceTaxDetails;
			var aRemitTo = mHeaderDetailsData.invoicebp[0];
			var aBillTo = mHeaderDetailsData.invoicebpBillto[0];
			var poItemSetData = poItemSet.getData();
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
					"extInvNum": poItemSetData.invNo,
					"invoiceDate": poItemSetData.invDate,
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
					"discount": mReviewModelData.discount,
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
					"disAmt": null,
					"deposit": null,
					"invoiceItems": [],
					"costAllocation": null,
					"commentDto": mReviewModelData.commentDto,
					"workflowResponse": null,
					"errorMsgesOnSAPPosting": null,
					"attachments": mReviewModelData.docManagerDto,
					//"invoiceOverheadCharges": ainvoiceOverheadCharges,
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
						"id": poItemData[i].id,
						"itemId": poItemData[i].itemId,
						"requestId": requestId,
						"itemLifeCycleStatus": "00",
						"itemLifeCycleStatusText": "DRAFT",
						"itemCode": poItemData[i].itemCode,
						"itemText": poItemData[i].itemText,
						"extItemId": "",
						"customerItemID": "0",
						"invQty": parseInt(poItemData[i].invQty),
						"qtyUom": poItemData[i].Unit,
						"price": parseInt(poItemData[i].price),
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
						"netWorth": parseInt(poItemData[i].poNetPrice),
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
						"unitPriceOPU": parseInt(poItemData[i].price),
						"unitPriceOU": null,
						"unitPriceSKU": null,
						"poNetPrice": parseInt(poItemData[i].poNetPrice),
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
									var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
									oRouter.navTo("draftInboxView");
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
					"extInvNum": poItemSetData.invNo,
					"invoiceDate": poItemSetData.invDate,
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
					"discount": mReviewModelData.discount,
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
					"disAmt": null,
					"deposit": null,
					"invoiceItems": [],
					"costAllocation": null,
					"commentDto": mReviewModelData.commentDto,
					"workflowResponse": null,
					"errorMsgesOnSAPPosting": null,
					"attachments": mReviewModelData.docManagerDto,
					//"invoiceOverheadCharges": ainvoiceOverheadCharges,
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
						"itemId": poItemData[i].itemId,
						"itemLifeCycleStatus": "00",
						"itemLifeCycleStatusText": "DRAFT",
						"itemCode": poItemData[i].itemCode,
						"itemText": poItemData[i].itemText,
						"extItemId": "",
						"customerItemID": "0",
						"invQty": parseInt(poItemData[i].invQty),
						"qtyUom": poItemData[i].Unit,
						"price": parseInt(poItemData[i].price),
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
						"netWorth": parseInt(poItemData[i].poNetPrice),
						"itemComment": null,
						"isTwowayMatched": false,
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
						"isSelected": false,
						"refDocCat": null,
						"refDocNum": poItemData[i].refDocNum,
						"threeWayMessae": null,
						"isThreewayQtyIssue": null,
						"isThreewayPriceIssue": null,
						"poAvlQtyOPU": null,
						"poAvlQtyOU": 0.00,
						"poAvlQtySKU": null,
						"unitPriceOPU": parseInt(poItemData[i].price),
						"unitPriceOU": null,
						"unitPriceSKU": null,
						"poNetPrice": parseInt(poItemData[i].poNetPrice),
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
									var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
									oRouter.navTo("draftInboxView");
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