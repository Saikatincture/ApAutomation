sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.purchaseOrder", {
		_doAjax: function (sUrl, sMethod, oData, bAbort) {
			if (bAbort && this.PrevAjax) {
				this.PrevAjax.abort();
			}
			if (oData) {
				oData = JSON.stringify(oData);
			}
			var xhr = $.ajax({
				url: sUrl,
				method: sMethod,
				headers: {
					'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'Content-Type': 'application/json'
				},
				data: oData || ""
			});
			if (bAbort) {
				this.PrevAjax = xhr;
			}
			return xhr;
		},
		onInit: function () {
			this.busyDialog = new sap.m.BusyDialog({
				text: "Please Wait"
			});
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/createEinvoicebtn", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
			var obj = {
				InvoiceNo: "",
				InvoiceDate: null,
				InvoiceDateTo: null,
				ASNNo: "",
				AmountTo: "",
				VendorId: "300866",
				Status: "",
				Amount: "",
				PONo: "",
				selectedCompanyCode: "",
				selectedInv: false,
				selectedCre: false,
				"selectedDeb": false
			};
			var MasterListHeaderSet = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(MasterListHeaderSet, "MasterListHeaderSet");
			var oModelTb = new sap.ui.model.json.JSONModel({
				"results": []
			});
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var object = {
				"invoicetype": "PO",
				"type": "Invoice",
				//"VendorID": "300866",
				"selectedCompanyCode": "PACR",
				//"SelectedVendorName": "Convergint Technologies",
				"selectedCompanyName": "PACCAR ITD",
				"dashComp": "-",
				"dashVendor": "-",
				"multiPOdashVendor": null
			};
			var newDate = new Date();
			mHeaderDetails.setProperty("/maxDate", newDate);
			var fdate = newDate.getDate();
			var fyear = newDate.getFullYear();
			var fmon = newDate.getMonth() + 1;
			var firstDate = fyear + "-" + fmon + "-" + fdate + "T00:00:00";
			mHeaderDetails.setProperty("/secondDateValue", newDate);
			var nDate = new Date();
			var cDate = nDate.setDate(newDate.getDate() - 90);
			var cfDate = new Date(cDate);
			var dte = cfDate.getDate();
			var dYear = cfDate.getFullYear();
			var dMn = cfDate.getMonth() + 1;
			var secondDate = dYear + "-" + dMn + "-" + dte + "T00:00:00";
			mHeaderDetails.setProperty("/dateValue", cfDate);
			mHeaderDetails.setProperty("/dashComp", object.dashComp);
			mHeaderDetails.setProperty("/dashVendor", object.dashVendor);
			mHeaderDetails.setProperty("/multiPOdashVendor", object.multiPOdashVendor);
			//mHeaderDetails.setProperty("/VendorID", object.VendorID);
			mHeaderDetails.setProperty("/invoicetype", object.invoicetype);
			mHeaderDetails.setProperty("/type", object.type);
			mHeaderDetails.setProperty("/selectedCompanyCode", object.selectedCompanyCode);
			//mHeaderDetails.setProperty("/SelectedVendorName", object.SelectedVendorName);
			mHeaderDetails.setProperty("/selectedCompanyName", object.selectedCompanyName);
			this.getView().setModel(oModelTb, "InvoiceProcessListSet");
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			var that = this;
			that.getCompanyData();
			//that.onPressSerachProcessPO();
			that._getUser();
			that.selectedObjects = [];
			that.selectedTab = "keyposearch";
		},
		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("draftInboxView");
		},
		_getUser: function () {
			var url = "SPUserDetails/v1/sayHello";
			var that = this;
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						var oUserModel = new sap.ui.model.json.JSONModel();
						that.getView().setModel(oUserModel, "oUserModel");
						that.getView().getModel("oUserModel").setProperty("/userID", result["logon name"]);
						that.getView().getModel("oUserModel").setProperty("/email", result.email);
						that.getUserAttribute();
						that.selectedTab = "keyposearch";
						that._getPersonalizationDetails(that.selectedTab);
					}
				});
		},
		getUserAttribute: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var userId = this.getView().getModel("oUserModel").getProperty("/userID");
			var url = "VendorReturns/user/" + userId;
			var that = this;
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						var vendorId = result["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
						if (vendorId === "*") {
							vendorId = "";
							var vendorName = "";
							mHeaderDetails.setProperty("/VendorID", vendorId);
							mHeaderDetails.setProperty("/dashVendor", null);
							mHeaderDetails.setProperty("/SelectedVendorName", vendorName);
						} else {

							var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/vendordetailsSet?$filter=Vendorno eq  '" + vendorId +
								"'";
							jQuery
								.ajax({
									url: url,
									type: "GET",
									dataType: "json",
									success: function (result) {
										var vendorName = result.d.results[0].VendorName;
										mHeaderDetails.setProperty("/VendorID", vendorId);
										mHeaderDetails.setProperty("/SelectedVendorName", vendorName);
									}
								});
						}
						that.onPressSerachProcessPO();
					}
				});
		},
		onPressCollapse: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", false);
		},
		onPressOpen: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
		},
		onChangeVendor: function (oEvt) {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var value = oEvt.getSource().getProperty("value");
			if (value === "") {
				mHeaderDetails.setProperty("/SelectedVendorName", "");
				mHeaderDetails.setProperty("/VendorID", "");
				mHeaderDetails.setProperty("/dashVendor", null);
			}
		},
		onCompanycodeChange: function (oEvt) {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var cName = oEvt.getSource().getProperty("value");
			mHeaderDetails.setProperty("/selectedCompany", cName);
			mHeaderDetails.refresh();
		},
		searchVendorAddr: function (oEvt) {
			var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var vendorId = oEvt.getParameter("selectedItem").getProperty("text");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/SelectedVendorName", sVendorName);
			mHeaderDetails.setProperty("/VendorID", vendorId);
			mHeaderDetails.setProperty("/dashVendor", "-");
			mHeaderDetails.refresh(true);
		},
		searchMultiPOVendor: function (oEvt) {
			var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var vendorId = oEvt.getParameter("selectedItem").getProperty("text");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/multiPOVendorName", sVendorName);
			mHeaderDetails.setProperty("/multiPOVendorID", vendorId);
			mHeaderDetails.setProperty("/multiPOdashVendor", "-");
			mHeaderDetails.refresh(true);
		},
		searchCompanyCode: function (oEvt) {
			var sCompName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var compCode = oEvt.getParameter("selectedItem").getProperty("text");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/selectedCompanyCode", compCode);
			mHeaderDetails.setProperty("/selectedCompanyName", sCompName);
			mHeaderDetails.setProperty("/dashComp", "-");
			mHeaderDetails.refresh(true);
		},
		toggleFooter: function () {
			var oObjectPageLayout = this.getView().byId("ObjectPageLayout");
			oObjectPageLayout.setShowFooter(!oObjectPageLayout.getShowFooter());
		},
		changePONONpo: function (oEvent) {
			var txt = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/invoicetype", txt);
		},
		changeType: function (oEvent) {
			var txt = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/type", txt);
		},
		fnVendorIdSuggest: function (oEvent) {
			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "searchVendorModel");
			var value = oEvent.getParameter("suggestValue");
			if (value && value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'and ConvertFlag eq 'X'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},
		fnCompanyCodeSuggest: function (oEvent) {
			var mCompanyModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mCompanyModel, "mCompanyModel");
			var value = oEvent.getParameter("suggestValue");
			if (value && value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV/CompanyCodeSet";
				mCompanyModel.loadData(url, null, true);
				mCompanyModel.attachRequestCompleted(null, function () {
					mCompanyModel.refresh();
				});
			}
		},
		onPressResetProcessPO: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/dateValue", null);
			mHeaderDetails.setProperty("/selectedCompanyName", "");
			mHeaderDetails.setProperty("/selectedCompanyCode", "");
			mHeaderDetails.setProperty("/VendorID", "");
			mHeaderDetails.setProperty("/SelectedVendorName", "");
			mHeaderDetails.setProperty("/dashComp", null);
			mHeaderDetails.setProperty("/dashVendor", null);
			var data = this.getView().getModel("MasterListHeaderSet").getData();
			data.PONo = "";
			data.InvoiceNo = "";
			data.InvoiceDate = null;
			data.InvoiceDateTo = null;
			data.ASNNo = "";
			data.VendorId = "";
			data.VendorName = "";
			data.Status = "";
			data.Amount = "";
			data.AmountTo = "";
			this.getView().getModel("MasterListHeaderSet").refresh();
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			var aEmpty = [];
			poHeaderSet.setProperty("/results", aEmpty);
			var count = 0;
			poHeaderSet.setProperty("/count", count);
		},
		onIconTabChange: function (oEvent) {
			var oTab = oEvent.getSource().getProperty("selectedKey");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			if (oTab === "SinglePO") {
				this.onPressSerachProcessPO();
			}
		},
		onSelectPO: function (oEvent) {
			var sPath = oEvent.getSource().getSelectedContextPaths()[0];
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			var aSelectedObj = poHeaderSet.getProperty(sPath);
			var status = aSelectedObj.StatusDescription;
			if (status === "RECEIVED - PARTIAL" || status === "INVOICED - PARTIAL" || status === "RECEIVED - FULL") {
				this.getView().getModel("baseModel").setProperty("/createEinvoicebtn", true);
			} else {
				this.getView().getModel("baseModel").setProperty("/createEinvoicebtn", false);
			}
		},
		onPressResetSearchPO: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/multiPOCompanyCode", "");
			mHeaderDetails.setProperty("/multiPOVendorID", "");
			mHeaderDetails.setProperty("/multiPOVendorName", "");
			mHeaderDetails.setProperty("/dashVendor", null);
			mHeaderDetails.setProperty("/multiPOdashVendor", null);
			mHeaderDetails.refresh();
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			var aEmpty = [];
			poHeaderSet.setProperty("/results", aEmpty);
			var count = 0;
			poHeaderSet.setProperty("/count", count);
		},
		onPressSerachPO: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var compCode = mHeaderDetails.getProperty("/multiPOCompanyCode");
			var vendor = mHeaderDetails.getProperty("/multiPOVendorID");
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			var that = this;
			if (vendor && compCode) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"poresults": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().poresults;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else {
				sap.m.MessageBox.error("Please Enter Company & Vendor!");
			}

		},
		onPressSerachProcessPO: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var compCode = mHeaderDetails.getProperty("/selectedCompanyCode");
			var vendor = mHeaderDetails.getProperty("/VendorID");
			var newDate = new Date();
			var firstDate;
			var secondDate;
			var fdate = false;
			var dateValue = mHeaderDetails.getProperty("/dateValue");
			var secondDateValue = mHeaderDetails.getProperty("/secondDateValue");
			if (dateValue && secondDateValue) {
				fdate = true;
			} else {
				fdate = false;
			}
			if (dateValue) {
				var year = dateValue.getFullYear();
				var month = dateValue.getMonth() + 1;
				var date = dateValue.getDate();
				firstDate = year + "-" + month + "-" + date + "T00:00:00";
			}
			/* else {
				var fdate = newDate.getDate();
				var fyear = newDate.getFullYear();
				var fmon = newDate.getMonth() + 1;
				firstDate = fyear + "-" + fmon + "-" + fdate + "T00:00:00";
				mHeaderDetails.setProperty("/dateValue", newDate);
			}*/
			if (secondDateValue) {
				var sYear = secondDateValue.getFullYear();
				var sMonth = secondDateValue.getMonth() + 1;
				var sDate = secondDateValue.getDate();
				secondDate = sYear + "-" + sMonth + "-" + sDate + "T00:00:00";
			}
			/*else {
				var nDate = new Date();
				var cDate = nDate.setDate(newDate.getDate() - 90);
				var cfDate = new Date(cDate);
				var dte = cfDate.getDate();
				var dYear = cfDate.getFullYear();
				var dMn = cfDate.getMonth() + 1;
				secondDate = dYear + "-" + dMn + "-" + dte + "T00:00:00";
				mHeaderDetails.setProperty("/secondDateValue", cfDate);
			}*/
			var that = this;
			var data = this.getView().getModel("MasterListHeaderSet").getData();
			var poNumber = data.PONo;
			var status = data.Status;
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			/*if (fdate) {*/

			//Status is NOT present 
			if (dateValue && (poNumber === "" ||
					poNumber === undefined) && (compCode === undefined || compCode === "" || compCode === null) && (vendor === undefined || vendor ===
					"") && (status === undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate +
						"' and Date ge datetime'" + firstDate + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];

						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
				//Status is NOT present 
			} else if (poNumber && (vendor === undefined || vendor === "") && (fdate === false) && (compCode === undefined || compCode === "" ||
					compCode === null) && (status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (compCode && (vendor === undefined || vendor === "") && (poNumber === undefined || poNumber === "") && (fdate === false) &&
				(status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Company_Code  eq'" + compCode + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];

						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (vendor && (poNumber === undefined || poNumber === "") && (fdate === false) && (compCode === undefined || compCode === "" ||
					compCode === null) && (status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});

			}
			//Status is NOT present 
			else if (vendor && poNumber && (fdate === false) && (compCode === undefined || compCode === "" ||
					compCode === null) && (status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (vendor && compCode && (fdate === false) && (poNumber === undefined || poNumber === "") && (status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (poNumber && compCode && (fdate === false) && (status ===
					undefined || status === "") && (vendor ===
					undefined || vendor === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Purch_Ord  eq '" + poNumber + "' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (vendor && poNumber && compCode && (fdate === false) && (status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "'and Purch_Ord  eq '" + poNumber + "' and Company_Code  eq '" + compCode +
						"'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (dateValue && poNumber && (vendor === undefined || vendor === "") && (compCode === undefined || compCode === "" ||
					compCode === null) &&
				(status ===
					undefined || status === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is NOT present 
			else if (dateValue && compCode && (poNumber === "" ||
					poNumber === undefined) && (vendor === undefined || vendor === "") && (
					status === "" || status === undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Company_Code  eq'" + compCode + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();

						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is present 
			else if (dateValue && compCode && status && (poNumber === "" ||
					poNumber === undefined) && (vendor === undefined || vendor === "")) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Company_Code  eq'" + compCode + "' and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is present 
			else if (dateValue && status && poNumber && (vendor === undefined || vendor === "") && (compCode === undefined || compCode ===
					"" || compCode === null)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Purch_Ord  eq '" + poNumber + "' and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is present 
			else if (dateValue && status && (poNumber === "" ||
					poNumber === undefined) && (vendor === undefined || vendor === "") && (compCode === undefined || compCode === "" || compCode ===
					null)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						if (poHeaderSet) {
							var aEmpty = [];
							poHeaderSet.setProperty("/results", aEmpty);
						}
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is present 
			else if (dateValue && status && vendor && (poNumber === "" ||
					poNumber === undefined) && (compCode === undefined || compCode === "" || compCode === null)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "' and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						if (poHeaderSet) {
							var aEmpty = [];
							poHeaderSet.setProperty("/results", aEmpty);
						}
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is present 
			else if (dateValue && compCode && status && vendor && (poNumber === "" ||
					poNumber === undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode +
						"'and Vendor eq '" + vendor + "' and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						if (poHeaderSet) {
							var aEmpty = [];
							poHeaderSet.setProperty("/results", aEmpty);
						}
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is not present 
			else if (dateValue && vendor && (compCode === undefined || compCode === "" || compCode === null) && (poNumber === "" || poNumber ===
					undefined) && (status === "" || status === undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is not present 
			else if (dateValue && vendor && poNumber && (status === "" || status === undefined) && (compCode === "" || compCode ===
					undefined || compCode === null)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			}
			//Status is present 
			else if (dateValue && vendor && poNumber && status && (compCode === "" || compCode === undefined || compCode === null)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();

						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});

			} else if (dateValue && compCode && vendor && (poNumber === "" || poNumber ===
					undefined) && (status === "" || status === undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" +
						compCode +
						"'and Vendor eq '" + vendor + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else if (dateValue && compCode && (poNumber === "" || poNumber ===
					undefined) && (status === "" || status === undefined) && (vendor === "" || vendor ===
					undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else if (dateValue && compCode && poNumber && (vendor === "" || vendor ===
					undefined) && (status === "" || status === undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();

						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else if (dateValue && compCode && poNumber && status && (vendor === "" || vendor ===
					undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode + "' and Purch_Ord  eq '" + poNumber + "'and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();
						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else if (dateValue && compCode && poNumber && vendor && (status === "" || status ===
					undefined)) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" +
						compCode +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();

						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else if (dateValue && compCode && poNumber && vendor && status) {
				that.busyDialog.open();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" +
						compCode +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'and Status  eq '" + status + "'",
					success: function (oData) {
						if (oData.results) {
							for (var k = 0; k < oData.results.length; k++) {
								if (oData.results[k].StatusDescription === "INVOICED - FULL") {
									oData.results[k].StatusState = "Success";
								} else if (oData.results[k].StatusDescription === "OPEN") {
									oData.results[k].StatusState = "None";
								} else if (oData.results[k].StatusDescription === "BLOCKED") {
									oData.results[k].StatusState = "Error";
								} else if (oData.results[k].StatusDescription === "REQUIRES CONFIRMATION" || oData.results[k].StatusDescription ===
									"RECEIVED - PARTIAL" || oData.results[k].StatusDescription === "INVOICED - PARTIAL" || oData.results[k].StatusDescription ===
									"RECEIVED - FULL") {
									oData.results[k].StatusState = "Indication03";
								} else {
									oData.results[k].StatusState = "None";
								}
							}
						}
						that.busyDialog.close();

						var poHeaderSet = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(poHeaderSet, "poHeaderSet");
						var headerItems = that.getView().getModel("poHeaderSet").getData().results;
						var count = headerItems.length;
						poHeaderSet.setProperty("/count", count);
						for (var i = 0; i < headerItems.length; i++) {
							headerItems[i].status = "Ready";
							headerItems[i].Date = headerItems[i].Date.split("T")[0];
						}
						that.getView().getModel("poHeaderSet").refresh();
					},
					error: function (oError) {
						that.busyDialog.close();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else {
				sap.m.MessageBox.warning("Please Enter A Date Range!");
			}
		},
		onPressDisplay: function (oEvent) {

			var poHeaderSet = this.getView().getModel("poHeaderSet");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			//	var selectedObject = this.getView().byId("ID_TBL_PI_INVOICE111").getSelectedContexts()[0].getObject();
			var sPath = oEvent.getSource().getBindingContext("poHeaderSet").getPath();
			var selectedObject = poHeaderSet.getProperty(sPath);
			mHeaderDetails.setProperty("/Purch_Ord", selectedObject.Purch_Ord);
			mHeaderDetails.setProperty("/Company_Code", selectedObject.Company_Code);
			mHeaderDetails.setProperty("/vendorID", selectedObject.Vendor);
			mHeaderDetails.setProperty("/vendorName", selectedObject.VendorName);
			mHeaderDetails.setProperty("/POdate", selectedObject.Date);
			mHeaderDetails.setProperty("/Statusdesc", selectedObject.StatusDescription);
			mHeaderDetails.setProperty("/Purch_Org", selectedObject.Purch_Org);
			mHeaderDetails.setProperty("/Purch_OrgName", selectedObject.Purch_OrgName);
			selectedObject.page1Status = this.getView().getModel("MasterListHeaderSet").getData().Status;
			var oModel = new sap.ui.model.json.JSONModel(selectedObject);
			this.getOwnerComponent().setModel(oModel, "selectedObject");
			this.getView().byId("ID_TBL_PI_INVOICE111").removeSelections(true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("displayPOdetails");
			/*	} else {
					MessageBox.error("Please Select PO!");
				}*/
		},
		getCompanyData: function () {
			var that = this;
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			oPODetailModel.read("/CompanyCodeSet", {
				success: function (oData) {
					var mCompanyModel = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(mCompanyModel, "mCompanyModel");
				},
				error: function (oError) {

				}
			});
		},
		/*onClickSubmit: function (oEvent) {
			
			var oTable = this.getView().byId("ID_TBL_PI_INVOICE111");
			var aIndex = oTable.getSelectedContextPaths();
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			if (aIndex.length === 1) {
				
				var selectedObject = this.getView().byId("ID_TBL_PI_INVOICE111").getSelectedContexts()[0].getObject();
				mHeaderDetails.setProperty("/Purch_Ord", selectedObject.Purch_Ord);
				mHeaderDetails.setProperty("/vendorID", selectedObject.Vendor);
				mHeaderDetails.setProperty("/vendorName", selectedObject.VendorName);
				mHeaderDetails.setProperty("/Company_Code", selectedObject.Company_Code);
				mHeaderDetails.setProperty("/CompanyName", selectedObject.CompanyName);
				selectedObject.totalAmount = "0";
				selectedObject.taxAmount = "0";
				selectedObject.PODate = this.getView().getModel("MasterListHeaderSet").getData().PODate;
				selectedObject.page1Status = this.getView().getModel("MasterListHeaderSet").getData().Status;
				var oModel = new sap.ui.model.json.JSONModel(selectedObject);
				this.getOwnerComponent().setModel(oModel, "selectedObject");
				this.getView().byId("ID_TBL_PI_INVOICE111").removeSelections(true);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("invoiceCreate");
			} else if (aIndex.length > 1) {
				var selectedObject = {
					"aselectedItems": []
				};
				var aItems = [];
				for (var i = 0; i < aIndex.length; i++) {
					var item = poHeaderSet.getProperty(aIndex[i]);
					aItems.push(item);
				}
				var aCompanyData = aItems.map(function (oRow, index) {
					return oRow.CompanyName === oRow.CompanyName;
				});
				var aVendorData = aItems.map(function (oRow, index) {
					return oRow.VendorName === oRow.VendorName;
				});
				var bVendorflag = false;
				var bCompanyflag = false;
				for (var j = 0; j < aVendorData.length; j++) {
					if (aVendorData[j] === false) {
						bVendorflag = true;
					}
				}
				for (var j = 0; j < aCompanyData.length; j++) {
					if (aCompanyData[j] === false) {
						bCompanyflag = true;
					}
				}
				if (bCompanyflag === false && bVendorflag === false) {
					var arowColumn = aItems.find(function (oRow, index) {
						return oRow.VendorName;
					});
					mHeaderDetails.setProperty("/Purch_Ord", arowColumn.Purch_Ord);
					mHeaderDetails.setProperty("/vendorID", arowColumn.Vendor);
					mHeaderDetails.setProperty("/vendorName", arowColumn.VendorName);
					mHeaderDetails.setProperty("/Company_Code", arowColumn.Company_Code);
					mHeaderDetails.setProperty("/CompanyName", arowColumn.CompanyName);
					selectedObject.totalAmount = "0";
					selectedObject.taxAmount = "0";
					selectedObject.aselectedItems = aItems;
					selectedObject.PODate = this.getView().getModel("MasterListHeaderSet").getData().PODate;
					selectedObject.page1Status = this.getView().getModel("MasterListHeaderSet").getData().Status;
					var oModel = new sap.ui.model.json.JSONModel(selectedObject);
					this.getOwnerComponent().setModel(oModel, "selectedObject");
					this.getView().byId("ID_TBL_PI_INVOICE111").removeSelections(true);
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("multiPOinvoicecreate");
				}
			}
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			MasterListHeaderSet.setProperty("/VendorId", "");
			MasterListHeaderSet.setProperty("/VendorName", "");
		},*/
		onClickSubmit: function (oEvent) {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var selectedObject = this.getView().byId("ID_TBL_PI_INVOICE111").getSelectedContexts()[0].getObject();
			mHeaderDetails.setProperty("/Purch_Ord", selectedObject.Purch_Ord);
			mHeaderDetails.setProperty("/vendorID", selectedObject.Vendor);
			mHeaderDetails.setProperty("/vendorName", selectedObject.VendorName);
			mHeaderDetails.setProperty("/Company_Code", selectedObject.Company_Code);
			mHeaderDetails.setProperty("/CompanyName", selectedObject.CompanyName);
			selectedObject.totalAmount = "0";
			selectedObject.taxAmount = "0";
			selectedObject.PODate = this.getView().getModel("MasterListHeaderSet").getData().PODate;
			selectedObject.page1Status = this.getView().getModel("MasterListHeaderSet").getData().Status;
			var oModel = new sap.ui.model.json.JSONModel(selectedObject);
			this.getOwnerComponent().setModel(oModel, "selectedObject");
			this.getView().byId("ID_TBL_PI_INVOICE111").removeSelections(true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("invoiceCreate");
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			MasterListHeaderSet.setProperty("/VendorId", "");
			MasterListHeaderSet.setProperty("/VendorName", "");
		},
		onPressNextProcessInvoice: function () {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var mHeaderDetailsData = mHeaderDetails.getData();
			var oTable = this.getView().byId("ID_TBL_PI_INVOICE111");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				if (!this.createMemoFrag) {
					this.createMemoFrag = sap.ui.xmlfragment("com.incture.CreateEInvoice.Fragments.createMemoFrag", this);
					this.getView().addDependent(this.createMemoFrag);
				}
				this.createMemoFrag.open();
			} else {
				MessageBox.error("Please Select PO!");
			}
		},
		OKCreditMemo: function () {
			this.onClickSubmit();
		},
		cancelCreditMemo: function () {
			this.createMemoFrag.close();
		},
		onPressPersonalization: function (oEvent) {
			var that = this;
			var PersonalizationModel = this.getView().getModel("PersonalizationModel");
			if (!this.FilterPersonalization) {
				this.FilterPersonalization = sap.ui.xmlfragment("com.incture.CreateEInvoice.Fragments.FilterPersonalization", this);
				this.getView().addDependent(this.FilterPersonalization);
			}
			var FilterPersonalization = new sap.ui.model.json.JSONModel({
				"results": this.getView().getModel("PersonalizationModel").getData()
			});
			this.FilterPersonalization.setModel(FilterPersonalization, "FilterPersonalization");
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/enableCheckBox", false);
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/selectVarVisible", true);
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/nameVarVisible", false);
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
			this.FilterPersonalization.open();
		},
		onPersonlizationClose: function () {
			var that = this;
			var PersonalizationModel = this.getView().getModel("PersonalizationModel");
			if (!this.FilterPersonalization) {
				this.FilterPersonalization = sap.ui.xmlfragment("incture.com.ConnectClient_Inventory.Fragments.FilterPersonalization", this);
				this.getView().addDependent(this.FilterPersonalization);
			}
			var FilterPersonalization = new sap.ui.model.json.JSONModel({
				"results": this.getView().getModel("PersonalizationModel").getData()
			});
			this.FilterPersonalization.setModel(FilterPersonalization, "FilterPersonalization");
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/selectVarVisible", true);
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/nameVarVisible", false);
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/enableCheckBox", false);
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/okPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/okPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/savePersBtnVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/cancelPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/deletePersBtnVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/createPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/editPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/varinatNameValueState", "None");
			this.selectedObjects = [];
			this.getView().getModel("PersonalizationModel").refresh();
			this.FilterPersonalization.close();
			this.selectedTab = "keyposearch";
			this._getPersonalizationDetails(this.selectedTab);
		},
		onVariantOK: function () {

			var that = this;
			var PersonalizationModel = this.getView().getModel("PersonalizationModel");
			if (!this.FilterPersonalization) {
				this.FilterPersonalization = sap.ui.xmlfragment("incture.com.ConnectClient_Inventory.Fragments.FilterPersonalization", this);
				this.getView().addDependent(this.FilterPersonalization);
			}
			var FilterPersonalization = new sap.ui.model.json.JSONModel({
				"results": this.getView().getModel("PersonalizationModel").getData()
			});
			this.FilterPersonalization.setModel(FilterPersonalization, "FilterPersonalization");
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/selectVarVisible", true);
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/nameVarVisible", false);
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/enableCheckBox", false);
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
			this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/okPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/savePersBtnVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/cancelPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/deletePersBtnVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/createPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/editPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/varinatNameValueState", "None");
			this.selectedObjects = [];
			this.getView().getModel("PersonalizationModel").refresh();
			this.FilterPersonalization.close();
		},

		_getPersonalizationDetails: function (tabName) {

			var that = this;
			var screen = "Web";
			if (sap.ui.Device.system.phone === true) {
				screen = "Phone";
			}
			var url = "InctureApDest/variant/getVariant";
			var payload = {
				"userId": this.getView().getModel("oUserModel").getData().userID,
				"appId": tabName,
				"runType": screen,
				"emailId": this.getView().getModel("oUserModel").getData().email
			};

			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			this._doAjax(url, "POST", payload, true).then(success => {
				busyDialog.close();
				if (success.userPersonaDto !== null) {
					that.getView().getModel("PersonalizationModel").setProperty("/personalizationData", success);
					that.getView().getModel("tabPersonalizationModel").setProperty("/personalizationData", success);
					// this.tabFrag.setModel(that.getView().getModel("tabPersonalizationModel"), "tabPersonalizationModel");
					// this.tabFrag.getModel("tabPersonalizationModel").refresh();
					that.getView().getModel("tabPersonalizationModel").refresh(); // that.EndingStock.getModel("PersonalizationModel").setProperty("/fields", success.userPersonaDto);
					that.getView().getModel("PersonalizationModel").refresh();
					that.getView().getModel("PersonalizationModel").setProperty("/okPersBtnVisible", true);
					that.getView().getModel("PersonalizationModel").setProperty("/savePersBtnVisible", false);
					that.getView().getModel("PersonalizationModel").setProperty("/cancelPersBtnVisible", true);
					that.getView().getModel("PersonalizationModel").setProperty("/deletePersBtnVisible", false);
					that.getView().getModel("PersonalizationModel").setProperty("/createPersBtnVisible", true);
					that.getView().getModel("PersonalizationModel").setProperty("/editPersBtnVisible", true);
					that.getView().getModel("PersonalizationModel").setProperty("/varinatNameValueState", "None");
					that.getView().getModel("PersonalizationModel").refresh();
				}
			}, fail => {
				busyDialog.close();
				MessageBox.error(fail.responseText);
			});
		},
		onChangeCheckbox: function (oEvent) {

			var personalizationData = this.FilterPersonalization.getModel("FilterPersonalization").getData().results.personalizationData.userPersonaDto;
			var path = parseInt(oEvent.getSource().getBindingContext("FilterPersonalization").getPath().split("/")[3]);
			if (oEvent.getSource().getSelected() === true) {
				for (var j = 0; j < personalizationData.length; j++) {
					if (j === path) {
						personalizationData[j].status = "true";
					}
					if (this.FilterPersonalization.getModel("FilterPersonalization").getProperty("/results/action") === "Create") {
						personalizationData[j].id = "";
					}
					this.selectedObjects = personalizationData;
				}
			} else {
				for (var i = 0; i < personalizationData.length; i++) {
					if (i === path) {
						personalizationData[i].status = "false";
					}
				}
				this.selectedObjects = personalizationData;
			}
		},
		onVariantSave: function (oEvent) {

			if (this.selectedObjects.length === 0) {
				MessageToast.show("Save only after edit");
				return;
			}
			var that = this;
			var selected = oEvent.getSource();
			var PersonalizationModel = this.FilterPersonalization.getModel("FilterPersonalization");
			if (PersonalizationModel.getProperty("/results/action") === "Create") {
				if (PersonalizationModel.getData().results.newVariantName !== undefined && PersonalizationModel.getData().results.newVariantName !==
					"") {
					for (var j = 0; j < PersonalizationModel.getData().results.personalizationData.variantName.length; j++) {
						if (PersonalizationModel.getData().results.personalizationData.variantName[j].name === PersonalizationModel.getData().results.newVariantName) {
							this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/varinatNameValueState", "Error");
							MessageBox.error("New variant name cannot be same as the existing variant");
							return;
						}
					}

					this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/varinatNameValueState", "None");
					var VariantName = PersonalizationModel.getData().results.newVariantName;
					for (var i = 0; i < this.selectedObjects.length; i++) {
						this.selectedObjects[i].variantId = VariantName;
					}

				} else {
					this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/varinatNameValueState", "Error");
					sap.m.MessageBox.error("Enter a Variant Name");
					return;
				}
			}
			var screen = "Web";
			if (sap.ui.Device.system.phone === true) {
				screen = "Phone";
			}
			var pID = this.getView().getModel("oUserModel").getData().userID;
			var tab = "keyposearch";
			var varinatName;
			// var pID = "P0001";
			var payload = {
				"varaiantObject": this.selectedObjects,
				"userId": pID,
				"applicationId": tab,
				"varaintId": this.selectedObjects[0].variantId,
				"runType": screen
			};
			var url = "InctureApDest/variant/UpdateVariant";
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			this._doAjax(url, "PUT", payload).then(success => {
				busyDialog.close();
				this.selectedObjects = [];
				PersonalizationModel.setProperty("/results/selectVarVisible", true);
				PersonalizationModel.setProperty("/results/nameVarVisible", false);
				PersonalizationModel.setProperty("/results/enableCheckBox", false);
				PersonalizationModel.setProperty("/results/savePersBtnVisible", false);
				PersonalizationModel.setProperty("/results/okPersBtnVisible", true);
				// this.getView().getModel("PersonalizationModel").setProperty("/", true);
				that.FilterPersonalization.getModel("FilterPersonalization").refresh();

				that.FilterPersonalization.close();
				// var message = oNewEvent.getSource().getData().message;
				sap.m.MessageBox.success("Created Successfully!", {
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {

						if (sAction === MessageBox.Action.OK) {

							that._getPersonalizationDetails(tab);
						}
					}
				});
				// this.EndingStock.getModel("PersonalizationModel").setProperty("/fields", success.userPersonaDto);
				// this.getView().getModel("PersonalizationModel").setProperty("/fields", success.userPersonaDto);
				// this.getView().getModel("PersonalizationModel").setProperty("/variants", success.variantName);
				// this.EndingStock.getModel("PersonalizationModel").setProperty("/variants", success.variantName);
				// this.EndingStock.getModel("PersonalizationModel").refresh();
				// // this.getView().getModel("baseModel").setProperty("/enableCheckBox", false);
				// this.getView().getModel("PersonalizationModel").refresh();
			}, fail => {
				busyDialog.close();
				MessageBox.error(fail.responseText);
				that.FilterPersonalization.close();
			});
		},
		onVariantDelete: function () {

			var that = this;
			var pID = this.getView().getModel("oUserModel").getData().userID;
			var data = this.FilterPersonalization.getModel("FilterPersonalization").getProperty("/results/personalizationData/userPersonaDto");
			var varinatName;
			var payload = {
				"varaiantObject": data,
				"userId": pID,
				"applicationId": this.selectedTab,
				"varaintId": this.FilterPersonalization.getModel("FilterPersonalization").getProperty(
					"/results/personalizationData/userPersonaDto")[0].variantId,
				"runType": "Web"
			};

			var url = "InctureApDest/variant/deleteVariant";
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			this._doAjax(url, "DELETE", payload).then(success => {
				busyDialog.close();
				that.FilterPersonalization.close();
				// var message = oNewEvent.getSource().getData().message;
				sap.m.MessageBox.success(success.name, {
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						if (sAction === MessageBox.Action.OK) {
							that._getPersonalizationDetails(that.selectedTab);
						}
					}
				});
				// this.getView().getModel("baseModel").setProperty("/enableCheckBox", false);
				// this.getView().getModel("PersonalizationModel").refresh();
			}, fail => {
				that._getPersonalizationDetails(that.selectedTab);
				that.FilterPersonalization.close();
				busyDialog.close();
				MessageBox.error(fail.responseText);
			});
		},
		onVariantCreate: function () {

			var PersonalizationModel = this.FilterPersonalization.getModel("FilterPersonalization");
			PersonalizationModel.setProperty("/results/action", "Create");
			PersonalizationModel.setProperty("/results/selectVarVisible", false);
			PersonalizationModel.setProperty("/results/nameVarVisible", true);
			PersonalizationModel.setProperty("/results/enableCheckBox", true);
			PersonalizationModel.setProperty("/results/okPersBtnVisible", false);
			// this.FilterPersonalization.getModel("FilterPersonalization").setProperty("/okPersBtnVisible", false);
			PersonalizationModel.setProperty("/results/savePersBtnVisible", true);
			PersonalizationModel.setProperty("/results/newVariantName", "");
			var fieldData = PersonalizationModel.getData().results.personalizationData.userPersonaDto;
			for (var i = 0; i < fieldData.length; i++) {
				fieldData[i].status = false;
			}
			PersonalizationModel.setProperty("/results/personalizationData/userPersonaDto", fieldData);
			this.FilterPersonalization.getModel("FilterPersonalization").refresh();
		},
		onVariantEdit: function () {

			var PersonalizationModel = this.FilterPersonalization.getModel("FilterPersonalization");
			if (PersonalizationModel.getData().results.personalizationData.currentVariant === "Default") {
				MessageToast.show("Cannot edit default variant");
				return;
			}
			PersonalizationModel.setProperty("/results/action", "Edit");
			PersonalizationModel.setProperty("/results/okPersBtnVisible", false);
			// this.getView().getModel("PersonalizationModel").setProperty("/okPersBtnVisible", false);
			PersonalizationModel.setProperty("/results/enableCheckBox", true);
			PersonalizationModel.setProperty("/results/savePersBtnVisible", true);
			PersonalizationModel.setProperty("/results/deletePersBtnVisible", true);
			PersonalizationModel.setProperty("/results/selectVarVisible", true);
			PersonalizationModel.setProperty("/results/nameVarVisible", false);
			PersonalizationModel.refresh();
			this.onSelectvarian();
			MessageToast.show("Select a variant to edit");
		},
		onSelectvarian: function (oEvent) {

			var screen = "Web";
			if (sap.ui.Device.system.phone === true) {
				screen = "Phone";
			}
			var that = this;
			var pID = this.getView().getModel("oUserModel").getData().userID;
			this.selectedTab = "keyposearch";
			if (oEvent) {
				var varinatName = oEvent.getSource().getSelectedKey();
			} else {
				var varinatName = that.getView().getModel("PersonalizationModel").getProperty("/personalizationData/currentVariant");
			}
			var url = "InctureApDest/variant/getvariantLists/" + pID + "/" + this.selectedTab + "/" + varinatName + "/" + screen;
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			this._doAjax(url, "GET").then(success => {
				busyDialog.close();
				var success = success.userPersonaDto;

				if (this.FilterPersonalization.getModel("FilterPersonalization").getProperty("/results/action") === "Edit") {
					that.getView().getModel("PersonalizationModel").setProperty("/personalizationData/userPersonaDto", success);
					that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/personalizationData/userPersonaDto",
						success);
					that.FilterPersonalization.getModel("FilterPersonalization").refresh();
					that.getView().getModel("PersonalizationModel").refresh();
					if (that.FilterPersonalization.getModel("FilterPersonalization").getProperty("/results/personalizationData/currentVariant") ===
						"Default") {
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/action", "");
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/enableCheckBox", false);
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/savePersBtnVisible", false);
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/okPersBtnVisible", true);
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/deletePersBtnVisible", false);
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/selectVarVisible", true);
						that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/nameVarVisible", false);
						MessageToast.show("Cannot edit default variant");
						that.FilterPersonalization.getModel("FilterPersonalization").refresh();
					}
				} else {
					// that.tabFrag.getModel("tabPersonalizationModel").setProperty("/personalizationData/userPersonaDto", success);

					that.getView().getModel("PersonalizationModel").setProperty("/personalizationData/userPersonaDto", success);
					that.FilterPersonalization.getModel("FilterPersonalization").setProperty("results/personalizationData/userPersonaDto",
						success);
					that.FilterPersonalization.getModel("FilterPersonalization").refresh();
					that.getView().getModel("PersonalizationModel").refresh();
					// that.tabFrag.getModel("tabPersonalizationModel").refresh();
					// that.FilterPersonalization.close();
				}
			}, fail => {
				busyDialog.close();
				MessageBox.error(fail.responseText);
				// that.onPersonlizationClose();
			});
		}
	});
});