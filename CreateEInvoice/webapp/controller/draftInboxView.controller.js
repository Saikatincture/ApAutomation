sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
	"use strict";
	return Controller.extend("com.incture.CreateEInvoice.controller.draftInboxView", {
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
			$("#splash-screen").remove();
			var paginatedModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(paginatedModel, "paginatedModel");
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
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			this.getView().getModel("baseModel").setProperty("/Space", " ");
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
			this.onGetDraftdetails(1);
			this.getStatus();
			this._getUser();
			this.selectedObjects = [];
			this.selectedTab = "keyEInvoicedraftInbox";
		},
		//------------------------------------****GET USER DETAILS START******----------------------------------------
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
						that.selectedTab = "keyEInvoicedraftInbox";
						that._getPersonalizationDetails(that.selectedTab);
					}
				});
		},
		//------------------------------------****GET USER DETAILS END******-----------------------------------------//
		//------------------------------------****OPEN BUSY DIALOG START******----------------------------------------//
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
		//------------------------------------****OPEN BUSY DIALOG END******----------------------------------------//
		//------------------------------------****CLOSE BUSY DIALOG START*****--------------------------------------//
		closeBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.close();
			}
		},
		//------------------------------------****CLOSE BUSY DIALOG END******----------------------------------------//
		//------------------------------------****Generate Pagination START*****--------------------------------------//
		generatePagination: function () {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var totalTasks = mDraftDetails.getData().count;
			var tasksPerPage = 50;
			this.getView().byId("idPrevButton").setEnabled(false);
			this.getView().byId("idNextButton").setEnabled(true);
			var pageCount = parseInt(totalTasks / tasksPerPage);
			if (totalTasks % tasksPerPage !== 0) {
				pageCount = pageCount + 1;
			}
			mDraftDetails.setProperty("/numberOfPages", pageCount);
			var array = [];
			if (pageCount > 5) {
				pageCount = 5;
			} else {
				this.getView().byId("idNextButton").setEnabled(false);
			}
			for (var i = 1; i <= pageCount; i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			this.getView().getModel("paginatedModel").setProperty('/array', array);
			this.getView().byId("idCurrentPage").setText("Page : " + mDraftDetails.getProperty("/selectedPage"));
			if (mDraftDetails.getProperty("/numberOfPages") && parseInt(mDraftDetails.getProperty("/numberOfPages")) > 1) {
				this.getView().byId("idPageNumberDiv").setVisible(true);
			} else {
				this.getView().byId("idPageNumberDiv").setVisible(false);
			}
		},
		//------------------------------------****Generate Pagination Close*****--------------------------------------//
		//------------------------------------****Scroll Left Start*****--------------------------------------//
		onScrollLeft: function () {
			this.getView().byId("idPrevButton").setEnabled(true);
			this.getView().byId("idNextButton").setEnabled(true);
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var paginatedData = this.getView().getModel("paginatedModel").getData().array;
			var selectedPage = parseInt(mDraftDetails.getProperty("/selectedPage"));
			var startValue = parseInt(paginatedData[0].text);
			var startNumber = 1;
			var array = [];
			if ((startValue - 1) === 1) {
				startNumber = 1;
				this.getView().byId("idPrevButton").setEnabled(false);
			} else {
				startNumber = selectedPage - 3;
			}
			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			this.getView().getModel("paginatedModel").setProperty('/array', array);
			mDraftDetails.setProperty("/selectedPage", (parseInt(mDraftDetails.getProperty("/selectedPage")) - 1));
			this.onGetDraftdetails(mDraftDetails.getProperty("/selectedPage"));
		},
		//------------------------------------****Scroll Left End*****--------------------------------------//
		//------------------------------------****Scroll Right START*****--------------------------------------//
		onScrollRight: function () {
			this.getView().byId("idPrevButton").setEnabled(true);
			this.getView().byId("idNextButton").setEnabled(true);
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var paginatedData = this.getView().getModel("paginatedModel").getData().array;
			var selectedPage = parseInt(mDraftDetails.getProperty("/selectedPage"));
			var startNumber = 1;
			var array = [];
			if (selectedPage > 2) {
				if ((selectedPage + 3) >= mDraftDetails.getProperty("/numberOfPages")) {
					this.getView().byId("idNextButton").setEnabled(false);
					startNumber = parseInt(mDraftDetails.getProperty("/numberOfPages")) - 4;
				} else {
					startNumber = selectedPage - 1;
				}
			} else {
				this.getView().byId("idPrevButton").setEnabled(false);
			}
			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			this.getView().getModel("paginatedModel").setProperty('/array', array);
			mDraftDetails.setProperty("/selectedPage", (parseInt(mDraftDetails.getProperty("/selectedPage")) + 1));
			this.onGetDraftdetails(mDraftDetails.getProperty("/selectedPage"));
		},
		//------------------------------------****Scroll Right End*****--------------------------------------//
		onPageClick: function (oEvent) {
			var selectedPage = oEvent.getSource().getText();
			this.onGetDraftdetails(selectedPage);
			this.getView().getModel("mDraftDetails").setProperty("/selectedPage", selectedPage);
		},

		// PAGINATION STOP 
		getStatus: function () {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			jQuery
				.ajax({
					url: "InctureApDest/statusConfig/getAll/EN",
					type: "GET",
					dataType: "json",
					success: function (result) {
						mDraftDetails.setProperty("/aStatus", result);
						mDraftDetails.refresh();
					}
				});

		},
		onPressCreateEInvoice: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrder");
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
		searchVendorAddr: function (oEvt) {
			var sVendorId = oEvt.getParameter("selectedItem").getProperty("text");
			var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			//	var vName = "-" + sVendorName;
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			mDraftDetails.setProperty("/vendorId", sVendorId);
			mDraftDetails.setProperty("/vendorName", sVendorName);
			mDraftDetails.refresh();
		},
		onGetDraftdetails: function (pageNo) {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			pageNo = pageNo - 1;
			var that = this;
			that.openBusyDialog();
			jQuery
				.ajax({
					//url: "InctureApDest/invoiceHeader/drafts/0/10",
					url: "InctureApDest/invoiceHeader/eInvoice/" + pageNo + "/11",
					type: "GET",
					dataType: "json",
					success: function (result) {
						that.closeBusyDialog();
						if (result.headerList.length > 0) {
							for (var i = 0; i < result.headerList.length; i++) {
								var status = result.headerList[i].lifecycleStatusText;
								if (status === "Open") {
									result.headerList[i].lifecycleState = "Indication08";
								} else if (status === "SAP Posting Success") {
									result.headerList[i].lifecycleState = "Success";
								} else if (status === "SAP Posting Failed" || status === "Rejected") {
									result.headerList[i].lifecycleState = "Error";
								} else if (status === "ThreeWayMatched") {
									result.headerList[i].lifecycleState = "Information";
								} else if (status === "ThreeWayMisMatched") {
									result.headerList[i].lifecycleState = "Indication03";
								} else if (status === "GRN Complete") {
									result.headerList[i].lifecycleState = "Indication07";
								} else {
									result.headerList[i].lifecycleState = "None";
								}
							}
						}
						mDraftDetails.setProperty("/aDraftlist", result.headerList);
						var aDraftList = mDraftDetails.getProperty("/aDraftlist");
						var len = aDraftList.length;
						for (var i = 0; i < len; i++) {

							var req = aDraftList[i].requestId;
							var reqID = req.split("-")[0];
							if (reqID === "APA") {
								aDraftList[i].actionIcon = "sap-icon://display";
							} else {
								aDraftList[i].actionIcon = "sap-icon://edit";
							}
							if (aDraftList[i].sapInvoiceNumber === 0) {
								//	aDraftList[i].sapInvoiceNumber = "";
								mDraftDetails.setProperty("/aDraftlist/" + i + "/sapInvoiceNumber", "");
							}

						}
						mDraftDetails.setProperty("/count", result.count);
						mDraftDetails.setProperty("/selectedPage", pageNo + 1);
						that.generatePagination();
						mDraftDetails.refresh();
					},
					error: function (oError) {
						that.closeBusyDialog();
					}
				});
		},
		onResetFilter: function () {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			mDraftDetails.setProperty("/draftNo", "");
			mDraftDetails.setProperty("/vendorName", "");
			mDraftDetails.setProperty("/vendorId", "");
			mDraftDetails.setProperty("/Status", "");
			mDraftDetails.setProperty("/PONo", "");
			mDraftDetails.setProperty("/dateValue", null);
			mDraftDetails.setProperty("/secondDateValue", null);
		},
		onGOFilter: function () {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var requestId = mDraftDetails.getProperty("/draftNo");
			var poNum = mDraftDetails.getProperty("/PONo");
			if ((poNum === undefined) || (poNum === "")) {
				poNum = null;
			}
			if ((requestId === undefined) || (requestId === "")) {
				requestId = null;
			}
			var vendorName = mDraftDetails.getProperty("/vendorName");
			var vendorId = mDraftDetails.getProperty("/vendorId");
			if ((vendorName === undefined) || (vendorName === "")) {
				vendorName = null;
			}
			if ((vendorId === undefined) || (vendorId === "")) {
				vendorId = null;
			}
			var createdAtFrom = mDraftDetails.getProperty("/dateValue");
			if (createdAtFrom) {
				var sYear = createdAtFrom.getFullYear();
				var sMon = createdAtFrom.getMonth() + 1;
				var sDate = createdAtFrom.getDate();
				if (sMon.toString().length < 2) {
					sMon = "0" + sMon.toString();
				}
				if (sDate.toString().length < 2) {
					sDate = "0" + sDate.toString();
				}
				var cAtFrom = sYear + "-" + sMon + "-" + sDate;
			} else {
				cAtFrom = null;
			}
			var createdAtTo = mDraftDetails.getProperty("/secondDateValue");
			if (createdAtTo) {
				//var cAtTo = Date.now(createdAtTo);
				var dYear = createdAtTo.getFullYear();
				var dMon = createdAtTo.getMonth() + 1;
				var dDate = createdAtTo.getDate();
				if (dMon.toString().length < 2) {
					dMon = "0" + dMon.toString();
				}
				if (dDate.toString().length < 2) {
					dDate = "0" + dDate.toString();
				}
				var cAtTo = dYear + "-" + dMon + "-" + dDate;
			} else {
				cAtTo = null;
			}
			var status = mDraftDetails.getProperty("/Status");
			if (!status) {
				status = null;
			}
			var obj = {
				"requestId": requestId,
				"invoiceTotalFrom": null,
				"invoiceTotalTo": null,
				"createdAtFrom": cAtFrom,
				"createdAtTo": cAtTo,
				"refDocNum": poNum,
				"dueDateFrom": null,
				"dueDateTo": null,
				"extInvNum": null,
				"taskStatus": null,
				"assignedTo": null,
				"vendorId": vendorId,
				"vendorName": vendorName,
				"invoiceType": null,
				"lifecycleStatus": status
			};
			var that = this;
			that.openBusyDialog();
			var url = "InctureApDest/invoiceHeader/getForFilter";
			jQuery
				.ajax({
					url: url,
					dataType: "json",
					data: JSON.stringify(obj),
					contentType: "application/json",
					type: "POST",
					success: function (result) {
						that.closeBusyDialog();
						if (result.invoiceHeaderDtos.length > 0) {
							for (var i = 0; i < result.invoiceHeaderDtos.length; i++) {
								var status = result.invoiceHeaderDtos[i].lifecycleStatusText;
								if (status === "Open") {
									result.invoiceHeaderDtos[i].lifecycleState = "Indication08";
								} else if (status === "SAP Posting Success") {
									result.invoiceHeaderDtos[i].lifecycleState = "Success";
								} else if (status === "SAP Posting Failed" || status === "Rejected") {
									result.invoiceHeaderDtos[i].lifecycleState = "Error";
								} else if (status === "ThreeWayMatched") {
									result.invoiceHeaderDtos[i].lifecycleState = "Information";
								} else if (status === "ThreeWayMisMatched") {
									result.invoiceHeaderDtos[i].lifecycleState = "Indication03";
								} else if (status === "GRN Complete") {
									result.invoiceHeaderDtos[i].lifecycleState = "Indication07";
								} else {
									result.invoiceHeaderDtos[i].lifecycleState = "None";
								}
							}
						}
						mDraftDetails.setProperty("/aDraftlist", result.invoiceHeaderDtos);
						var aDraftList = mDraftDetails.getProperty("/aDraftlist");
						if (aDraftList) {
							var len = aDraftList.length;
							for (var i = 0; i < len; i++) {
								var req = aDraftList[i].requestId;
								var reqID = req.split("-")[0];
								if (reqID === "APA") {
									mDraftDetails.setProperty("/aDraftlist/" + i + "/actionIcon", "sap-icon://display");
								} else {
									mDraftDetails.setProperty("/aDraftlist/" + i + "/actionIcon", "sap-icon://edit");
								}
								if (aDraftList[i].sapInvoiceNumber === 0) {
									mDraftDetails.setProperty("/aDraftlist/" + i + "/sapInvoiceNumber", "");
								}
							}
						}
					}.bind(this),
					error: function (e) {
						that.closeBusyDialog();
						sap.m.MessageBox.error(e.message);
					}.bind(this)
				});
		},
		onPressEdit: function (oEvent) {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var sPath = oEvent.getSource().getBindingContext("mDraftDetails").getPath();
			var aDetails = mDraftDetails.getProperty(sPath);
			mDraftDetails.setProperty("/compCode", aDetails.compCode);
			var req = aDetails.requestId;
			var reqID = req.split("-")[0];
			mDraftDetails.setProperty("/Path", sPath);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (reqID === "APA") {
				oRouter.navTo("displayPage");
			} else {
				oRouter.navTo("createEInvoice");
			}
		},
		onPressDownload: function (oEvent) {
			var mDraftDetails = this.getOwnerComponent().getModel("mDraftDetails");
			var sPath = oEvent.getSource().getBindingContext("mDraftDetails").getPath();
			var aDetails = mDraftDetails.getProperty(sPath);
			var req = aDetails.requestId;
			var sURL = "InctureApDest/attachment/download/" + req;
			var oXHR = new XMLHttpRequest();
			oXHR.open('GET', sURL);
			oXHR.responseType = "blob";
			oXHR.onload = function () {
				if (oXHR.status < 400 && oXHR.response && oXHR.response.size > 0) {
					var sFilenameFromServer = req;
					if (sap.ui.Device.browser.msie) {
						window.navigator.msSaveOrOpenBlob(oXHR.response, sFilenameFromServer);
					} else {
						var oA = document.createElement("a");
						oA.href = window.URL.createObjectURL(oXHR.response);
						oA.style.display = "none";
						oA.download = sFilenameFromServer;
						document.body.appendChild(oA);
						oA.click();
						document.body.removeChild(oA);
						setTimeout(function () {
							window.URL.revokeObjectURL(oA.href);
						}, 250);
					}
				} else {
					MessageToast.show("Something went wrong!");
				}
			}.bind(this);
			oXHR.send();
			/*	var _pdfurl = source;
				this.oPDFViewer = new sap.m.PDFViewer();
				this.oPDFViewer.setSource(_pdfurl);
				this.oPDFViewer.open();*/
			//window.open(source);

		},
		//Added by Prashanth 28/01/2021 for Testing
		onRoutrPOConfirm: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrderConfim");
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
			this.selectedTab = "keyEInvoicedraftInbox";
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
			var tab = "keyEInvoicedraftInbox";
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
			this.selectedTab = "keyEInvoicedraftInbox";
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
					that.FilterPersonalization.getModel("FilterPersonalization").setProperty("/results/personalizationData/userPersonaDto", success);
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
					that.FilterPersonalization.getModel("FilterPersonalization").setProperty("results/personalizationData/userPersonaDto", success);
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