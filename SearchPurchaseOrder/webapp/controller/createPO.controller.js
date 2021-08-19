sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.inc.SearchPurchaseOrder.controller.createPO", {
		onInit: function () {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			mCreatePO.setProperty("/dashVendor", null);
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			var that = this;
			that.getCompanyData();
		},
		getMaterialValue: function (oEvent) {
			var materialValue = oEvent.getParameter("value");
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var sPath = oEvent.getSource().getBindingContext("mCreatePO").getPath();
			if (materialValue === "") {
				mCreatePO.setProperty(sPath + "/Description", "");
				mCreatePO.setProperty(sPath + "/MaterialError", "Error");
				sap.m.MessageBox.information("Please enter Material!");
			} else {
				mCreatePO.setProperty(sPath + "/MaterialError", "None");
			}
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
		onAddRow: function () {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var vendorId = mCreatePO.getProperty("/VendorID");
			var purchasingOrg = mCreatePO.getProperty("/PurchasingOrg");
			var purchasingGroup = mCreatePO.getProperty("/purchasingGroup");
			var selectedCompanyCode = mCreatePO.getProperty("/selectedCompanyCode");
			var mCreatePOData = mCreatePO.getData();
			var bFlagVendor, bpurchGrp, bpurchOrg, bCompCd;
			if (vendorId) {
				bFlagVendor = true;
			} else {
				bFlagVendor = false;
				sap.m.MessageBox.error("Please Enter Vendor!");
			}
			if (bFlagVendor) {
				if (purchasingOrg) {
					bpurchOrg = true;
				} else {
					bpurchOrg = false;
					sap.m.MessageBox.error("Please Enter Purchase Organization!");
				}
			}
			if (bFlagVendor && bpurchOrg) {
				if (purchasingGroup) {
					bpurchGrp = true;
				} else {
					bpurchGrp = false;
					sap.m.MessageBox.error("Please Enter Purchasing Group!");
				}
			}
			if (bFlagVendor && bpurchOrg && bpurchGrp) {
				if (selectedCompanyCode) {
					bCompCd = true;
				} else {
					bCompCd = false;
					sap.m.MessageBox.error("Please Enter Company Code!");
				}
			}
			if (bFlagVendor && bpurchOrg && bpurchGrp && bCompCd) {
				if (!mCreatePOData.results) {
					mCreatePOData.results = [];
				}
				var Material = "";
				var Description = "";
				var Plant = "";
				var Quantity = "";
				var Unit = "";
				var UnitPrice = "";
				mCreatePOData.results.unshift({
					"Material": Material,
					"Description": Description,
					"Plant": Plant,
					"Quantity": Quantity,
					"Unit": Unit,
					"UnitPrice": UnitPrice
				});
				mCreatePO.refresh();
			}
		},
		onDeleteRow: function () {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var oTable = this.getView().byId("poItems");
			var aSelectedItems = this.getView().byId("poItems").getSelectedContextPaths();
			var sLength = aSelectedItems.length;
			if (sLength > 0) {
				for (var i = sLength - 1; i >= 0; i--) {
					var indx = aSelectedItems[i].split("/")[2];
					mCreatePO.getData().results.splice(indx, 1);
				}
			} else {
				sap.m.MessageBox.warning("Please select a row!");
			}
			oTable.removeSelections(true);
			mCreatePO.refresh();
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
		/*	onCompanycodeChange: function (oEvent) {
				var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
				var mCompanyModel = this.getView().getModel("mCompanyModel");
				var compCode = oEvent.getSource().getProperty("selectedKey");
				var aCompanyData = mCompanyModel.getData().results;
				var aSelectedItem = aCompanyData.find(function (oRow) {
					return oRow.companyCode === compCode;
				});
				var currency = aSelectedItem.currency;
				mCreatePO.setProperty("/currency", currency);
			},*/
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
			var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var vendorId = oEvt.getParameter("selectedItem").getProperty("text");
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			mCreatePO.setProperty("/SelectedVendorName", sVendorName);
			mCreatePO.setProperty("/VendorID", vendorId);
			mCreatePO.setProperty("/dashVendor", "-");
			var sPurchasingOrg = mCreatePO.getProperty("/PurchasingOrg");
			if (sPurchasingOrg && vendorId) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/CurrencySet?$filter=vendor eq '" + vendorId +
					"' and purchasingOrg eq '" + sPurchasingOrg + "'";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {

						if (data.d.results.length > 0) {
							var currency = data.d.results[0].currency;
							mCreatePO.setProperty("/currency", currency);
						}
					},
					error: function (oError) {}
				});

			}
			mCreatePO.refresh(true);
		},
		onQtyChange: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var sPath = oEvent.getSource().getBindingContext("mCreatePO").getPath();
			if (sValue === "") {
				mCreatePO.setProperty(sPath + "/QuantityError", "Error");
				sap.m.MessageBox.information("Please Enter Quantity!");
			} else {
				mCreatePO.setProperty(sPath + "/QuantityError", "None");
			}
			var qty = (parseFloat(sValue)).toFixed(3);
			mCreatePO.setProperty(sPath + "/Quantity", qty);
		},
		onUnitChange: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var sPath = oEvent.getSource().getBindingContext("mCreatePO").getPath();
			if (sValue === "") {
				mCreatePO.setProperty(sPath + "/UnitError", "Error");
				sap.m.MessageBox.information("Please Enter Unit!");
			} else {
				mCreatePO.setProperty(sPath + "/UnitError", "None");
			}
		},
		onUnitPriceChange: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var sPath = oEvent.getSource().getBindingContext("mCreatePO").getPath();
			if (sValue === "") {
				mCreatePO.setProperty(sPath + "/UnitPriceError", "Error");
				sap.m.MessageBox.information("Please Enter Unit Price!");
			} else {
				mCreatePO.setProperty(sPath + "/UnitPriceError", "None");
			}
			var unitPrice = (parseFloat(sValue)).toFixed(3);
			mCreatePO.setProperty(sPath + "/UnitPrice", unitPrice);
		},
		onChangeVendor: function (oEvt) {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var value = oEvt.getSource().getProperty("value");
			if (value === "") {
				mCreatePO.setProperty("/SelectedVendorName", "");
				mCreatePO.setProperty("/VendorID", "");
				mCreatePO.setProperty("/dashVendor", null);
			}

		},
		fnPurchasingOrg: function (oEvent) {
			var mPurchasingOrg = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mPurchasingOrg, "mPurchasingOrg");
			var value = oEvent.getParameter("suggestValue");
			if (value) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PurchasingOrgSet?$format=json";
				mPurchasingOrg.loadData(url, null, true);
				mPurchasingOrg.attachRequestCompleted(null, function () {
					mPurchasingOrg.refresh();
				});
			}
		},
		onChangePurchasingOrg: function (oEvent) {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var vendorId = mCreatePO.getProperty("/VendorID");
			var value = oEvent.getSource().getProperty("value");
			if (vendorId && value) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/CurrencySet?$filter=vendor eq '" + vendorId +
					"' and purchasingOrg eq '" + value + "'";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {
						if (data.d.results.length > 0) {
							var currency = data.d.results[0].currency;
							mCreatePO.setProperty("/currency", currency);
						}
					},
					error: function (oError) {

					}
				});

			}

		},
		fnPurchasingGroup: function (oEvent) {
			var mPurchasingGroup = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mPurchasingGroup, "mPurchasingGroup");
			var value = oEvent.getParameter("suggestValue");
			if (value) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PurchasingGroupSet?$format=json";
				mPurchasingGroup.loadData(url, null, true);
				mPurchasingGroup.attachRequestCompleted(null, function () {
					mPurchasingGroup.refresh();
				});
			}
		},
		fngetMaterial: function (oEvent) {
			var mMaterialmodel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mMaterialmodel, "mMaterialmodel");
			var value = oEvent.getParameter("suggestValue");
			if (value) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/MaterialSearchSet?$filter=Material eq '" + value +
					"'&$format=json";
				mMaterialmodel.loadData(url, null, true);
				mMaterialmodel.attachRequestCompleted(null, function () {
					mMaterialmodel.refresh();
				});
			}
		},
		fngetMaterialDescription: function (oEvent) {
			var sMatDesc = oEvent.getParameter("selectedItem").getProperty("additionalText");
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var sPath = oEvent.getSource().getBindingContext("mCreatePO").getPath();
			mCreatePO.setProperty(sPath + "/Description", sMatDesc);
			mCreatePO.refresh();
		},
		fnsuggestPlant: function (oEvent) {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var mPlantmodel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mPlantmodel, "mPlantmodel");
			var value = mCreatePO.getProperty("/PurchasingOrg");
			if (value) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PlantSet?$filter=purchasingOrg eq '0001'&$format=json";
				mPlantmodel.loadData(url, null, true);
				mPlantmodel.attachRequestCompleted(null, function () {
					mPlantmodel.refresh();
				});
			} else {
				sap.m.MessageBox.warning("Please Enter Purchase Organization at PO Header.");
			}
		},
		onChangePlant: function (oEvent) {
			var plantValue = oEvent.getParameter("value");
			var sPath = oEvent.getSource().getBindingContext("mCreatePO").getPath();
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			if (plantValue === "") {
				mCreatePO.setProperty(sPath + "/PlantError", "Error");
				sap.m.MessageBox.information("Please Enter Plant!");
			} else {
				mCreatePO.setProperty(sPath + "/PlantError", "None");
			}
			var sMaterial = mCreatePO.getProperty(sPath + "/Material");
			var sPlant = mCreatePO.getProperty(sPath + "/Plant");
			var mItemModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mItemModel, "mItemModel");
			if (sMaterial && sPlant) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/MaterialDetailsSet?$filter=Material eq '" + sMaterial +
					"' and Plant eq '" + sPlant + "'";
				jQuery
					.ajax({
						url: url,
						type: "GET",
						dataType: "json",
						async: true,
						success: function (result) {
							var aItemData = result.d.results[0];
							mCreatePO.setProperty(sPath + "/Unit", aItemData.PurchaseUom);
							mCreatePO.setProperty(sPath + "/UnitPrice", aItemData.UnitPrice);
						},
						error: function (oError) {
							var oErrorMsg = oError.responseJSON;
							var oMsg = oErrorMsg.error.message.value;
							sap.m.MessageBox.error(oMsg);
						}
					});
			} else {
				sap.m.MessageBox.warning("Please Enter Material at Plant.");
			}

		},
		getCSRFToken: function () {
			var url =
				"DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV/HeaderSet?$format=json";
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
		onSubmitPO: function () {
			var mCreatePO = this.getOwnerComponent().getModel("mCreatePO");
			var vendorId = mCreatePO.getProperty("/VendorID");
			var purchasingOrg = mCreatePO.getProperty("/PurchasingOrg");
			var purchasingGroup = mCreatePO.getProperty("/purchasingGroup");
			var selectedCompanyCode = mCreatePO.getProperty("/selectedCompanyCode");
			var currency = mCreatePO.getProperty("/currency");
			var mCreatePOData = mCreatePO.getData();
			var bFlagVendor, bpurchGrp, bpurchOrg, bCompCd;
			if (vendorId) {
				bFlagVendor = true;
			} else {
				bFlagVendor = false;
				sap.m.MessageBox.error("Please Enter Vendor!");
			}
			if (bFlagVendor) {
				if (purchasingOrg) {
					bpurchOrg = true;
				} else {
					bpurchOrg = false;
					sap.m.MessageBox.error("Please Enter Purchase Organization!");
				}
			}
			if (bFlagVendor && bpurchOrg) {
				if (purchasingGroup) {
					bpurchGrp = true;
				} else {
					bpurchGrp = false;
					sap.m.MessageBox.error("Please Enter Purchasing Group!");
				}
			}
			if (bFlagVendor && bpurchOrg && bpurchGrp) {
				if (selectedCompanyCode) {
					bCompCd = true;
				} else {
					bCompCd = false;
					sap.m.MessageBox.error("Please Enter Company Code!");
				}
			}
			if (bFlagVendor && bpurchOrg && bpurchGrp && bCompCd) {
				var object = {
					"vendor": vendorId,
					"purchasingOrg": purchasingOrg,
					"purchasingGroup": purchasingGroup,
					"companyCode": selectedCompanyCode,
					"currency": currency,
					"HTI": {
						"results": []
					}
				};
				var apoItem = mCreatePOData.results;
				var poItemList = {};
				if (apoItem) {
					for (var i = 0; i < apoItem.length; i++) {
						poItemList = {
							"material": apoItem[i].Material,
							"plant": apoItem[i].Plant,
							"quantity": apoItem[i].Quantity,
							"purchaseUnit": apoItem[i].Unit,
							"unitPrice": apoItem[i].UnitPrice
						};
						object.HTI.results.push(poItemList);
					}
				}
				var poItemLength = object.HTI.results.length;
				if (poItemLength > 0) {
					var bflag = true;
					for (var j = 0; j < apoItem.length; j++) {
						var bValidate = false;
						if (apoItem[j].Material === "" || apoItem[j].MaterialError === "Error") {
							bValidate = true;
							apoItem[j].MaterialError = "Error";
						}
						if (apoItem[j].Plant === "" || apoItem[j].PlantError === "Error") {
							bValidate = true;
							apoItem[j].PlantError = "Error";
						}
						if (apoItem[j].Quantity === "" || apoItem[j].QuantityError === "Error") {
							bValidate = true;
							apoItem[j].QuantityError = "Error";
						}
						if (apoItem[j].Unit === "" || apoItem[j].UnitError === "Error") {
							bValidate = true;
							apoItem[j].UnitError = "Error";
						}
						if (apoItem[j].UnitPrice === "" || apoItem[j].UnitPriceError === "Error") {
							bValidate = true;
							apoItem[j].UnitPriceError = "Error";
						}
						if (bValidate) {
							bflag = false;
							continue;
						}
					}
					if (!bflag) {
						var sMsg = "Please Enter Required Fields Material,Plant,Quantity,Unit & Unit Price!";
						sap.m.MessageBox.alert(sMsg);
						return;
					} else {
						var payload = {
							"d": object
						};
						var url = "DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV/HeaderSet";
						var that = this;
						that.openBusyDialog();
						jQuery.ajax({
							type: "POST",
							contentType: "application/json",
							url: url,
							dataType: "json",
							data: JSON.stringify(payload),
							async: true,
							beforeSend: function (xhr) {
								var token = that.getCSRFToken();
								xhr.setRequestHeader("X-CSRF-Token", token);
								xhr.setRequestHeader("Accept", "application/json");
							},
							success: function (data, textStatus, jqXHR) {
								that.closeBusyDialog();
								var aEmpty = [];
								mCreatePO.setData(aEmpty);
								var purchaseOrder = data.d.purchaseOrder;
								var message = purchaseOrder + " has been created successfully.";
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that.oRouter.navTo("purchaseOrder");
									}
								});
							},
							error: function (oError) {
								that.closeBusyDialog();
								var errorMessage;
								if (oError.statusText === "Internal Server Error") {
									errorMessage = oError.statusText;
								} else {
									var aErrorMsg = oError.responseJSON.error.innererror.errordetails;
									var aMsg = [];
									for (var k = 0; k < aErrorMsg.length; k++) {
										aMsg.push(aErrorMsg[k].message);
									}
									errorMessage = aMsg.toString();
								}
								sap.m.MessageBox.error(errorMessage, {
									actions: [sap.m.MessageBox.Action.OK]
								});
							}
						});
					}
				} else {
					sap.m.MessageBox.error("Please Enter PO Item!");
				}
			}
		}
	});
});