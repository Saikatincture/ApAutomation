sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/unified/Calendar",
		"com/inc/ApWorkbench/util/formatter",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV",
		"sap/ui/core/routing/History",
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator'
	],
	function (Controller, MessageBox, Calendar, formatter, Export, ExportTypeCSV, History, Filter, FilterOperator) {
		"use strict";
		return Controller.extend("com.inc.ApWorkbench.controller.baseCoder", {
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
				var detailPageModel = new sap.ui.model.json.JSONModel();
				detailPageModel.setSizeLimit(2000);
				this.getView().setModel(detailPageModel, "detailPageModel");
				var postDataModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(postDataModel, "postDataModel");
				var mRejectModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(mRejectModel, "mRejectModel");
				var taxModel = new sap.ui.model.json.JSONModel("model/taxCode.json");
				this.getView().setModel(taxModel, "taxModel");
				var approverEmail = {
					"sSelect": "",
					"results": [{
						"ApproverEmail": "prashant.kumar@incture.com"
					}, {
						"ApproverEmail": "priyadharshini.a@incture.com"
					}, {
						"ApproverEmail": "arijeet@incture.com"
					}]

				};
				var approverModel = new sap.ui.model.json.JSONModel(approverEmail);
				this.getView().setModel(approverModel, "approverModel");
				var sPDFPath = jQuery.sap.getModulePath("com.inc.ApWorkbench.css.pdfs", "/Test.pdf");
				var oPDFModel = new sap.ui.model.json.JSONModel({
					"Source": sPDFPath,
					"Title": "Invoice PDF",
					"Height": "560px",
					"Width": "100%"
				});
				this.getView().setModel(oPDFModel, "oPDFModel");
				var visibility = {
					"DefaultTemplateTable": true,
					"NewTemplateTable": false

				};
				this.getView().getModel("postDataModel").setProperty("/visbility", visibility);

				var oInvoiceModel = new sap.ui.model.json.JSONModel({
					"iSubTotal": 23423.23,
					"iFreight": 23445,
					"iSubCharges": 324234,
					"iGrossAmt": 0,
					"bNonEditableField": true,
					"bEnable": false,
					"bPdfBtn": false
				});
				this.getView().setModel(oInvoiceModel, "oInvoiceModel");
				var templateModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(templateModel, "templateModel");
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};

				//Payment Term Data
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function () {
					paymentModel.refresh();
				});

				//Payment Method Data
				var pmUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentMethodsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001' ";
				var paymentMethodModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentMethodModel, "paymentMethodModel");
				paymentMethodModel.loadData(pmUrl, null, true, "Get", false, false, oHeader);
				paymentMethodModel.attachRequestCompleted(function (oEvent) {
					paymentMethodModel.refresh();
				});
				//Payment Block Data
				var pbUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentBlockSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var paymentBlockModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentBlockModel, "paymentBlockModel");
				paymentBlockModel.loadData(pbUrl, null, true, "Get", false, false, oHeader);
				paymentBlockModel.attachRequestCompleted(function (oEvent) {
					paymentBlockModel.refresh();
				});
				var that = this;
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oInvoiceModel = new sap.ui.model.json.JSONModel();

				this.oRouter.attachRoutePatternMatched(function (oEvent) {
					if (oEvent.getParameters().arguments.value && oEvent.getParameters().arguments.value != "abc") {
						var url = "InctureApDest/invoiceHeader?requestId=" + oEvent.getParameters().arguments.value;
						jQuery
							.ajax({
								url: url,
								type: "GET",
								dataType: "json",
								success: function (result) {
									var aData = result;
									postDataModel.setProperty("/listNonPoItem", result.costAllocation);
									detailPageModel.setProperty("/invoiceDetailUIDto", aData);
									var vendorId = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/vendorId");
			                         var compCode = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/compCode");
						                var vendDate = new Date().toISOString().split("T")[0];
										var vendUrl =
											"DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VenBalHeaderSet?$filter=Vendor eq '" + vendorId + "' and CompanyCode eq '" + compCode + "' and KeyDate eq datetime'" + vendDate + "T00:00:00'&$expand=ToVendorBalance&$format=json";
										var vendorBalanceModel = new sap.ui.model.json.JSONModel();
										that.getView().setModel(vendorBalanceModel, "vendorBalanceModel");
										vendorBalanceModel.loadData(vendUrl, null, true);
										vendorBalanceModel.attachRequestCompleted(null, function (oEvent) {
											vendorBalanceModel.refresh();
										});
									if (postDataModel.getProperty("/listNonPoItem").length != 0)
										postDataModel.setProperty("/requestId", result.costAllocation[0].requestId);
									var nVal = new Date().toLocaleDateString();
									detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/postingDate", nVal);
									var aCostAllocationData = postDataModel.getProperty("/listNonPoItem");
									if (aCostAllocationData) {
										oInvoiceModel.setProperty("/bEnable", true);
									}
									that.amtCalculation();
									that.getPdfData();
									that.getCommentData();
									that.selectedObjects = [];
									that.selectedTab = "nonPO";
									that._getUser();
									if (postDataModel.getData().newCostArray != undefined) {
										var totalAmt = 0;
										if (postDataModel.getProperty("/newCostArray")) {
											var length = postDataModel.getProperty("/newCostArray").length;
											for (var i = 0; i < length; i++) {
												if (postDataModel.getProperty("/newCostArray/" + i + "/netValue") && postDataModel.getProperty("/newCostArray/" + i +
														"/crDbIndicator") === "H") {
													totalAmt += that.nanValCheck(postDataModel.getProperty("/newCostArray/" + i + "/netValue"));

												} else if (postDataModel.getProperty("/newCostArray/" + i + "/netValue") && postDataModel.getProperty("/newCostArray/" +
														i +
														"/crDbIndicator") === "S") {
													totalAmt -= that.nanValCheck(postDataModel.getProperty("/newCostArray/" + i + "/netValue"));
												}
											}
											totalAmt = that.nanValCheck(totalAmt).toFixed(3);
											detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/grossAmount", totalAmt);
											detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", totalAmt);
											var invAmt = that.nanValCheck(detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal"));
											var diff = that.nanValCheck(invAmt) - that.nanValCheck(totalAmt);
											diff = that.nanValCheck(diff).toFixed(3);
											detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", diff);
											detailPageModel.refresh();
											postDataModel.refresh();
										}
									}
									if (paymentModel.getData().d.results || paymentMethodModel.getData().d.results || paymentBlockModel.getData().d.results) {
										var paymentTerm = paymentModel.getProperty("/d/results")[0].PaymentTerms;
										var paymentMethod = paymentMethodModel.getProperty("/d/results")[0].PaymentMeth;
										var paymentBlock = paymentBlockModel.getProperty("/d/results")[0].VdrPaymentBlock;
										detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/paymentTerms", paymentTerm);
										detailPageModel.setProperty("/invoiceDetailUIDto/paymentMethod", paymentMethod);
										detailPageModel.setProperty("/invoiceDetailUIDto/paymentBlock", paymentBlock);
									}
									detailPageModel.refresh();
									postDataModel.refresh();
								},
								error: function (e) {
									MessageBox.error(e.message);
								}
							});
					}
				});
				
				// Vendor balance
				// var that = this;
			   
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
							that.selectedTab = "nonPO";
							that._getPersonalizationDetails(that.selectedTab);
						}
					});
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
						that.getView().getModel("tabPersonalizationModel").refresh();
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
			onPressPersonalization: function (oEvent) {
				//	var that = this;
				//	var PersonalizationModel = this.getView().getModel("PersonalizationModel");
				if (!this.FilterPersonalization) {
					this.FilterPersonalization = sap.ui.xmlfragment("com.inc.ApWorkbench.view.Fragments.FilterPersonalization", this);
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
				//var that = this;
				//var PersonalizationModel = this.getView().getModel("PersonalizationModel");
				if (!this.FilterPersonalization) {
					this.FilterPersonalization = sap.ui.xmlfragment("com.inc.ApWorkbench.Fragments.FilterPersonalization", this);
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
				this.selectedTab = "nonPO";
				this._getPersonalizationDetails(this.selectedTab);
			},
			onVariantOK: function () {

				var that = this;
				var PersonalizationModel = this.getView().getModel("PersonalizationModel");
				if (!this.FilterPersonalization) {
					this.FilterPersonalization = sap.ui.xmlfragment("com.inc.ApWorkbench.view.Fragments.FilterPersonalization", this);
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
				var tab = "nonPO";
				var varinatName;
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
					that.FilterPersonalization.getModel("FilterPersonalization").refresh();
					that.FilterPersonalization.close();
					sap.m.MessageBox.success("Created Successfully!", {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (sAction) {

							if (sAction === MessageBox.Action.OK) {

								that._getPersonalizationDetails(tab);
							}
						}
					});
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
				this.selectedTab = "nonPO";
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
			},
			onPostingDateChange: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/postingDate", oEvent.getSource()._getSelectedDate().getTime());
			},
			getCommentData: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				$.ajax({
					url: "InctureApDest/comment?requestId=" + detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.requestId,
					method: "GET",
					async: true,
					success: function (result, xhr, data) {
						detailPageModel.getData().invoiceDetailUIDto.commentDto = result.commentDtos;
						detailPageModel.refresh();
					}.bind(this)
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
				this.oRouter.navTo("Workbench");
			},
			getPdfData: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				detailPageModel.setProperty("/pdfData", []);
				var oInvoiceModel = this.getView().getModel("oInvoiceModel");
				$.ajax({
					url: "InctureApDest/attachment?requestId=" + detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.requestId,
					method: "GET",
					// async: true,
					contentType: "application/json",
					success: function (result) {
						oInvoiceModel.setProperty("/bPdfBtn", false);
						for (var i = 0; i < result.attachmentList.length; i++) {
							if (result.attachmentList[i].master) {
								detailPageModel.getData().pdfData = result.attachmentList.splice(i, 1);
								oInvoiceModel.setProperty("/bPdfBtn", true);
							}
						}
						detailPageModel.getData().docManagerDto = result.attachmentList;
						this.count = 0;
					for (var i = 0; i < detailPageModel.getData().docManagerDto.length; i++) {
						if(detailPageModel.getData().docManagerDto[i].createdAt){
							var date = new Date(detailPageModel.getData().docManagerDto[i].createdAt).toLocaleDateString();
								detailPageModel.setProperty("/docManagerDto/"+ i + "/date", date);
						}
				    	if(detailPageModel.getData().docManagerDto[i].fileType == "pdf" || detailPageModel.getData().docManagerDto[i].fileType == "application/pdf"){
				    		detailPageModel.setProperty("/docManagerDto/"+ i +"/type","https://image.shutterstock.com/image-vector/pdf-icon-260nw-215496328.jpg");
				    	}else {
				    		detailPageModel.setProperty("/docManagerDto/"+ i + "/type", "https://thumbs.dreamstime.com/z/txt-file-red-arrow-download-button-white-background-71307470.jpg");
				    	}
				    	 this.count = this.count + 1;
					}
						detailPageModel.refresh();
					}.bind(this)
				});
			},
			onPressopenpdf: function () {
				this.byId("grid").setDefaultSpan("L6 M6 S12");
				this.byId("grid2").setDefaultSpan("L6 M6 S12");
				this.addPdfArea();
			},
			addPdfArea: function () {
				/*	var oSplitter = this.byId("idMainSplitter");
					if (oSplitter.getContentAreas().length === 1) {
						oSplitter.insertContentArea(this._getFormFragment("pdf"), 1);
					}*/
				var that = this;
				var pdfData = this.getView().getModel("detailPageModel").getData().pdfData[0];
				that.pdf = sap.ui.xmlfragment(that.getView().getId(), "com.inc.ApWorkbench.view.fragments.pdf", that);
				var oPdfFrame = that.pdf.getItems()[1];
				oPdfFrame.setContent('<embed width="100%" height="859rem" name="plugin" src="data:application/pdf;base64, ' + pdfData.fileBase64 +
					'" ' + 'type=' + "" + "application/pdf" + " " + 'internalinstanceid="21">');
				var oSplitter = that.byId("idMainSplitter");
				var oLastContentArea = oSplitter.getContentAreas().pop();
				if (oSplitter.getContentAreas().length > 1)
					oSplitter.removeContentArea(oLastContentArea);
				if (oSplitter.getContentAreas().length === 1)
					oSplitter.insertContentArea(that.pdf, 1);
			},
			fnRemovePDFScreen: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var url = "InctureApDest/attachment/download/" + detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.requestId;
				sap.m.URLHelper.redirect(url, true);
				this._removeContentArea();
			},

			_removeContentArea: function () {
				var oSplitter = this.byId("idMainSplitter");
				var oLastContentArea = oSplitter.getContentAreas().pop();
				if (oSplitter.getContentAreas().length > 1) {
					oSplitter.removeContentArea(oLastContentArea);
				}
				this._resizeSplitterLayout();
				this.byId("grid").setDefaultSpan("L3 M4 S12");
				this.byId("grid2").setDefaultSpan("L3 M6 S12");
			},
			_addPdfContentArea: function () {
				var oSplitter = this.byId("idMainSplitter");
				if (oSplitter.getContentAreas().length === 1) {
					sap.ui.getCore().byId("pdftable");
					this.pdfTable = sap.ui.xmlfragment("com.inc.ApWorkbench.view.fragment.pdfTable", this);
					oSplitter.insertContentArea(this.pdfTable, 1);
				}
				this._resizeSplitterLayout();
			},
			_resizeSplitterLayout: function () {
				var oContentLayout;
				var oSplitter = this.byId("idMainSplitter");
				oSplitter.getContentAreas().forEach(function (oElement) {
					oContentLayout = oElement.getLayoutData();
					oContentLayout.setSize("auto");
				});
			},

			_formFragments: {},
			_getFormFragment: function (sFragmentName) {
				var oFormFragment = this._formFragments[sFragmentName];

				if (oFormFragment) {
					return oFormFragment;
				}

				oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.inc.ApWorkbench.view.fragment." + sFragmentName, this);

				this._formFragments[sFragmentName] = oFormFragment;
				return this._formFragments[sFragmentName];
			},

			_setUpTheLayout: function () {
				var oSplitAreaOneBox,
					oSplitter = this.byId("idMainSplitter"),
					oSplitAreaOneBox = new sap.m.VBox({
						items: [
							this._getFormFragment("emailSection"),
							this._getFormFragment("attachmentBar"),
						]
					});
				oSplitter.insertContentArea(oSplitAreaOneBox, 0);

			},

			openFileExplorer: function () {

				if (!this.myDialogFragment) {
					sap.ui.getCore().byId("idOpenFileExplorer");
					this.myDialogFragment = sap.ui.xmlfragment("com.inc.ApWorkbench.view.fragment.openFileExplorer", this);
					this.getView().addDependent(this.myDialogFragment);

				}
				this.myDialogFragment.open();
				var oFileUploader = sap.ui.getCore().byId("fileUploader");
				oFileUploader.setValue(null);
			},
			onBeforeUploadStarts: function (oEvent) {
                var that = this;   
				var detailPageModel = this.getView().getModel("detailPageModel");
				var detailPageModelData = this.getView().getModel("detailPageModel").getData();
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
					var cDate = new Date().getTime();
					// var sDate = Date.now(cDate);
					var docDetails = {
						"requestId": detailPageModelData.invoiceDetailUIDto.invoiceHeader.requestId,
						"fileName": fileName,
						"fileType": fileType,
						"fileBase64": base64,
						"createdBy": that.getView().getModel("oUserModel").getProperty("/email"),
						"createdAt": cDate,
						"updatedBy": null,
						"updatedAt": null,
						"master": null
					};
					if (!detailPageModel.getData().docManagerDto) {
						detailPageModel.getData().docManagerDto = [];
					}
					detailPageModel.getData().docManagerDto.push(docDetails);
				
					for (var i = that.count; i < detailPageModel.getData().docManagerDto.length; i++) {
						if(detailPageModel.getData().docManagerDto[i].createdAt){
							var date = new Date(detailPageModel.getData().docManagerDto[i].createdAt).toLocaleDateString();
								detailPageModel.setProperty("/docManagerDto/"+ i + "/date", date);
						}
				    	if(detailPageModel.getData().docManagerDto[i].fileType == "pdf" || detailPageModel.getData().docManagerDto[i].fileType == "application/pdf"){
				    		detailPageModel.setProperty("/docManagerDto/"+ i +"/type","https://image.shutterstock.com/image-vector/pdf-icon-260nw-215496328.jpg");
				    	}else {
				    		detailPageModel.setProperty("/docManagerDto/"+ i + "/type", "https://thumbs.dreamstime.com/z/txt-file-red-arrow-download-button-white-background-71307470.jpg");
				    	}
					}
						detailPageModel.refresh();
				
				};
				if (fileList) {
					reader.readAsDataURL(fileList);
				}
		
			},
			fnUploadDoc: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var attachData = oEvent.getSource().getBindingContext("detailPageModel").getObject();
				var apptype = "text/html";
				var byteCode = attachData.fileBase64;
				var u8_2 = new Uint8Array(atob(byteCode).split("").map(function (c) {
					return c.charCodeAt(0);
				}));
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				var blob = new Blob([u8_2], {
					type: apptype
				});
				var url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = attachData.fileName;
				a.click();
				window.URL.revokeObjectURL(url);
			},

			handleUploadComplete: function (oEvent) {
				var sResponse = oEvent.getParameter("response");
				if (sResponse) {
					var sMsg = "";
					var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
					if (m[1] === "200") {
						sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
						oEvent.getSource().setValue("");
					} else {
						sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
					}
					sap.m.MessageToast.show(sMsg);
				}
			},
			handleUploadPress: function () {

				this.myDialogFragment.close();
				var postDataModel = this.getView().getModel("postDataModel");
				var ext = sap.ui.getCore().byId("fileUploader").getValue().split(".");
				if (ext[0] === "") {
					sap.m.MessageToast.show("Please select a .csv file to upload");
					return;
				}
				var oFileFormat = ext[1].toLowerCase();

				var oBulkUploadModelData;
				var oFileUploader = sap.ui.getCore().byId("fileUploader");
				postDataModel.setProperty("/listNonPoItem", []);
				this.fileType = oFileUploader.getValue().split(".")[1];
				var domRef = oFileUploader.getFocusDomRef();
				var file = domRef.files[0];
				// Create a File Reader object
				var reader = new FileReader();
				var that = this;
				reader.onload = function (e) {
					if (that.fileType === "csv") {
						var bytes = new Uint8Array(reader.result);
						var binary = "";
						var length = bytes.byteLength;
						for (var i = 0; i < length; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						var strCSV = e.target.result;
						var arrCSV = binary.split("\n");
						// To ignore the first row which is header
						var oTblData = arrCSV.splice(1);
						oBulkUploadModelData = [];

						for (var j = 0; j < oTblData.length; j++) {
							var oRowDataArray = oTblData[j].split(';');
							var oTblRowData = {
								glAccount: oRowDataArray[0],
								materialDescription: oRowDataArray[1],
								crDbIndicator: oRowDataArray[2],
								netValue: parseFloat(oRowDataArray[3]),
								costCenter: oRowDataArray[4],
								internalOrderId: oRowDataArray[5],
								profitCentre: oRowDataArray[6],
								itemText: oRowDataArray[7],
								companyCode: oRowDataArray[8].replace(/['"]+/g, "")
							};
							oBulkUploadModelData.push(oTblRowData);
						}

						postDataModel.setProperty("/listNonPoItem", oBulkUploadModelData);
						that.getView().byId("btnSavetemplate").setEnabled(true);
						postDataModel.refresh();

					} else if (that.fileType === "xlsx" || that.fileType === "xls") {
						var workbook = XLSX.read(e.target.result, {
							type: 'binary'
						});
						var sheet_name_list = workbook.SheetNames;
						sheet_name_list.forEach(function (y) { /* iterate through sheets */
							//Convert the cell value to Json
							that.ExcelData = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
						});
						oBulkUploadModelData = that.ExcelData;

						postDataModel.setProperty("/listNonPoItem", oBulkUploadModelData);
						that.getView().byId("btnSavetemplate").setEnabled(true);
						postDataModel.refresh();

					} else {
						sap.m.MessageBox.information("inCorrect Format");
					}

					postDataModel.refresh();
					oFileUploader.setValue(null);
				};
				reader.readAsArrayBuffer(file);

			},

			closeFileExplDialog: function () {
				this.myDialogFragment.close();
			},

			hdrInvAmtCalu: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var inValue = oEvent.getParameter("value");
				if (inValue === "") {
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/invAmtError", "Error");
					sap.m.MessageBox.information("Please Enter Invoice Amount!");
				} else {
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/invAmtError", "None");
					var invAmt = (parseFloat(inValue)).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal", invAmt);
					var aDetails = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader;
					var fBalance = (parseFloat(aDetails.invoiceTotal - aDetails.grossAmount)).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", fBalance);
				}
			},
			fnVendorIdSuggest: function (oEvent) {
				var searchVendorModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(searchVendorModel, "searchVendorModel");
				var value = oEvent.getParameter("suggestValue");
				if (value && value.length > 2) {
					var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
					searchVendorModel.loadData(url, null, true);
					searchVendorModel.attachRequestCompleted(null, function () {
						searchVendorModel.refresh();
					});
				}
			},
			searchVendorAddr: function (oEvt) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
				detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/vendorName", sVendorName);
				detailPageModel.refresh();
			},
			getGLaccountValue: function (oEvent) {
				var glValue = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				if (glValue === "") {
					postDataModel.setProperty(sPath + "/glError", "Error");
					sap.m.MessageBox.information("Please enter G/L Account!");
				} else {
					postDataModel.setProperty(sPath + "/glError", "None");
				}
			},
			companyCodeSuggest: function (oEvent) {

				var sQuery = oEvent.getSource().getValue();
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/CompanyCodeSet?$filter=substringof( '001', CompCode )&$format=json";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var companyCodeModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(companyCodeModel, "companyCodeModel");
				companyCodeModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				companyCodeModel.attachRequestCompleted(function (oEvent) {
					companyCodeModel.refresh();
				});
			},
			glAccountSuggest: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/GLAccountSet?$filter=CompanyCode eq '0001' and GLAccounts eq '*" +
					sQuery + "*'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var glAccountModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(glAccountModel, "glAccountModel");
				glAccountModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				glAccountModel.attachRequestCompleted(function (oEvent) {
					glAccountModel.refresh();
				});
			},
			onChangeCostCenter: function (oEvent) {
				var sCostCenter = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				if (sCostCenter === "") {
					postDataModel.setProperty(sPath + "/costCenterError", "Error");
					sap.m.MessageBox.information("Please Enter Cost Center!");
				} else {
					postDataModel.setProperty(sPath + "/costCenterError", "None");
				}
			},
			onChangeText: function (oEvent) {
				var sText = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				if (sText === "") {
					postDataModel.setProperty(sPath + "/itemTextError", "Error");
					sap.m.MessageBox.information("Please Enter Item Text!");
				} else {
					postDataModel.setProperty(sPath + "/itemTextError", "None");
				}
			},
			costCenterSuggest: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/CostCenterSet?$filter=CompCode eq '0001' and CostCenters eq '*" + sQuery +
					"*'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var costCenterModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(costCenterModel, "costCenterModel");
				costCenterModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				costCenterModel.attachRequestCompleted(function (oEvent) {
					costCenterModel.refresh();
				});
			},
			internalOrderSuggest: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();
				/*	var modelData = this.getView().getModel("detailPageModel").getData();
					var companyCode = modelData.invoiceDetailUIDto.companyCode;*/
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/InternalOrderSearchSet?$filter=SearchString eq '4' and ImpCompCode eq '0001'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var internalOrderModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(internalOrderModel, "internalOrderModel");
				internalOrderModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				internalOrderModel.attachRequestCompleted(function (oEvent) {
					internalOrderModel.refresh();
				});
			},
			deleteNonPoData: function (oEvent) {
				var detailPageModel = this.getView().getModel("postDataModel");
				var index = oEvent.getSource().getParent().getBindingContextPath().split("/")[2];
				var sPath = oEvent.getSource().getParent().getBindingContextPath();
				var sValue = detailPageModel.getProperty(sPath + "/netValue");
				detailPageModel.getData().listNonPoItem.splice(index, 1);
				detailPageModel.refresh();
				var n = detailPageModel.getData().listNonPoItem.length;
				if (n === 0) {
					this.getView().byId("btnSavetemplate").setEnabled(false);
				}
				if (sValue) {
					this.amountCal(oEvent);
				}
			},
			deleteNonPoDataAfterAllocate: function (oEvent) {
				var detailPageModel = this.getView().getModel("postDataModel");
				var index = oEvent.getSource().getParent().getBindingContextPath().split("/")[2];
				var sPath = oEvent.getSource().getParent().getBindingContextPath();
				var sValue = detailPageModel.getProperty(sPath + "/netValue");
				detailPageModel.getData().newCostArray.splice(index, 1);
				detailPageModel.refresh();
				var n = detailPageModel.getData().newCostArray.length;
				// if (n === 0) {
				// 	this.getView().byId("btnSavetemplate").setEnabled(false);
				// }
				if (sValue) {
					this.amountCalAfterAllocate(oEvent);
				}
			},
			addItem: function (oEvt) {
				var postDataModel = this.getView().getModel("postDataModel");
				var postDataModelData = postDataModel.getData();
				if (postDataModelData.newCostArray != undefined) {
					if (postDataModelData.newCostArray.length != 0) {
						// if (!postDataModelData.listNonPoItem) {
						// 	postDataModelData.listNonPoItem = [];
						// }
						var glCode = "";
						var materialDescription = "";
						var crDbIndicator = "H";
						var netValue = "";
						var costCenter = "";
						var internalOrderId = "";
						var profitCenter = "";
						var itemText = "";
						var companyCode = "";
						var templateId = "";
						postDataModelData.newCostArray.unshift({
							"templateId": templateId,
							"glAccount": glCode,
							"costCenter": costCenter,
							"internalOrderId": internalOrderId,
							"materialDescription": materialDescription,
							"crDbIndicator": crDbIndicator,
							"netValue": netValue,
							"profitCenter": profitCenter,
							"percentage": "",
							"itemText": itemText,
							"companyCode": companyCode,
							"assetNo": null,
							"subNumber": null,
							"wbsElement": null,
							"isNonPo": true
						});
						postDataModel.refresh();
					}
				} else {
					var glCode = "";
					var materialDescription = "";
					var crDbIndicator = "H";
					var netValue = "";
					var costCenter = "";
					var internalOrderId = "";
					var profitCenter = "";
					var itemText = "";
					var companyCode = "";
					var templateId = "";
					postDataModelData.listNonPoItem.unshift({
						"templateId": templateId,
						"glAccount": glCode,
						"costCenter": costCenter,
						"internalOrderId": internalOrderId,
						"materialDescription": materialDescription,
						"crDbIndicator": crDbIndicator,
						"netValue": netValue,
						"profitCenter": profitCenter,
						"percentage": "",
						"itemText": itemText,
						"companyCode": companyCode,
						"assetNo": null,
						"subNumber": null,
						"wbsElement": null,
						"isNonPo": true
					});
					postDataModel.refresh();
				}
			},
			onGetallTemp: function () {
				var templateModel = this.getView().getModel("templateModel");
				/*	var growCount = 10;
					templateModel.setProperty("/growCount",growCount);*/
				//	var pageNo = 0;
				//	var url = "InctureApDest/NonPoTemplate/getAll/50/" + pageNo;
				// var url = "InctureApDest/NonPoTemplate/getAll";
				var url = "InctureApDest/NonPoTemplate/selectNonPoTemplate";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {
						// var aData = data;
						// var aTempData = aData.map(function (oRow, index) {
						// 	return oRow.nonPoTemplate;
						// });
						// var aTempItems = aData.map(function (oRow, index) {
						// 	return oRow.nonPoTemplateItems;
						// });
						// templateModel.setProperty("/aTempItems", aTempItems);
						// templateModel.setProperty("/aNonPoTemplate", aTempData);
						// templateModel.setProperty("/aTemplateData", aData);
						templateModel.setProperty("/aNonPoTemplate", data);
					},
					error: function (err) {
						// that._busyDialog.close();
						sap.m.MessageToast.show(err.statusText);
					}
				});
			},
			handleTemplateSearch: function (oEvt) {
				var sValue = oEvt.getParameter("value");
				var oFilter = new Filter("templateName", FilterOperator.Contains, sValue);
				var oBinding = oEvt.getSource().getBinding("items");
				oBinding.filter([oFilter]);
			},
			onSearchAttachments: function (oEvt) {
				var aFilters = [];
				var sQuery = oEvt.getSource().getValue();
				if (sQuery && sQuery.length > 0) {
					var afilter = new sap.ui.model.Filter([
							new sap.ui.model.Filter("fileName", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						false);
					aFilters.push(afilter);
				}
				var oBinding = this.getView().byId("attachListItems").getBinding("items");
				oBinding.filter(aFilters, false);
			},

			onCreateTemp: function () {
				this.selectTemplate.exit();
				var postDataModel = this.getView().getModel("postDataModel");
				var postDataModelData = postDataModel.getData();
				if (postDataModelData.listNonPoItem) {
					postDataModelData.listNonPoItem = [];
				}
				if (!this._oDialog1) {
					this._oDialog1 = sap.ui.xmlfragment("saveTemplate", "com.inc.ApWorkbench.view.fragment.createTemplate", this);
				}
				this.getView().addDependent(this._oDialog1);
				this._oDialog1.open();
			},
			onCancelTemplate: function () {
				this._oDialog1.close();
				this.onSelectTemplate();
			},

			onSelectTemplate: function (oEvt) {
				var that = this;
				var templateModel = this.getView().getModel("templateModel");
				that.selectTemplate = sap.ui.xmlfragment("selectTemplate", "com.inc.ApWorkbench.view.fragment.selectTemplate", that);
				var oDialog = that.selectTemplate;
				// oDialog._oDialog.addButton(new sap.m.Button({
				// 	text: "Create Template",
				// 	type: sap.m.ButtonType.Emphasized,
				// 	press: function (oEvent) {
				// 		that.onCreateTemp();
				// 	}
				// }).addStyleClass("sapUiSizeCompact dynamicCls selectTemplateBtn submitBtnCss"));
				oDialog._oDialog.addButton(new sap.m.Button({
					text: "Allocate",
					type: sap.m.ButtonType.Emphasized,
					press: function (oEvent) {
						var amount = templateModel.getProperty("/aNonPoTemplate/amount");
						if (amount === "") {
							MessageBox.error("Please enter Amount");
						} else {
							that.onSelectokTemp(oEvent);
						}
					}
				}).addStyleClass("sapUiSizeCompact dynamicCls selectTemplateBtn submitBtnCss"));
				oDialog._oDialog.addButton(new sap.m.Button({
					text: "Cancel",
					type: sap.m.ButtonType.Reject,
					press: function (oEvent) {
						var postDataModel = that.getView().getModel("postDataModel");
						var postDataModelData = postDataModel.getData();
						if (postDataModelData.listNonPoItem == []) {
							MessageBox.error("Please Select A Template and allocate");
						} else {
							that.selectTemplate.exit();
						}
					}
				}));

				that.getView().addDependent(that.selectTemplate);
				that.onGetallTemp();
				//templateModel.setProperty("/currentPage", 1);
				that.selectTemplate.open();
				templateModel.refresh();
			},
			onNextTemp: function (oEvent) {
				var templateModel = this.getView().getModel("templateModel");
				var sPage = templateModel.getProperty("/currentPage");
				sPage++;
				templateModel.setProperty("/currentPage", sPage);
				this.onGetallTemp(sPage);
			},
			onPrevTemp: function (oEvent) {
				var templateModel = this.getView().getModel("templateModel");
				var sPage = templateModel.getProperty("/currentPage");
				if (sPage > 1) {
					sPage--;
					templateModel.setProperty("/currentPage", sPage);
					this.onGetallTemp(sPage);
				}
			},
			onDataExport: function (oEvent) {
				var postDataModel = this.getView().getModel("postDataModel");
				var oExport = new Export({

					// Type that will be used to generate the content. Own ExportType's can be created to support other formats
					exportType: new ExportTypeCSV({
						separatorChar: ";"
					}),

					// Pass in the model created above
					models: postDataModel,

					// binding information for the rows aggregation
					rows: {
						path: "/listNonPoItem"
					},

					// column definitions with column name and binding info for the content
					//	aCols = this.createColumnConfig();
					columns: [{
						name: "G/L Account",
						template: {
							content: "{glAccount}"
						}
					}, {
						name: "Description",
						template: {
							content: "{materialDescription}"
						}
					}, {
						name: "Debt/Cred",
						template: {
							content: "{crDbIndicator}"
						}
					}, {
						name: "netValue",
						template: {
							content: "{netValue}"
						}
					}, {
						name: "Cost Centre",
						template: {
							content: "{costCenter}"
						}
					}, {
						name: "Order",
						template: {
							content: "{internalOrderId}"
						}
					}, {
						name: "Profit Centre",
						template: {
							content: "{profitCentre}"
						}
					}, {
						name: "Text",
						template: {
							content: "{itemText}"
						}
					}, {
						name: "Co.Cd",
						template: {
							content: "{companyCode}"
						}
					},
						{
						name: "Acc.Num",
						template: {
							content: "{accNumber}"
						}
						}
					]
				});

				// download exported file
				oExport.saveFile("NonPoTemplateData").catch(function (oError) {
					sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
				}).then(function () {
					oExport.destroy();
				});
				//	}
			},
			onVendorbalances: function () {
				var vendorBalanceModel =  this.getView().getModel("vendorBalanceModel");
				var data = vendorBalanceModel.getProperty("/d/results")[0].ToVendorBalance.results;
				this.getView().getModel("vendorBalanceModel").setProperty("/vendorBalance", data);
				if (!this._oDialog5) {
					this._oDialog5 = sap.ui.xmlfragment("vendorBalance", "com.inc.ApWorkbench.view.fragment.vendorbalances", this);
				}
				// this._oDialog5.setModel(vendorBalanceModel);
				this.getView().addDependent(this._oDialog5);
				this._oDialog5.open();
			},
			fncloseVendorBlc: function () {
				this._oDialog5.close();
			},
			onSaveTemplate: function (oEvt) {
				//var oGlobTempModel = this.getView().getModel("templateModel");
				var postDataModel = this.getView().getModel("postDataModel");
				var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
				var bflag = true;
				for (var i = 0; i < alistNonPoData.length; i++) {
					//To handle validations
					postDataModel.setProperty("/listNonPoItem/" + i + "/netValue", "");
					var bValidate = false;
					if (alistNonPoData[i].glAccount === "" || alistNonPoData[i].glError === "Error") {
						bValidate = true;
						alistNonPoData[i].glError = "Error";
					}
					// if (alistNonPoData[i].netValue === "" || alistNonPoData[i].amountError === "Error") {
					// 	bValidate = true;
					// 	alistNonPoData[i].amountError = "Error";
					// }
					if (alistNonPoData[i].costCenter === "" || alistNonPoData[i].costCenterError === "Error") {
						bValidate = true;
						alistNonPoData[i].costCenterError = "Error";
					}
					if (alistNonPoData[i].itemText === "" || alistNonPoData[i].itemTextError === "Error") {
						bValidate = true;
						alistNonPoData[i].itemTextError = "Error";
					}
					if (bValidate) {
						bflag = false;
						//break;
						continue;
					}
				}
				if (!bflag) {
					postDataModel.setProperty("/listNonPoItem", alistNonPoData);
					var sMsg = "Please Enter Required Fields G/L Account,Amount,Cost Center & Text!";
					sap.m.MessageBox.alert(sMsg);
					return;
				} else {
					// if (!this.saveTemplate) {
					// 	sap.ui.getCore().byId("saveTempFragID");
					// 	this.saveTemplate = sap.ui.xmlfragment("saveTemplate", "com.inc.ApWorkbench.view.fragment.saveTemplate", this);
					// }
					// this.getView().addDependent(this.saveTemplate);
					// this.saveTemplate.open();
					this.onSaveTemp();
				}
				// var url = "InctureApDest/NonPoTemplate/getAll";
				// var templateModel = this.getView().getModel("templateModel");
				// jQuery.ajax({
				// 	type: "GET",
				// 	contentType: "application/json",
				// 	url: url,
				// 	dataType: "json",
				// 	async: true,
				// 	success: function (data, textStatus, jqXHR) {
				// 		var aData = data;
				// 		var aTempData = aData.map(function (oRow, index) {
				// 			return oRow.nonPoTemplate;
				// 		});
				// 		var aTempDataItems = aData.map(function (oRow, index) {
				// 			return oRow.nonPoTemplateItems;
				// 		});
				// 		templateModel.setProperty("/aNonPoTemplate", aTempData);
				// 		templateModel.setProperty("/aNonPoTemplateItems", aTempDataItems);
				// 		templateModel.setProperty("/aTemplateData", aData);
				// 	},
				// 	error: function (err) {
				// 		sap.m.MessageToast.show(err.statusText);
				// 	}
				// });
				this.onGetallTemp();
			},

			// End PO Data Functions
			onSelectokTemp: function (oEvent) {
				var that = this;
				var postDataModel = this.getView().getModel("postDataModel");
				var postDataModelData = postDataModel.getData();
				postDataModelData.listNonPoItem.length = 0;
				var oInvoiceModel = this.getView().getModel("oInvoiceModel");
				var templateModel = this.getView().getModel("templateModel");
				// var postDataModel = this.getView().getModel("postDataModel");
				var aNonPoTemplate = templateModel.getProperty("/aNonPoTemplate");
				// var amount = templateModel.getProperty("/aNonPoTemplate/amount");
				var len = this.selectTemplate._oTable._aSelectedPaths.length;
				var bflag = true;
				for (var t = 0; t < len; t++) {
					var pathcheck = this.selectTemplate._oTable._aSelectedPaths[t];
					var check = templateModel.getProperty(pathcheck + "/amount");
					var flag = false;
					if (check == null) {
						flag = true;
					}
					if (flag) {
						bflag = false;
					}
				}
				if (!bflag) {
					MessageBox.error("Please enter Amount!");
					return;
				} else if (len > 0) {
					var arr = [];
					for (var i = 0; i < len; i++) {
						var sIndx = this.selectTemplate._oTable._aSelectedPaths[i].split("/")[2];
						var aIndexValue = Number(sIndx);
						arr.push(aIndexValue);
					}
					that.openBusyDialog();
					var listNonPoItem = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
					var arrLength = arr.length;
					var obj = [];
					for (var j = 0; j < arrLength; j++) {
						obj.push({
							"templateId": aNonPoTemplate[arr[j]].templateId,
							"templateName": aNonPoTemplate[arr[j]].templateName,
							"amount": aNonPoTemplate[arr[j]].amount
						});
					}
					// var sUrl = "InctureApDest/NonPoTemplate/getItemsByTemplateId/" + tempid;
					var sUrl = "InctureApDest/costAllocation/getCostAllocationForTemplate";
					jQuery.ajax({
						type: "POST",
						contentType: "application/json",
						url: sUrl,
						dataType: "json",
						data: JSON.stringify(obj),
						success: function (data, textStatus, jqXHR) {

							var aData = data;
							for (var k = 0; k < aData.length; k++) {
								listNonPoItem.push(aData[k]);
							}
							if (listNonPoItem.length) {
								oInvoiceModel.setProperty("/bEnable", true);
							}

							postDataModel.setProperty("/listNonPoItem", listNonPoItem);
							that.selectTemplate.exit();
							that.closeBusyDialog();
							if (!that._oDialog2) {
								that._oDialog2 = sap.ui.xmlfragment("previewTemplate", "com.inc.ApWorkbench.view.fragment.previewTemplate", that);
							}
							that.getView().addDependent(that._oDialog2);
							that._oDialog2.open();
						},
						error: function (err) {
							that.closeBusyDialog();
							sap.m.MessageToast.show(err.statusText);
						}
					});
					postDataModel.refresh();
					templateModel.refresh();

					// }
				} else {
					MessageBox.error("Please Select atleast one Template!");
				}

			},

			onPreviewCancel: function () {
				var that = this;
				var postDataModel = this.getView().getModel("postDataModel");
				var detailPageModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(detailPageModel, "detailPageModel");
				var postDataModelData = postDataModel.getData();
				// if (postDataModelData.newCostArray.length || postDataModelData.listNonPoItem.length) {
				postDataModelData.listNonPoItem.length = 0;
				// postDataModelData.newCostArray.length = 0;
				// }
				this._oDialog2.close();
				var id = postDataModel.getProperty("/requestId");
				var url = "InctureApDest/invoiceHeader?requestId=" + id;
				jQuery
					.ajax({
						url: url,
						type: "GET",
						dataType: "json",
						success: function (result) {
							var aData = result;
							detailPageModel.setProperty("/invoiceDetailUIDto", aData);
							var paymentTerm = that.getView().getModel("paymentModel").getProperty("/d/results")[0].PaymentTerms;
							var paymentMethod = that.getView().getModel("paymentMethodModel").getProperty("/d/results")[0].PaymentMeth;
							var paymentBlock = that.getView().getModel("paymentBlockModel").getProperty("/d/results")[0].VdrPaymentBlock;
							detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/paymentTerms", paymentTerm);
							detailPageModel.setProperty("/invoiceDetailUIDto/paymentMethod", paymentMethod);
							detailPageModel.setProperty("/invoiceDetailUIDto/paymentBlock", paymentBlock);
							postDataModel.setProperty("/listNonPoItem", result.costAllocation);
							var aCostAllocationData = postDataModel.getProperty("/listNonPoItem");
							if (aCostAllocationData) {
								oInvoiceModel.setProperty("/bEnable", true);
							}
							that.amtCalculation();
							that.getPdfData();
							that.getCommentData();
							that.selectedObjects = [];
							that.selectedTab = "nonPO";
							that._getUser();
							detailPageModel.refresh();
							postDataModel.refresh();
						},
						error: function (e) {
							MessageBox.error(e.message);
						}
					});
				this.onSelectTemplate();
			},
			onChangeAmount: function (oEvent) {
				var data = oEvent.getSource().getValue();
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").sPath;
				postDataModel.setProperty(sPath + "/amount", data);
				var amount = postDataModel.getProperty(sPath + "/amount");
				var l = postDataModel.getProperty(sPath + "/costAllocationList").length;
				for (var t = 0; t < l; t++) {
					var p = postDataModel.getProperty(sPath + "/costAllocationList")[t].allPer;
					var cal = (amount / 100) * p;
					postDataModel.getProperty(sPath + "/costAllocationList")[t].netValue = cal.tofixed(3);
				}
				postDataModel.refresh();
			},
			onManageTemplate: function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("ManageTemplate");

			},
			onConfirmTemplate: function () {
				var that = this;
				var detailPageModel = this.getView().getModel("detailPageModel");
				var postDataModel = this.getView().getModel("postDataModel")
				postDataModel.setProperty("/visbility/DefaultTemplateTable", false);
				this.getView().getModel("postDataModel").setProperty("/visbility/NewTemplateTable", true);
				var a = postDataModel.getProperty("/listNonPoItem");
				if (postDataModel.getData().newCostArray == undefined) {
					var newCostArray = [];
				} else if (postDataModel.getData().newCostArray != undefined) {
					newCostArray = postDataModel.getProperty("/newCostArray");
				}
				for (var z = 0; z < a.length; z++) {
					var c = a[z].costAllocationList;
					newCostArray = newCostArray.concat(c);
					c = [];
				}
				postDataModel.setProperty("/newCostArray", newCostArray);
				var totalAmt = 0;
				if (postDataModel.getProperty("/newCostArray")) {
					var length = postDataModel.getProperty("/newCostArray").length;
					for (var i = 0; i < length; i++) {
						if (postDataModel.getProperty("/newCostArray/" + i + "/netValue") && postDataModel.getProperty("/newCostArray/" + i +
								"/crDbIndicator") === "H") {
							totalAmt += that.nanValCheck(postDataModel.getProperty("/newCostArray/" + i + "/netValue"));

						} else if (postDataModel.getProperty("/newCostArray/" + i + "/netValue") && postDataModel.getProperty("/newCostArray/" + i +
								"/crDbIndicator") === "S") {
							totalAmt -= that.nanValCheck(postDataModel.getProperty("/newCostArray/" + i + "/netValue"));
						}
					}
					totalAmt = that.nanValCheck(totalAmt).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/grossAmount", totalAmt);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", totalAmt);
					var invAmt = that.nanValCheck(detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal"));
					var diff = that.nanValCheck(invAmt) - that.nanValCheck(totalAmt);
					diff = that.nanValCheck(diff).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", diff);
					detailPageModel.refresh();
					postDataModel.refresh();
					this._oDialog2.close();
				}
			},
			onDeleteTemp: function (oEvent) {
				var that = this;
				var templateModel = this.getView().getModel("templateModel");
				var aNonPoTemplate = templateModel.getProperty("/aNonPoTemplate");
				var len = this.selectTemplate._oTable._aSelectedPaths.length;
				if (len > 0) {
					var arr = [];
					for (var i = 0; i < len; i++) {
						var sIndx = this.selectTemplate._oTable._aSelectedPaths[i].split("/")[2];
						var aIndexValue = Number(sIndx);
						arr.push(aIndexValue);
					}
					var arrLength = arr.length;
					for (var j = 0; j < arrLength; j++) {
						var tempid = aNonPoTemplate[arr[j]].templateId;
						var url = "InctureApDest/NonPoTemplate/delete/" + tempid;
						that.onDeleteofNonpoTemplate(aNonPoTemplate, url, tempid);
						templateModel.refresh();
					}
				} else {
					MessageBox.error("Please Select Template Name!");
				}
			},
			onDeleteofNonpoTemplate: function (aNonPoTemplate, sUrl, tempid) {
				var that = this;
				var templateModel = this.getView().getModel("templateModel");
				jQuery
					.ajax({
						url: sUrl,
						contentType: "application/json",
						type: "DELETE",
						beforeSend: function (xhr) {
							var token = that.getCSRFToken();
							xhr.setRequestHeader("X-CSRF-Token", token);
							xhr.setRequestHeader("Accept", "application/json");
						},
						//	success: function (Success) {
						success: function (Success) {
							var iIndex = aNonPoTemplate.findIndex(function (oRow) {
								return oRow.templateId === tempid;
							});
							// that.onSelectTemplate();
							aNonPoTemplate.splice(iIndex, 1);
							templateModel.setProperty("/aNonPoTemplate", aNonPoTemplate);
							sap.m.MessageToast.show(Success.message);
						},
						error: function (e) {
							//  console.log(e);
						}
					});
			},
			getCSRFToken: function () {
				var url = "InctureApDest/invoiceHeader/getAll";
				var token = null;
				$.ajax({
					url: url,
					type: "GET",
					async: false,
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRF-Token", "Fetch");
					},
					complete: function (xhr) {
						token = xhr.getResponseHeader("X-CSRF-Token");
					}
				});
				return token;
			},
			onSaveTemp: function (oEvent) {
				var oGlobTempModel = this.getView().getModel("templateModel");
				// if (oEvent.getSource().getText() === "Cancel") {
				// 	sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
				// 	if (sap.ui.getCore().byId("saveTemplate--updateInput").setSelectedItem()) {
				// 		sap.ui.getCore().byId("saveTemplate--updateInput").setSelectedItem("");
				// 	}
				// 	oGlobTempModel.setProperty("/sUpdateTemplate", "");
				// 	this.saveTemplate.close();
				// } else {

				var detailPageModel = this.getView().getModel("detailPageModel");
				var sVendorId = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.vendorId;
				var postDataModel = this.getView().getModel("postDataModel");
				var postUpdateModel = new sap.ui.model.json.JSONModel();
				var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoData"));
				var olistNonPoData = alistNonPoData.find(function (oRow) {
					return oRow.nonPoTemplate;
				});
				if (olistNonPoData) {
					var tempid = olistNonPoData.nonPoTemplate.templateId;
					var uuid = olistNonPoData.nonPoTemplate.uuid;
				}
				// if (this.saveTemplate.getContent()[0].getItems()[0].getSelected()) {
				// 	var oTemplateModel = this.getView().getModel("templateModel");
				// 	var templateId = oTemplateModel.getProperty("/sTemplateNewname");
				// 	if (templateId) {
				// 		var oDate = new Date();
				// 		this.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				// 			pattern: "yyyy-MM-dd"
				// 		});
				// 		var dDate = this.dateFormat.format(oDate);
				// 		if (templateId !== "null") {
				// 			var objUpdate = {
				// 				"nonPoTemplate": {
				// 					"uuid": uuid,
				// 					"templateId": tempid,
				// 					"accClerkId": null,
				// 					"basecoderId": null,
				// 					"vendorId": sVendorId,
				// 					"templateName": templateId,
				// 					"createdBy": "Saikat",
				// 					"createdAt": dDate,
				// 					"updatedBy": "Saikat",
				// 					"updatedAt": dDate
				// 				}
				// 			};
				// 			postUpdateModel.setData(objUpdate);
				// 			postUpdateModel.getData().nonPoTemplateItems = [];
				// 			var iListNonPoLen = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
				// 			var len = iListNonPoLen.length;
				// 			if (!len) {
				// 				oTemplateModel.setProperty("/sPreviousVal", undefined);
				// 				return;
				// 			}
				// 			oTemplateModel.setProperty("/sPreviousVal", undefined);
				// 			for (var i = 0; i < len; i++) {
				// 				postUpdateModel.getData().nonPoTemplateItems.push(postDataModel.getData().listNonPoItem[i]);
				// 				postUpdateModel.getData().nonPoTemplateItems[i].templateId = tempid;
				// 			}
				// 			var url = "InctureApDest/NonPoTemplate/update";
				// 			var dataObj = postUpdateModel.getData();
				// 			var that = this;
				// 			jQuery
				// 				.ajax({
				// 					url: url,
				// 					dataType: "json",
				// 					data: JSON.stringify(dataObj),
				// 					contentType: "application/json",
				// 					type: "PUT",
				// 					beforeSend: function (xhr) {
				// 						var token = that.getCSRFToken();
				// 						xhr.setRequestHeader("X-CSRF-Token", token);
				// 						xhr.setRequestHeader("Accept", "application/json");
				// 					},
				// 					success: function (Success) {
				// 						oGlobTempModel.setProperty("/sUpdateTemplate", templateId);
				// 						that.saveTemplate.close();
				// 						sap.m.MessageToast.show(Success.message);
				// 					},
				// 					error: function (e) {}
				// 				});
				// 		}
				// 	}
				// } else if (this.saveTemplate.getContent()[1].getItems()[0].getSelected()) {

				var createModel = new sap.ui.model.json.JSONModel();
				var dataModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(dataModel, "dataModel");
				var dataModelData = this.getView().getModel("dataModel").getData();
				dataModelData.listNonPoItem = [];
				if (sap.ui.getCore().byId("saveTemplate--saveInput").getValue() !== "") {
					var templateModel = this.getView().getModel("templateModel");
					templateModel.setProperty("/sPreviousVal", undefined);
					var tempName = sap.ui.getCore().byId("saveTemplate--saveInput").getValue();
					var tempId = tempName;
					var oDate = new Date();
					this.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					});
					var dDate = this.dateFormat.format(oDate);
					var objNonpoTemp = {
						"nonPoTemplate": {
							"templateId": tempId,
							"vendorId": sVendorId,
							"templateName": tempName,
							"createdBy": "Saikat",
							"createdAt": null,
							"updatedBy": "Saikat",
							"updatedAt": null
						}
					};
					dataModel.setData(objNonpoTemp);
					dataModel.getData().nonPoTemplateItems = [];
					var len = postDataModel.getData().listNonPoItem.length;
					for (var indx = 0; indx < len; indx++) {
						dataModel.getData().nonPoTemplateItems.push(postDataModel.getData().listNonPoItem[indx]);
						dataModel.getData().nonPoTemplateItems[indx].templateId = tempId;
					}
					var sUrl = "InctureApDest/NonPoTemplate/save",
						dataObj = dataModel.getData();
					var that = this;
					jQuery
						.ajax({
							url: sUrl,
							dataType: "json",
							data: JSON.stringify(dataObj),
							contentType: "application/json",
							type: "POST",
							beforeSend: function (xhr) {
								var token = that.getCSRFToken();
								xhr.setRequestHeader("X-CSRF-Token", token);
								xhr.setRequestHeader("Accept", "application/json");
							},
							success: function (Success) {
								templateModel.setProperty("/sUpdateTemplate", tempName);
								that.saveTemplate.close();
								sap.m.MessageToast.show(Success.message);
							},
							error: function (e) {
								//  console.log(e);
							}
						});
				} else {
					sap.m.MessageBox.information("Please Enter Template Name!");
				}

				// }

				// }
				sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
				this._oDialog1.close();
				this.onSelectTemplate();
			},
			onSelect: function (oEvent) {
				if (oEvent.mParameters.selected) {
					this.saveTemplate.getContent()[0].getItems()[1].setEnabled(true);
					this.saveTemplate.getContent()[1].getItems()[1].setEnabled(false);
					sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
					sap.ui.getCore().byId("saveTemplate--saveInput").setSelectedItem("");
				}
			},
			onSelectRadio: function (oEvent) {
				if (oEvent.mParameters.selected) {
					this.saveTemplate.getContent()[0].getItems()[1].setEnabled(false);
					this.saveTemplate.getContent()[1].getItems()[1].setEnabled(true);
					sap.ui.getCore().byId("saveTemplate--updateInput").setValue("");
					sap.ui.getCore().byId("saveTemplate--updateInput").setSelectedItem("");
					var oTemplateModel = this.getView().getModel("templateModel");
					oTemplateModel.setProperty("/sPreviousVal", undefined);
				}
			},

			nanValCheck: function (value) {
				if (!value || value == NaN || value == "NaN" || isNaN(value)) {
					return 0;
				} else if (Number(value) != NaN) {
					if (parseFloat(value) == -0) {
						return 0;
					}
					return parseFloat(value);
				} else if (value == "0" || value == "0.00" || value == "-0.00") {
					return 0;
				}
				return value;
			},
			decimalValCheck: function (oEvent) {
				var input = oEvent.getSource().getValue();
				if (input) {
					var newchar = input.length;
					newchar--;
					var ascii = input.charCodeAt(newchar);
					if (!((ascii > 47 && ascii < 58) || ascii == 46)) {
						oEvent.getSource().setValue(input.substring(0, newchar));
						//  sap.m.MessageToast.show("Invalid entry !");
					}
					var indexV = input.indexOf(".");
					if (indexV != -1) {
						indexV = indexV + 3;
						if (input.length > indexV) {
							var regex = /(^\d{0,8})+(\.?\d{0,3})?$/;
							input = input.substring(0, indexV);
							if (regex.test(input)) {
								oEvent.getSource().setValue(input);
								//  return;
							} else {
								// sap.m.MessageToast.show("Invalid entry !");
							}
						}
					} else if (!isNaN(input)) {
						var intRegex = /^[1-9]\d{0,9}$/;
						if (intRegex.test(input)) {
							oEvent.getSource().setValue(input.substring(0, 9));
							//  return;
						}
					}
				}
			},
			decimalChk: function (oEvent, decimalVal) {
				var val = oEvent.getSource().getValue();
				if (val) {
					isNaN(val) ? val : val = parseFloat(val).toFixed(3);
					if (decimalVal == 3) {
						var regexp = /^\d+(\.\d{0,3})?$/;
						isNaN(val) ? val : val = parseFloat(val).toFixed(3);
					} else {
						var regexp = /^\d+(\.\d{0,2})?$/;
						isNaN(val) ? val : val = parseFloat(val).toFixed(2);
					}
					var flag = regexp.test(val) ? true : oEvent.getSource().setValue("").setValueState("Error");
					if (regexp.test(val)) {
						oEvent.getSource().setValue(val);
						return true;
					} else {
						return false;
					}
				}
				return true;
			},

			paymentTermValueHelp: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue();
				//this.inputId = oEvent.getSource().getId();
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function () {
					paymentModel.refresh();
				});
				// create value help dialog
				if (!this.paymentTermValueHelpDialog) {

					this.paymentTermValueHelpDialog = sap.ui.xmlfragment("paymentTermValueHelpDialog",
						"com.inc.ApWorkbench.view.fragment.paymentTermValueHelp", this);
					this.getView().addDependent(this.paymentTermValueHelpDialog);
				}
				// open value help dialog filtered by the input value
				this.paymentTermValueHelpDialog.open(sInputValue);
			},
			handlepaymentTermClose: function (evt) {
				var oSelectedItem = evt.getParameter("selectedItem");
				if (oSelectedItem) {
					var productInput = this.getView().byId("paymentTermId");
					productInput.setValue(oSelectedItem.getTitle());
				}
			},

			handlepaymentTermSearch: function (oEvent) {
				var aFilters = [];
				var sQuery = oEvent.getParameter("value");
				var filterArry = [];
				var metaModel = ["Key", "Value"];
				if (sQuery && sQuery.length > 0) {
					for (var i = 0; i < metaModel.length; i++) {
						var bindingName = metaModel[i];
						filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
					}
					var filter = new sap.ui.model.Filter(filterArry, false);
					aFilters.push(filter);
				}
				// update list binding
				var binding = oEvent.getSource().getBinding("items");
				binding.filter(aFilters, "Application");
			},
			paymentTermSuggestion: function (oEvent) {

				var sQuery = oEvent.getSource().getValue();
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSetSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function () {
					paymentModel.refresh();
				});

			},
			paymentSuggestion: function () {
				var modelData = this.getView().getModel("detailPageModel").getData();
				var vendorId = modelData.invoiceDetailUIDto.vendorId;
				var companyCode = modelData.invoiceDetailUIDto.companyCode;
				var pmUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentMethodsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001' ";
				var pbUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentBlockSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSetSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};

				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function (oEvent) {
					paymentModel.refresh();
				});

				var paymentMethodModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentMethodModel, "paymentMethodModel");
				paymentMethodModel.loadData(pmUrl, null, true, "Get", false, false, oHeader);
				paymentMethodModel.attachRequestCompleted(function (oEvent) {
					paymentMethodModel.refresh();
				});
				var paymentBlockModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentBlockModel, "paymentBlockModel");
				paymentBlockModel.loadData(pbUrl, null, true, "Get", false, false, oHeader);
				paymentBlockModel.attachRequestCompleted(function (oEvent) {
					paymentBlockModel.refresh();
				});
			},
			glDescription: function (oEvt) {
				var glAccountDes = oEvt.getParameter("selectedItem").getProperty("additionalText");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvt.getSource().getBindingContext("postDataModel").sPath;
				postDataModel.setProperty(sPath + "/materialDescription", glAccountDes);
				postDataModel.refresh();
			},
			amtCalculation: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var aDetails = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader;
				aDetails.balance = (parseFloat(aDetails.invoiceTotal - aDetails.grossAmount)).toFixed(3);
			},
			amountCal: function (oEvent) {
				if (!that) {
					var that = this;
				}
				//var amountVal = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				var amountVal = postDataModel.getProperty(sPath + "/netValue");
				if (amountVal === "") {
					postDataModel.setProperty(sPath + "/amountError", "Error");
					sap.m.MessageBox.error("Please enter Amount!");
				} else {
					postDataModel.setProperty(sPath + "/amountError", "None");
				}
				var detailPageModel = that.getView().getModel("detailPageModel");
				var sDecValue = parseFloat(amountVal).toFixed(3);
				postDataModel.setProperty(sPath + "/netValue", sDecValue);
				var totalAmt = 0;
				if (postDataModel.getProperty("/listNonPoItem")) {
					var length = postDataModel.getProperty("/listNonPoItem").length;
					for (var i = 0; i < length; i++) {
						if (postDataModel.getProperty("/listNonPoItem/" + i + "/netValue") && postDataModel.getProperty("/listNonPoItem/" + i +
								"/crDbIndicator") === "H") {
							totalAmt += that.nanValCheck(postDataModel.getProperty("/listNonPoItem/" + i + "/netValue"));

						} else if (postDataModel.getProperty("/listNonPoItem/" + i + "/netValue") && postDataModel.getProperty("/listNonPoItem/" + i +
								"/crDbIndicator") === "S") {
							totalAmt -= that.nanValCheck(postDataModel.getProperty("/listNonPoItem/" + i + "/netValue"));
						}
					}
					totalAmt = that.nanValCheck(totalAmt).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/grossAmount", totalAmt);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", totalAmt);
					var invAmt = that.nanValCheck(detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal"));
					var diff = that.nanValCheck(invAmt) - that.nanValCheck(totalAmt);
					diff = that.nanValCheck(diff).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", diff);
					detailPageModel.refresh();
					postDataModel.refresh();
				}
			},
			amountCalAfterAllocate: function (oEvent) {
				if (!that) {
					var that = this;
				}
				//var amountVal = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				var amountVal = postDataModel.getProperty(sPath + "/netValue");
				if (amountVal === "") {
					postDataModel.setProperty(sPath + "/amountError", "Error");
					sap.m.MessageBox.information("Please enter Amount!");
				} else {
					postDataModel.setProperty(sPath + "/amountError", "None");
				}
				var detailPageModel = that.getView().getModel("detailPageModel");
				var sDecValue = parseFloat(amountVal).toFixed(3);
				postDataModel.setProperty(sPath + "/netValue", sDecValue);
				var totalAmt = 0;
				if (postDataModel.getProperty("/newCostArray")) {
					var length = postDataModel.getProperty("/newCostArray").length;
					for (var i = 0; i < length; i++) {
						if (postDataModel.getProperty("/newCostArray/" + i + "/netValue") && postDataModel.getProperty("/newCostArray/" + i +
								"/crDbIndicator") === "H") {
							totalAmt += that.nanValCheck(postDataModel.getProperty("/newCostArray/" + i + "/netValue"));

						} else if (postDataModel.getProperty("/newCostArray/" + i + "/netValue") && postDataModel.getProperty("/newCostArray/" + i +
								"/crDbIndicator") === "S") {
							totalAmt -= that.nanValCheck(postDataModel.getProperty("/newCostArray/" + i + "/netValue"));
						}
					}
					totalAmt = that.nanValCheck(totalAmt).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/grossAmount", totalAmt);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", totalAmt);
					var invAmt = that.nanValCheck(detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal"));
					var diff = that.nanValCheck(invAmt) - that.nanValCheck(totalAmt);
					diff = that.nanValCheck(diff).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", diff);
					detailPageModel.refresh();
					postDataModel.refresh();
				}
			},
			updateDataChangeInTemplete: function (oEvent) {

				var templateData = this.getView().getModel("templateModel");
				var postDataModel = this.getView().getModel("postDataModel");
				var sNewValue = oEvent.getParameter("newValue");
				if (!sNewValue) {
					sap.m.MessageBox.information("Please enter Template Name!");
				} else {
					var aTemplateData = templateData.getProperty("/aTemplateData");
					var sPreviousCboxVal = oEvent.getSource().getProperty("value");
					var sPreviousVal = templateData.getProperty("/sPreviousVal");
					if (!sPreviousVal) {
						templateData.setProperty("/sPreviousVal", sPreviousCboxVal);
					}
					var aNonPoTemplate = $.extend(true, [], templateData.getProperty("/aNonPoTemplate"));
					if (sPreviousVal === sNewValue || sPreviousVal === undefined || aNonPoTemplate.some(function (oRow) {
							return oRow.templateName === sNewValue;
						})) {
						var sUpdatebox = oEvent.getSource().getValue();
						var bSetUpdateTemp = templateData.getProperty("/bSetUpdateTemp");
						postDataModel.setProperty("/listNonPoItem", []);
						var aSelectedData = aTemplateData.filter(function (oRow) {
							return oRow.nonPoTemplate.templateName === sUpdatebox;
						});
						var aTempItems = aSelectedData.map(function (oRow) {
							return oRow.nonPoTemplateItems;
						});
						var aSelectedItems = aTempItems.find(function (oRow) {
							return oRow;
						});
						templateData.setProperty("/bUpdatedFlag", true);
						templateData.setProperty("/bSetUpdateTemp", false);
						postDataModel.setProperty("/listNonPoData", aSelectedData);
						postDataModel.setProperty("/listNonPoItem", aSelectedItems);
						templateData.setProperty("/sTemplateNewname", sNewValue);
					} else if (sNewValue) {
						templateData.setProperty("/sTemplateNewname", sNewValue);
					}
					postDataModel.refresh();
				}
			},
			_fnOnSaveCall: function () {

				var detailPageModel = this.getView().getModel("detailPageModel"),
					detailPageModelData = detailPageModel.getData();
				var createdAt = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceDate");
				var objSaveData = jQuery.extend({}, detailPageModelData.invoiceDetailUIDto);
				var postDataModel = this.getView().getModel("postDataModel");
				objSaveData.costAllocation = [];
				if (postDataModel.getData().newCostArray != undefined) {
					for (var i = 0; i < postDataModel.getData().newCostArray.length; i++) {
						var reqId = objSaveData.invoiceHeader.requestId ? objSaveData.invoiceHeader.requestId : null;
						var itemId = postDataModel.getData().newCostArray[i].itemId ? postDataModel.getData().newCostArray[i].itemId : null;
						objSaveData.costAllocation.push({
							"requestId": reqId,
							"itemId": itemId,
							"serialNo": 0,
							"deleteInd": null,
							"quantity": "0.00",
							"distrPerc": null,
							"subNumber": null,
							"netValue": postDataModel.getData().newCostArray[i].netValue,
							// "materialDescription": postDataModel.getData().listNonPoItem[i].materialDescription,
							"crDbIndicator": postDataModel.getData().newCostArray[i].crDbIndicator,
							"glAccount": postDataModel.getData().newCostArray[i].glAccount,
							"costCenter": postDataModel.getData().newCostArray[i].costCenter,
							"internalOrderId": postDataModel.getData().newCostArray[i].internalOrderId,
							"profitCenter": postDataModel.getData().newCostArray[i].profitCenter,
							"assetNo": postDataModel.getData().newCostArray[i].asset,
							"itemText": postDataModel.getData().newCostArray[i].itemText,
							"wbsElement": ""
						});
					}
				} else {
					for (var i = 0; i < postDataModel.getData().listNonPoItem.length; i++) {
						var reqId = objSaveData.invoiceHeader.requestId ? objSaveData.invoiceHeader.requestId : null;
						var itemId = postDataModel.getData().listNonPoItem[i].itemId ? postDataModel.getData().listNonPoItem[i].itemId : null;
						objSaveData.costAllocation.push({
							"requestId": reqId,
							"itemId": itemId,
							"serialNo": 0,
							"deleteInd": null,
							"quantity": "0.00",
							"distrPerc": null,
							"subNumber": null,
							"netValue": postDataModel.getData().listNonPoItem[i].netValue,
							// "materialDescription": postDataModel.getData().listNonPoItem[i].materialDescription,
							"crDbIndicator": postDataModel.getData().listNonPoItem[i].crDbIndicator,
							"glAccount": postDataModel.getData().listNonPoItem[i].glAccount,
							"costCenter": postDataModel.getData().listNonPoItem[i].costCenter,
							"internalOrderId": postDataModel.getData().listNonPoItem[i].internalOrderId,
							"profitCenter": postDataModel.getData().listNonPoItem[i].profitCenter,
							"assetNo": postDataModel.getData().listNonPoItem[i].asset,
							"itemText": postDataModel.getData().listNonPoItem[i].itemText,
							"wbsElement": ""
						});
					}
				}
				/*		var year = objSaveData.invoiceHeader.createdAt.slice(0, 4);
						var Mon = objSaveData.invoiceHeader.createdAt.slice(4, 6);
						var date = objSaveData.invoiceHeader.createdAt.slice(6, 8);
						var fulldate = year + "-" + Mon + "-" + date;*/
				objSaveData.invoiceHeader.createdAt = createdAt;
				objSaveData.invoiceHeader.postingDate = objSaveData.invoiceHeader.postingDate ? new Date(objSaveData.invoiceHeader.postingDate).getTime() :
					null;
				var obj = {};
				obj.attachments = [];
				if (detailPageModel.getData().docManagerDto && detailPageModel.getData().docManagerDto.length > 0) {
					for (var n = 0; n < detailPageModel.getData().docManagerDto.length; n++) {
						obj.attachments.push(detailPageModel.getData().docManagerDto[n]);
					}
				}
				obj.commentDto = [];
				if (detailPageModel.getData().invoiceDetailUIDto.commentDto && detailPageModel.getData().invoiceDetailUIDto.commentDto.length > 0) {
					for (var k = 0; k < detailPageModel.getData().invoiceDetailUIDto.commentDto.length; k++) {
						obj.commentDto.push(detailPageModel.getData().invoiceDetailUIDto.commentDto[k]);
					}
				}
				obj.invoiceHeader = objSaveData.invoiceHeader;
				obj.invoiceItems = objSaveData.invoiceItems;
				obj.costAllocation = objSaveData.costAllocation;
				return obj;
			},
			onPostComment: function (oEvent) {
				var that = this;
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sValue = oEvent.getParameter("value");
				var detailPageModelData = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader;
				var dDate = new Date();
				var sDate = dDate.getTime();
				if (!detailPageModel.getData().invoiceDetailUIDto.commentDto) {
					detailPageModel.getData().invoiceDetailUIDto.commentDto = [];
				}
				var sId = detailPageModel.getProperty("/commentId");
				var cValue = detailPageModel.getProperty("/input");
				var aCommentSelected = detailPageModel.getData().invoiceDetailUIDto.commentDto;
				var aComItem = aCommentSelected.find(function (oRow, index) {
					return oRow.comment === cValue;
				});

				var aSelected = detailPageModel.getData().invoiceDetailUIDto.commentDto;
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
						"requestId": detailPageModelData.requestId,
						"comment": sValue,
						"createdBy": that.getView().getModel("oUserModel").getProperty("/email"),
						"createdAt": sDate,
						"updatedBy": null,
						"updatedAt": null,
						"user": detailPageModelData.emailFrom
					};
					var aEntries = detailPageModel.getData().invoiceDetailUIDto.commentDto;
					aEntries.unshift(oComment);
				}
				detailPageModel.setProperty("/commentId", "");
				this.getView().getModel("detailPageModel").refresh();
			},
			fnEditComment: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sPath = oEvent.getSource().getBindingContext("detailPageModel").getPath();
				var sId = detailPageModel.getProperty(sPath).commentId;
				var sValue = detailPageModel.getProperty(sPath).comment;
				detailPageModel.setProperty("/input", sValue);
				detailPageModel.setProperty("/commentId", sId);
				this.getView().getModel("detailPageModel").refresh();
			},
			fnDeleteComment: function (oEvent) {
				var sPath = oEvent.getSource().getBindingContext("detailPageModel").getPath();
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sId = detailPageModel.getProperty(sPath).commentId;
				var index = sPath.split("/").pop();
				detailPageModel.getData().invoiceDetailUIDto.commentDto.splice(index, 1);
				detailPageModel.refresh();
				if (sId) {
					var url = "InctureApDest/comment/delete/" + sId;
					jQuery
						.ajax({
							url: url,
							type: "DELETE",
							// headers: {
							// 	"X-CSRF-Token": this.getCSRFToken()
							// },
							dataType: "json",
							success: function (result) {}.bind(this)
						});
				}
			},
			fnDeleteAttachment: function (oEvent) {
				var sPath = oEvent.getSource().getBindingContext("detailPageModel").getPath();
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sId = detailPageModel.getProperty(sPath).attachmentId;
				var index = sPath.split("/").pop();
				detailPageModel.getData().docManagerDto.splice(index, 1);
				detailPageModel.refresh();
				if (sId) {
					var url = "InctureApDest/attachment/delete/" + sId;
					jQuery
						.ajax({
							url: url,
							type: "DELETE",
							// headers: {
							// 	"X-CSRF-Token": this.getCSRFToken()
							// },
							dataType: "json",
							success: function (result) {}.bind(this)
						});
				}

			},
			onNonPoSave: function () {
				// var token = this.getCSRFToken();
				var oSaveData = this._fnOnSaveCall();
				var postingDate = oSaveData.invoiceHeader.postingDate;
				if (postingDate) {
					oSaveData = JSON.stringify(oSaveData);
					var that = this;
					var url = "InctureApDest/odataServices/updateNonPoInvoice";
					$.ajax({
						url: url,
						method: "POST",
						async: false,
						// headers: {
						// 	"X-CSRF-Token": token
						// },
						contentType: 'application/json',
						dataType: "json",
						data: oSaveData,
						success: function (result, xhr, data) {
							var message = result.message;
							if (result.status === "Success") {
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that.oRouter.navTo("Workbench");
									}
								});
							} else {
								sap.m.MessageBox.information(message, {
									actions: [sap.m.MessageBox.Action.OK]
								});
							}
						},
						error: function (result, xhr, data) {
							sap.m.MessageToast.show("Failed");
						}
					});
				} else {
					sap.m.MessageBox.error("Please Enter Posting Date!");
				}
			},
			fnGetRejectReason: function () {

				var mRejectModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(mRejectModel, "mRejectModel");
				var url = "InctureApDest/rejReason/getAll/EN";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {

						var aRejectData = data;
						mRejectModel.setProperty("/itemsData", aRejectData);
					},
					error: function (err) {
						// that._busyDialog.close();
						sap.m.MessageToast.show(err.statusText);
					}
				});
				return mRejectModel;
			},
			fnNonPoReject: function () {

				var mRejectModel = this.getView().getModel("mRejectModel");
				//this.getView().setModel(mRejectModel, "mRejectModel");
				var that = this;
				that.rejectDialog = sap.ui.xmlfragment("rejectDialog", "com.inc.ApWorkbench.view.fragment.rejectDialog", that);
				that.rejectDialog.setModel(mRejectModel, "mRejectModel");
				that.rejectDialog.open();
				var url = "InctureApDest/rejReason/getAll/EN";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {
						var aRejectData = data;
						mRejectModel.setProperty("/items", aRejectData);

					},
					error: function (err) {
						sap.m.MessageToast.show(err.statusText);
					}
				});
			},
			onCloseReject: function () {
				this.rejectDialog.close();
			},
			onRejectCombo: function (oEvent) {

				var mRejectModel = this.getView().getModel("mRejectModel");
				var sText = oEvent.getParameter("selectedItem").getProperty("text");
				var sKey = oEvent.getParameter("selectedItem").getProperty("key");
				mRejectModel.setProperty("/Textvalue", sText);
				mRejectModel.setProperty("/Keyvalue", sKey);
			},

			onRejectConfirm: function () {

				var mRejectModel = this.getView().getModel("mRejectModel");
				var selKey = mRejectModel.getProperty("/selectedKey");
				if (selKey) {
					var detailPageModel = this.getView().getModel("detailPageModel"),
						detailPageModelData = detailPageModel.getData();
					var objectIsNew = jQuery.extend({}, detailPageModelData.invoiceDetailUIDto);
					objectIsNew.invoiceHeader.postingDate = objectIsNew.invoiceHeader.postingDate ? new Date(objectIsNew.invoiceHeader.postingDate).getTime() :
						null;
					objectIsNew.invoiceHeader.reasonForRejection = mRejectModel.getProperty("/Keyvalue");
					objectIsNew.invoiceHeader.rejectionText = mRejectModel.getProperty("/Textvalue");
					var jsonData = objectIsNew.invoiceHeader;
					var url = "InctureApDest/invoiceHeader/updateLifeCycleStatus";
					var that = this;
					$.ajax({
						url: url,
						method: "PUT",
						async: false,
						// headers: {
						// 	"X-CSRF-Token": this.getCSRFToken()
						// },
						contentType: 'application/json',
						dataType: "json",
						data: JSON.stringify(jsonData),
						success: function (result, xhr, data) {
							var message = result.message;
							if (result.status === "Success") {
								mRejectModel.setProperty("/selectedKey", "");
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that.oRouter.navTo("Workbench");
									}
								});
							} else {
								sap.m.MessageBox.information(message, {
									actions: [sap.m.MessageBox.Action.OK]
								});
							}
						},
						error: function (result, xhr, data) {
							sap.m.MessageToast.show("Failed");
						}
					});
				} else {
					sap.m.MessageBox.information("Please select Reason Code");
				}
			},

			onNonPoReject: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var token = this.getCSRFToken();
				var oRejectData = this._fnOnRejectCall();
				oRejectData = JSON.stringify(oRejectData);
				var that = this;
				var url = "InctureApDest/invoiceHeader/updateLifeCycleStatus";
				$.ajax({
					url: url,
					method: "PUT",
					async: false,
					// headers: {
					// 	"X-CSRF-Token": token
					// },
					contentType: 'application/json',
					dataType: "json",
					data: oRejectData,
					success: function (result, xhr, data) {
						var message = result.message;
						if (result.status === "Success") {
							sap.m.MessageBox.success(message, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									that.oRouter.navTo("Inbox", {
										value: "abc"
									});
								}
							});
						} else {
							sap.m.MessageBox.information(message, {
								actions: [sap.m.MessageBox.Action.OK]
							});
						}
					},
					error: function (result, xhr, data) {
						sap.m.MessageToast.show("Failed");
					}
				});
				detailPageModel.refresh();
			},
			onNonPoSubmit: function () {

				// var token = this.getCSRFToken();
				var jsonData = this._fnOnSubmitCall();

				var binvAmt = false;
				var bVid = false;
				var bInv = false;
				var bInvdate = false;
				var bPostingdate = false;
				var bCostAllocation = false;
				if (jsonData.invoiceHeader.invoiceTotal) {
					binvAmt = true;
				} else {
					binvAmt = false;
					sap.m.MessageBox.error("Please Enter Invoice Amount!");
				}
				if (binvAmt) {
					if (jsonData.invoiceHeader.vendorId) {
						bVid = true;
					} else {
						bVid = false;
						sap.m.MessageBox.error("Please Enter Vendor ID!");
					}
				}
				if (binvAmt && bVid) {
					if (jsonData.invoiceHeader.extInvNum) {
						bInv = true;
					} else {
						bInv = false;
						sap.m.MessageBox.error("Please Enter Invoice NO!");
					}
				}
				if (binvAmt && bVid && bInv) {
					if (jsonData.invoiceHeader.invoiceDate) {
						bInvdate = true;
					} else {
						bInvdate = false;
						sap.m.MessageBox.error("Please Enter Invoice Date!");
					}
				}
				if (binvAmt && bVid && bInv && bInvdate) {
					if (jsonData.invoiceHeader.postingDate) {
						bPostingdate = true;
					} else {
						bPostingdate = false;
						sap.m.MessageBox.error("Please Enter Posting Date!");
					}
				}
				if (binvAmt && bVid && bInv && bInvdate && bPostingdate) {
					if (jsonData.costAllocation.length > 0) {
						bCostAllocation = true;
					} else {
						bCostAllocation = false;
						sap.m.MessageBox.error("Please Enter Cost Allocation Details!");
					}
				}

				if (binvAmt && bVid && bInv && bInvdate && bPostingdate && bCostAllocation) {
					//COST ALLOCATION VALIDATION START 
					var postDataModel = this.getView().getModel("postDataModel");
					if (postDataModel.getData().listNonPoItem.length != 0) {
						var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
					} else if (postDataModel.getData().newCostArray.length != 0) {
						alistNonPoData = $.extend(true, [], postDataModel.getProperty("/newCostArray"));
					}
					var bflag = true;
					for (var i = 0; i < alistNonPoData.length; i++) {
						//To handle validations
						var bValidate = false;
						if (alistNonPoData[i].glAccount === "" || alistNonPoData[i].glError === "Error") {
							bValidate = true;
							alistNonPoData[i].glError = "Error";
						}
						if (alistNonPoData[i].netValue === "" || alistNonPoData[i].amountError === "Error") {
							bValidate = true;
							alistNonPoData[i].amountError = "Error";
						}
						if (alistNonPoData[i].costCenter === "" || alistNonPoData[i].costCenterError === "Error") {
							bValidate = true;
							alistNonPoData[i].costCenterError = "Error";
						}
						if (alistNonPoData[i].itemText === "" || alistNonPoData[i].itemTextError === "Error") {
							bValidate = true;
							alistNonPoData[i].itemTextError = "Error";
						}
						if (bValidate) {
							bflag = false;
							continue;
						}
					}
					if (!bflag) {
						postDataModel.setProperty("/listNonPoItem", alistNonPoData);
						var sMsg = "Please Enter Required Fields G/L Account,Amount,Cost Center & Text!";
						sap.m.MessageBox.alert(sMsg);
						return;
					} else {
						//COST ALLOCATION VALIDATION END

						var postingDate = jsonData.invoiceHeader.postingDate;
						if (postingDate) {
							jsonData = JSON.stringify(jsonData);
							var that = this;
							var url = "InctureApDest/odataServices/saveNonPoInvoice";
							$.ajax({
								url: url,
								method: "POST",
								async: false,
								// headers: {
								// 	"X-CSRF-Token": token
								// },
								contentType: "application/json",
								dataType: "json",
								data: jsonData,
								success: function (result, xhr, data) {
									var message = result.message;
									if (result.status === "Success") {
										sap.m.MessageBox.success(message, {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												that.oRouter.navTo("Workbench");
											}
										});
									} else {
										sap.m.MessageBox.information(message, {
											actions: [sap.m.MessageBox.Action.OK]
										});
									}
								},
								error: function (result, xhr, data) {
									sap.m.MessageToast.show("Failed");
								}
							});
						} else {
							sap.m.MessageBox.error("Please Enter Posting Date!");
						}
					}
				}

			},
			_fnOnSubmitCall: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel"),
					detailPageModelData = detailPageModel.getData();
				var invoiceDate = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceDate");

				var objectIsNew = jQuery.extend({}, detailPageModelData.invoiceDetailUIDto);
				var postDataModel = this.getView().getModel("postDataModel");
				objectIsNew.costAllocation = [];
				if (postDataModel.getData().newCostArray != undefined) {
					for (var i = 0; i < postDataModel.getData().newCostArray.length; i++) {
						var reqId = objectIsNew.invoiceHeader.requestId ? objectIsNew.invoiceHeader.requestId : null;
						var itemId = postDataModel.getData().newCostArray[i].itemId ? postDataModel.getData().newCostArray[i].itemId : null;
						objectIsNew.costAllocation.push({
							"requestId": reqId,
							"itemId": itemId,
							"serialNo": 0,
							"deleteInd": null,
							"quantity": "0.00",
							"distrPerc": null,
							"subNumber": null,
							"netValue": postDataModel.getData().newCostArray[i].netValue,
							"crDbIndicator": postDataModel.getData().newCostArray[i].crDbIndicator,
							"glAccount": postDataModel.getData().newCostArray[i].glAccount,
							"costCenter": postDataModel.getData().newCostArray[i].costCenter,
							"internalOrderId": postDataModel.getData().newCostArray[i].internalOrderIdId,
							"profitCenter": postDataModel.getData().newCostArray[i].profitCenter,
							"assetNo": null,
							"itemText": postDataModel.getData().newCostArray[i].itemText,
							"wbsElement": null
						});

					}
				} else {
					for (var i = 0; i < postDataModel.getData().listNonPoItem.length; i++) {
						var reqId = objectIsNew.invoiceHeader.requestId ? objectIsNew.invoiceHeader.requestId : null;
						var itemId = postDataModel.getData().listNonPoItem[i].itemId ? postDataModel.getData().listNonPoItem[i].itemId : null;
						objectIsNew.costAllocation.push({
							"requestId": reqId,
							"itemId": itemId,
							"serialNo": 0,
							"deleteInd": null,
							"quantity": "0.00",
							"distrPerc": null,
							"subNumber": null,
							"netValue": postDataModel.getData().listNonPoItem[i].netValue,
							"crDbIndicator": postDataModel.getData().listNonPoItem[i].crDbIndicator,
							"glAccount": postDataModel.getData().listNonPoItem[i].glAccount,
							"costCenter": postDataModel.getData().listNonPoItem[i].costCenter,
							"internalOrderId": postDataModel.getData().listNonPoItem[i].internalOrderIdId,
							"profitCenter": postDataModel.getData().listNonPoItem[i].profitCenter,
							"assetNo": null,
							"itemText": postDataModel.getData().listNonPoItem[i].itemText,
							"wbsElement": null
						});

					}

				}
				if (objectIsNew.invoiceHeader.createdAt) {
					objectIsNew.invoiceHeader.createdAt = objectIsNew.invoiceHeader.createdAt.split("-").join("");
				}
				if (objectIsNew.invoiceHeader.invoiceDate) {
					objectIsNew.invoiceHeader.invoiceDate = objectIsNew.invoiceHeader.invoiceDate.split("-").join("");
				}
				objectIsNew.invoiceHeader.postingDate = objectIsNew.invoiceHeader.postingDate ? new Date(objectIsNew.invoiceHeader.postingDate).getTime() :
					null;
				var obj = {};

				obj.attachments = [];
				if (detailPageModel.getData().docManagerDto && detailPageModel.getData().docManagerDto.length > 0) {
					for (var n = 0; n < detailPageModel.getData().docManagerDto.length; n++) {
						obj.attachments.push(detailPageModel.getData().docManagerDto[n]);
					}
				}
				obj.commentDto = [];
				if (detailPageModel.getData().invoiceDetailUIDto.commentDto && detailPageModel.getData().invoiceDetailUIDto.commentDto.length > 0) {
					for (var k = 0; k < detailPageModel.getData().invoiceDetailUIDto.commentDto.length; k++) {
						obj.commentDto.push(detailPageModel.getData().invoiceDetailUIDto.commentDto[k]);
					}
				}
				obj.invoiceHeader = objectIsNew.invoiceHeader;
				obj.invoiceItems = objectIsNew.invoiceItems;
				obj.costAllocation = objectIsNew.costAllocation;
				return obj;
			},
			selectedValueTemplate: function (oEvent) {
				var templateData = this.getView().getModel("templateModel");
				var bUpdatedFlag = templateData.getProperty("/bUpdatedFlag");
				if (bUpdatedFlag) {
					var sTemplateNewname = oEvent.getSource().getProperty("value");
					templateData.setProperty("/sTemplateNewname", sTemplateNewname);
					templateData.setProperty("/bUpdatedFlag", false);
				} else {
					templateData.setProperty("/bSetUpdateTemp", true);
				}
				templateData.refresh();
			},
			openTaxDetails: function () {
				if (!this.taxDetails) {
					this.taxDetails = sap.ui.xmlfragment("com.inc.ApWorkbench.view.fragments.tax", this);
					this.getView().addDependent(this.taxDetails);
				}
				var taxModel = this.getView().getModel("taxModel");
				this.taxDetails.setModel(taxModel, "taxModel");
				this.taxDetails.open();
			},
			taxDialogBtnPress: function () {
				this.taxDetails.close();
			},
			onTaxCodeSelect: function (oEvent) {
				debugger;
					var detailPageModel = this.getView().getModel("detailPageModel"),
					taxModel = this.getView().getModel("taxModel"),
					postDataModel = this.getView().getModel("postDataModel"),
					taxCode = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.taxCode;
					// taxCode = oEvent.getSource().getSelectedItem().getKey();
					for(var a = 0 ; a<postDataModel.getData().listNonPoItem.length;a++){
					postDataModel.setProperty("/listNonPoItem/"+a+"/taxCode",taxCode);
					}
					var data = postDataModel.getProperty("/listNonPoItem/taxCode");
					postDataModel.refresh();
					taxModel.refresh();
			},
			fnTaxCalculation: function () {
				var detailPageModel = this.getView().getModel("detailPageModel"),
					taxModel = this.getView().getModel("taxModel"),
					detailPageModelData = detailPageModel.getData().invoiceDetailUIDto.invoiceItems,
					taxValue = 0;
				for (var i = 0; i < detailPageModelData.length; i++) {
					if (detailPageModelData[i].isTwowayMatched) {
						var taxPValue = (parseFloat(detailPageModelData[i].taxPer) * (parseFloat(detailPageModelData[i].poNetPrice) / 100)).toFixed(3);
						taxValue = parseFloat(taxValue) + parseFloat(taxPValue);
						taxValue = taxValue.toFixed(3);
					}
				}
				var obj = {
					"debit": "Debit",
					"taxCode": "VN",
					"taxDescription": "",
					"amount": taxValue
				};
				taxModel.getData().netTaxValue = taxValue;
				taxModel.getData().taxItem = [];
				taxModel.getData().taxItem.push(obj);
				taxModel.refresh();
			}
		});
	});