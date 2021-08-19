sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"incture/com/APCreateInvoice/util/Formatter"
], function (Controller, MessageBox, MessageToast, Filter, FilterOperator, Formatter) {
	"use strict";
	return Controller.extend("incture.com.APCreateInvoice.controller.purchaseOrder", {
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
			var PersonalizationModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(PersonalizationModel, "PersonalizationModel");
			var tabPersonalizationModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(tabPersonalizationModel, "tabPersonalizationModel");
			this.getView().getModel("PersonalizationModel").setProperty("/selectVarVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/nameVarVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/enableCheckBox", false);
			this.getView().getModel("PersonalizationModel").setProperty("/okPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/savePersBtnVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/cancelPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/deletePersBtnVisible", false);
			this.getView().getModel("PersonalizationModel").setProperty("/createPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/editPersBtnVisible", true);
			this.getView().getModel("PersonalizationModel").setProperty("/varinatNameValueState", "None");
			this.getView().getModel("PersonalizationModel").refresh();
			this.busyDialog = new sap.m.BusyDialog({
				text: "Please Wait"
			});
			var mFilterModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mFilterModel, "mFilterModel");
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
				VendorID: "300866",
				Amount: "",
				PONo: "",
				selectedCompanyCode: "",
				selectedInv: false,
				selectedCre: false,
				selectedDeb: false,
				Status: ""
			};
			var MasterListHeaderSet = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(MasterListHeaderSet, "MasterListHeaderSet");

			var oModelTb = new sap.ui.model.json.JSONModel({
				"results": []
			});
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			this.getOwnerComponent().getModel("mHeaderDetails").setProperty("/createEinvoiceBtnVisiblity", false);
			this.getOwnerComponent().getModel("mHeaderDetails").setProperty("/PoConfirmBtnVisiblity", false);
			var object = {
				"invoicetype": "PO",
				"type": "Invoice",
				//	"VendorID": "300866",
				"selectedCompanyCode": "PACR",
				//	"SelectedVendorName": "Convergint Technologies",
				"selectedCompanyName": "PACCAR ITD",
				"dashComp": "-",
				"dashVendor": "-"
			};
			var newDate = new Date();
			mHeaderDetails.setProperty("/maxDate", newDate);
			var fdate = newDate.getDate();
			var fyear = newDate.getFullYear();
			var fmon = newDate.getMonth() + 1;
			var firstDate = fyear + "-" + fmon + "-" + fdate + "T00:00:00";
			//mHeaderDetails.setProperty("/dateValue", newDate);
			if (!mHeaderDetails.getProperty("/secondDateValue")) {
				mHeaderDetails.setProperty("/secondDateValue", newDate);
			}
			var nDate = new Date();
			var cDate = nDate.setDate(newDate.getDate() - 90);
			var cfDate = new Date(cDate);
			var dte = cfDate.getDate();
			var dYear = cfDate.getFullYear();
			var dMn = cfDate.getMonth() + 1;
			var secondDate = dYear + "-" + dMn + "-" + dte + "T00:00:00";
			if (!mHeaderDetails.getProperty("/dateValue")) {
				mHeaderDetails.setProperty("/dateValue", cfDate);
			}
			mHeaderDetails.setProperty("/dashComp", object.dashComp);
			if (mHeaderDetails.getProperty("/dashVendor") !== null) {
				mHeaderDetails.setProperty("/dashVendor", object.dashVendor);
			}

			if (!mHeaderDetails.getProperty("/VendorID") && (mHeaderDetails.getProperty("/VendorID") !== "")) {
				//	mHeaderDetails.setProperty("/VendorID", object.VendorID);
			}
			if (!mHeaderDetails.getProperty("/SelectedVendorName") && (mHeaderDetails.getProperty("/SelectedVendorName") !== "")) {
				//	mHeaderDetails.setProperty("/SelectedVendorName", object.SelectedVendorName);
			}
			mHeaderDetails.setProperty("/invoicetype", object.invoicetype);
			mHeaderDetails.setProperty("/type", object.type);

			if (!mHeaderDetails.getProperty("/selectedCompanyCode") && (mHeaderDetails.getProperty("/selectedCompanyCode") !== "")) {
				mHeaderDetails.setProperty("/selectedCompanyCode", object.selectedCompanyCode);
				mHeaderDetails.setProperty("/selectedCompanyName", object.selectedCompanyName);
			}
			mHeaderDetails.setProperty("/selectedCompany", object.selectedCompany);
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
		onPressCreatePO: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("createPO");
		},
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				//	var filter = new Filter("Purch_Ord", FilterOperator.Contains, sQuery);
				var oFilter = new Filter({
					filters: [
						new Filter("Purch_Ord", FilterOperator.Contains, sQuery),
						new Filter("Vendor", FilterOperator.Contains, sQuery),
						new Filter("VendorName", FilterOperator.Contains, sQuery),
						new Filter("Created_By", FilterOperator.Contains, sQuery),
						new Filter("Company_Code", FilterOperator.Contains, sQuery),
						new Filter("CompanyName", FilterOperator.Contains, sQuery),
						new Filter("Created_By", FilterOperator.Contains, sQuery),
						new Filter("StatusDescription", FilterOperator.Contains, sQuery),
					]
				});
			}
			var oList = this.getView().byId("ID_TBL_PI_INVOICE111");
			var oBinding = oList.getBinding("items");
			oBinding.filter(oFilter, "Application");
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
					async: true,
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
					async: true,
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
									async: true,
									success: function (result) {
										var vendorName = result.d.results[0].VendorName;
										mHeaderDetails.setProperty("/VendorID", vendorId);
										mHeaderDetails.setProperty("/SelectedVendorName", vendorName);
									},
									error: function (oError) {
										$("#splash-screen").remove();
									}
								});
						}
						that.onPressSerachProcessPO();
					},
					error: function (oError) {
						$("#splash-screen").remove();
					}

				});
		},
		onPressCollapse: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", false);
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
		/*	onCompanycodeChange: function (oEvt) {
				var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
				var cName = oEvt.getSource().getProperty("value");
				var cCode = oEvt.getSource().getProperty("selectedKey");
				var sKey = cName + cCode;
				mHeaderDetails.setProperty("/selectedCompany", sKey);
				mHeaderDetails.setProperty("/selectedCompanyCode", cCode);
				mHeaderDetails.setProperty("/selectedCompanyName", cName);
				mHeaderDetails.refresh();
			},*/
		searchVendorAddr: function (oEvt) {
			var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var vendorId = oEvt.getParameter("selectedItem").getProperty("text");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/SelectedVendorName", sVendorName);
			mHeaderDetails.setProperty("/VendorID", vendorId);
			mHeaderDetails.setProperty("/dashVendor", "-");
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
			mHeaderDetails.setProperty("/secondDateValue", null);
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
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			var data = this.getView().getModel("MasterListHeaderSet").getData();
			var poNumber = data.PONo;
			var status;
			if (mHeaderDetails.getProperty("/Status")) {
				status = mHeaderDetails.getProperty("/Status");
				MasterListHeaderSet.setProperty("/Status", status);
			} else {
				status = data.Status;
			}
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			/*if (fdate) {*/
			//Status is NOT present 
			if (dateValue && (poNumber === "" ||
					poNumber === undefined) && (compCode === undefined || compCode === "" || compCode === null) && (vendor === undefined || vendor ===
					"") && (status === undefined || status === "")) {
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate +
						"' and Date ge datetime'" + firstDate + "'",
					success: function (oData) {

						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Company_Code  eq'" + compCode + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Purch_Ord  eq '" + poNumber + "' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Vendor eq '" + vendor + "'and Purch_Ord  eq '" + poNumber + "' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Company_Code  eq'" + compCode + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();

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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Company_Code  eq'" + compCode + "' and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Purch_Ord  eq '" + poNumber + "' and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
			else if (dateValue && status && vendor && (poNumber === "" ||
					poNumber === undefined) && (compCode === undefined || compCode === "" || compCode === null)) {
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "' and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
			else if (dateValue && compCode && status && vendor && (poNumber === "" ||
					poNumber === undefined)) {
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode +
						"'and Vendor eq '" + vendor + "' and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						if (poHeaderSet.getData().results) {
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" +
						compCode +
						"'and Vendor eq '" + vendor + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();

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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" + compCode + "' and Purch_Ord  eq '" + poNumber + "'and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" +
						compCode +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();

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
						that.closeBusyDialog();
						$("#splash-screen").remove();
						var poHeaderSet = that.getView().getModel("poHeaderSet");
						var aEmpty = [];
						poHeaderSet.setProperty("/results", aEmpty);
						var res = oError.response.body.split("</message>")[0];
						var oMsg = res.slice(158, 280);
						sap.m.MessageBox.error(oMsg);
					}
				});
			} else if (dateValue && compCode && poNumber && vendor && status) {
				that.openBusyDialog();
				oPODetailModel.read("/L_EKKOSet", {
					urlParameters: "$filter=Date le datetime'" + secondDate + "' and Date ge datetime'" + firstDate +
						"' and Company_Code  eq '" +
						compCode +
						"'and Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'and Status  eq '" + status + "'",
					success: function (oData) {
						that.closeBusyDialog();
						$("#splash-screen").remove();

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
						that.closeBusyDialog();
						$("#splash-screen").remove();
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
		onOpenActivityLog: function (oEvent) {
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var sPath = oEvent.getSource().getBindingContext("poHeaderSet").getPath();
			var selectedObject = poHeaderSet.getProperty(sPath);
			mHeaderDetails.setProperty("/Statusdesc", selectedObject.StatusDescription);
			/*if (selectedObject.StatusDescription === "INVOICED - FULL") {
					var oInvoiceReciept = sap.ui.getCore().byId("InvoiceReceiptIcon");
					oInvoiceReciept.removeStyleClass("InvoiceReceiptCSS");
					oInvoiceReciept.addStyleClass("InvoiceReceiptCOLOR");
				}*/
			if (!this.fragActivityLog) {
				this.fragActivityLog = sap.ui.xmlfragment("incture.com.APCreateInvoice.Fragments.activityLog", this);
				this.getView().addDependent(this.fragActivityLog);
			}
			this.fragActivityLog.open();
		},
		fncloseaddPo: function () {
			this.fragActivityLog.close();
		},
		onPressDisplay: function (oEvent) {
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var sPath = oEvent.getSource().getBindingContext("poHeaderSet").getPath();
			var selectedObject = poHeaderSet.getProperty(sPath);
			if ((selectedObject.StatusDescription === "RECEIVED - FULL") ||
				(selectedObject.StatusDescription === "RECEIVED - PARTIAL")) {
				mHeaderDetails.setProperty("/PoConfirmBtnVisiblity", false);
				mHeaderDetails.setProperty("/createEinvoiceBtnVisiblity", true);
			} else if (selectedObject.StatusDescription === "REQUIRES CONFIRMATION") {
				mHeaderDetails.setProperty("/PoConfirmBtnVisiblity", true);
				mHeaderDetails.setProperty("/createEinvoiceBtnVisiblity", false);
			} else {
				mHeaderDetails.setProperty("/PoConfirmBtnVisiblity", false);
				mHeaderDetails.setProperty("/createEinvoiceBtnVisiblity", false);
			}
			mHeaderDetails.setProperty("/Purch_Ord", selectedObject.Purch_Ord);
			mHeaderDetails.setProperty("/Company_Code", selectedObject.Company_Code);
			mHeaderDetails.setProperty("/CompanyName", selectedObject.CompanyName);
			mHeaderDetails.setProperty("/vendorID", selectedObject.Vendor);
			mHeaderDetails.setProperty("/vendorName", selectedObject.VendorName);
			mHeaderDetails.setProperty("/POdate", selectedObject.Date);
			mHeaderDetails.setProperty("/Statusdesc", selectedObject.StatusDescription);
			mHeaderDetails.setProperty("/NetPrice", selectedObject.NetPrice);
			mHeaderDetails.setProperty("/Purch_Org", selectedObject.Purch_Org);
			mHeaderDetails.setProperty("/Purch_OrgName", selectedObject.Purch_OrgName);
			mHeaderDetails.setProperty("/Created_By", selectedObject.Created_By);
			selectedObject.page1Status = this.getView().getModel("MasterListHeaderSet").getData().Status;
			var oModel = new sap.ui.model.json.JSONModel(selectedObject);
			this.getOwnerComponent().setModel(oModel, "selectedObject");
			this.getView().byId("ID_TBL_PI_INVOICE111").removeSelections(true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("displayPOdetails");
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
		onClickSubmit: function (oEvent) {
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var selectedObject = this.getView().byId("ID_TBL_PI_INVOICE111").getSelectedContexts()[0].getObject();
			//selectedObject.VendorName = this.getView().getModel("MasterListHeaderSet").getData().VendorName;
			mHeaderDetails.setProperty("/Purch_Ord", selectedObject.Purch_Ord);
			mHeaderDetails.setProperty("/VendorID", selectedObject.Vendor);
			mHeaderDetails.setProperty("/vendorID", selectedObject.vendorID);
			mHeaderDetails.setProperty("/vendorName", selectedObject.VendorName);
			mHeaderDetails.setProperty("/SelectedVendorName", selectedObject.VendorName);
			mHeaderDetails.setProperty("/selectedCompanyCode", selectedObject.Company_Code);
			mHeaderDetails.setProperty("/selectedCompany", selectedObject.CompanyName);
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
					this.createMemoFrag = sap.ui.xmlfragment("incture.com.APCreateInvoice.Fragments.createMemoFrag", this);
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
		onGetFilterVariant: function () {
			var that = this;
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			var url = "InctureApDest/purchaseOrderVariant/getSavedVariant";
			$.ajax({
				url: url,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					var mFilterModel = that.getView().getModel("mFilterModel");
					mFilterModel.setProperty("/FilterArray", result);
					mFilterModel.refresh();
					that.getView().getModel("mFilterModel").setProperty("/deleteVarBtnEnabled", false);
					that.getView().getModel("mFilterModel").setProperty("/selectVarBtnEnabled", false);
					sap.ui.getCore().byId("POSearchFilterVariants").removeSelections(true);
					busyDialog.close();
				},
				error: function (result, xhr, data) {
					busyDialog.close();
					var errorMsg = "";
					if (result.status === 504) {
						errorMsg = "Request timed-out. Please try again using different search filters or add more search filters.";
						that.errorMsg(errorMsg);
					} else {
						errorMsg = result.responseJSON.error.message.value;
						that.errorMsg(errorMsg);
					}
					busyDialog.close();
				}
			});
		},
		onSaveVariant: function () {
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var companyCode = mHeaderDetails.getProperty("/selectedCompanyCode");
			var vendorID = mHeaderDetails.getProperty("/VendorID");
			var status = MasterListHeaderSet.getProperty("/Status");
			var poNo = MasterListHeaderSet.getProperty("/PONo");
			var datevalue = mHeaderDetails.getProperty("/dateValue");
			var secondDateValue = mHeaderDetails.getProperty("/secondDateValue");
			var bFlag = false;
			if (vendorID || poNo || companyCode || (datevalue && secondDateValue)) {
				bFlag = true;
			} else {
				bFlag = false;
			}
			var statusDateFlag = false;
			if (status && datevalue && secondDateValue) {
				statusDateFlag = true;
			} else {
				statusDateFlag = false;
			}
			if (bFlag === true || statusDateFlag === true) {
				if (!this.createFilter) {
					this.createFilter = sap.ui.xmlfragment("incture.com.APCreateInvoice.Fragments.createFilter", this);
					this.getView().addDependent(this.createFilter);
					this.createFilter.setModel(this.getView().getModel("mFilterModel"));
					this.createFilter.getModel("mFilterModel").refresh();
				}
				this.createFilter.open();
			} else {
				sap.m.MessageBox.error("Please Enter required fields!");
			}
		},
		onClosecreateFilter: function () {
			var mFilterModel = this.getView().getModel("mFilterModel");
			mFilterModel.setProperty("/filterName", "");
			this.createFilter.close();
		},

		onSubmitcreateFilterVariant: function () {
			var mFilterModel = this.getView().getModel("mFilterModel");
			var filterName = mFilterModel.getProperty("/filterName");
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var companyCode = mHeaderDetails.getProperty("/selectedCompanyCode");
			var vendorID = mHeaderDetails.getProperty("/VendorID");
			var status = MasterListHeaderSet.getProperty("/Status");
			var poNo = MasterListHeaderSet.getProperty("/PONo");
			var datevalue = mHeaderDetails.getProperty("/dateValue");
			var secondDateValue = mHeaderDetails.getProperty("/secondDateValue");
			if (filterName) {
				var obj = {
					"filterName": filterName,
					"poNumber": poNo,
					"vendorId": vendorID,
					"companyCode": companyCode,
					"vendor": vendorID,
					"status": status,
					"dateRangeStart": datevalue,
					"dateRangeEnd": secondDateValue,
					"createdAt": "",
					"createdBy": "Lakhu Das",
					"updatedAt": "",
					"updatedBy": ""
				};
				var url = "InctureApDest/purchaseOrderVariant/saveVariant";
				var that = this;
				jQuery.ajax({
					type: "POST",
					contentType: "application/json",
					url: url,
					dataType: "json",
					data: JSON.stringify(obj),
					async: true,
					success: function (data, textStatus, jqXHR) {
						mFilterModel.setProperty("/filterName", "");
						if (data.status === "Success") {
							sap.m.MessageBox.success(data.message, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									that.createFilter.close();
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
				sap.m.MessageBox.error("Please Enter Filter Name!");
			}
		},
		onSelectionChangeSF: function (oEvent) {
			var a = this.getView().getModel("mFilterModel");
			var oSelectedItems = oEvent.getSource().getSelectedItems();
			//var selectedFilters = oEvent.getSource().getSelectedContextPaths();
			var selectedFilters = sap.ui.getCore().byId("POSearchFilterVariants").getSelectedContextPaths();
			this.getView().getModel("mFilterModel").setProperty("/selectedFilters", selectedFilters);
			if (oSelectedItems.length) {
				this.getView().getModel("mFilterModel").setProperty("/deleteVarBtnEnabled", true);
			} else {
				this.getView().getModel("mFilterModel").setProperty("/deleteVarBtnEnabled", false);
			}
			if (oSelectedItems.length === 1) {
				this.getView().getModel("mFilterModel").setProperty("/selectVarBtnEnabled", true);
			} else {
				this.getView().getModel("mFilterModel").setProperty("/selectVarBtnEnabled", false);
			}
		},
		onDialogFilterConfirm: function () {

			var selectedFilters = sap.ui.getCore().byId("POSearchFilterVariants").getSelectedContextPaths();
			var mFilterModel = this.getView().getModel("mFilterModel");
			var oItem = mFilterModel.getProperty(selectedFilters[0]);
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var companyCode = mHeaderDetails.getProperty("/selectedCompanyCode");
			if (oItem.dateRangeEnd) {
				var endDate = new Date(oItem.dateRangeEnd.split("T")[0]);
				mHeaderDetails.setProperty("/secondDateValue", endDate);
			}
			if (oItem.dateRangeStart) {
				var startDate = new Date(oItem.dateRangeStart.split("T")[0]);
				mHeaderDetails.setProperty("/dateValue", startDate);
			}
			if (oItem.companyCode) {
				mHeaderDetails.setProperty("/selectedCompanyCode", oItem.companyCode);
			}
			if (oItem.vendor) {
				mHeaderDetails.setProperty("/VendorID", oItem.vendor);
			}
			var status = MasterListHeaderSet.getProperty("/Status");
			if (oItem.status) {
				MasterListHeaderSet.setProperty("/Status", oItem.status);
			}
			var poNo = MasterListHeaderSet.getProperty("/PONo");
			if (oItem.poNumber) {
				MasterListHeaderSet.setProperty("/PONo", oItem.poNumber);
			}
			this.SavedFilters.close();
		},
		onConfirmDeleteFilters: function () {
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirm",
					content: new sap.m.Text({
						text: "Do you want to delete these variants?"
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Yes",
						press: function () {
							var selectedFilters = sap.ui.getCore().byId("POSearchFilterVariants").getSelectedContextPaths();
							//var selectedFilters = this.getView().getModel("mFilterModel").getProperty("/selectedFilters");
							var payload = [];
							for (var i = 0; i < selectedFilters.length; i++) {
								var temp = this.getView().getModel("mFilterModel").getProperty(selectedFilters[i]);
								payload.push(temp.id);
							}
							if (selectedFilters.length > 0) {
								for (var i = selectedFilters.length - 1; i >= 0; i--) {
									var indx = selectedFilters[i].split("/")[2];
									this.getView().getModel("mFilterModel").getData().FilterArray.splice(indx, 1);
								}
							}
							var that = this;
							var url = "InctureApDest/purchaseOrderVariant/deleteVariant";
							$.ajax({
								type: "POST",
								contentType: "application/json",
								url: url,
								dataType: "json",
								data: JSON.stringify(payload),
								async: true,
								success: function (result, xhr, data) {
									var mFilterModel = that.getView().getModel("mFilterModel");
									that.getView().getModel("mFilterModel").refresh();
									that.onGetFilterVariant();
								},
								error: function (result, xhr, data) {
									busyDialog.close();
									var errorMsg = "";
									if (result.status === 504) {
										errorMsg = "Request timed-out. Please try again using different search filters or add more search filters.";
										that.errorMsg(errorMsg);
									} else {
										errorMsg = result.responseJSON.error.message.value;
										that.errorMsg(errorMsg);
									}
								}
							});
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "No",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialog.open();
		},

		onSelectVariant: function () {
			this.onGetFilterVariant();
			if (!this.SavedFilters) {
				this.SavedFilters = sap.ui.xmlfragment("incture.com.APCreateInvoice.Fragments.SavedFilters", this);
				this.getView().addDependent(this.SavedFilters);
				this.SavedFilters.setModel(this.getView().getModel("mFilterModel"));
				this.SavedFilters.getModel("mFilterModel").refresh();
			}
			this.SavedFilters.open();
		},
		onEndingVariantClose: function () {
			this.SavedFilters.close();
		},
		onPressPersonalization: function (oEvent) {
			var that = this;
			var PersonalizationModel = this.getView().getModel("PersonalizationModel");
			if (!this.FilterPersonalization) {
				this.FilterPersonalization = sap.ui.xmlfragment("incture.com.APCreateInvoice.Fragments.FilterPersonalization", this);
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
			var personalizationData = this.FilterPersonalization.getModel("FilterPersonalization").getData().results.personalizationData
				.userPersonaDto;
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
						if (PersonalizationModel.getData().results.personalizationData.variantName[j].name === PersonalizationModel.getData().results
							.newVariantName) {
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
			var data = this.FilterPersonalization.getModel("FilterPersonalization").getProperty(
				"/results/personalizationData/userPersonaDto");
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
					if (that.FilterPersonalization.getModel("FilterPersonalization").getProperty(
							"/results/personalizationData/currentVariant") ===
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