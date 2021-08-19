sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, History, Filter, FilterOperator, Export, ExportTypeCSV) {
	"use strict";

	return Controller.extend("com.inc.ApWorkbench.controller.ManageTemplate", {

		onInit: function () {
			var templateModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(templateModel, "templateModel");
			var postDataModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(postDataModel, "postDataModel");
			var oUserModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oUserModel, "oUserModel");
			this.getView().getModel("postDataModel").setProperty("/update", false);
			postDataModel.setProperty("/saveTempBtn", false);
			this.onGetallTemp();
			this._getUser();

		},
		/*  ***** Data Loaders **********/

		_getUser: function () {
			var url = "SPUserDetails/v1/sayHello";
			var that = this;
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						that.getView().getModel("oUserModel").setProperty("/userID", result["logon name"]);
						that.getView().getModel("oUserModel").setProperty("/email", result.email);
						that.selectedTab = "nonPO";
						// that._getPersonalizationDetails(that.selectedTab);
					}
				});
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
		closeFileExplDialog: function () {
			this.myDialogFragment.close();
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
							accNumber: oRowDataArray[9].replace(/\r/g, ""),
							glAccount: oRowDataArray[0],
							materialDescription: oRowDataArray[1],
							// crDbIndicator: oRowDataArray[2],
							// netValue: parseFloat(oRowDataArray[3]),
							costCenter: oRowDataArray[4],
							allPer: "",
							// internalOrderId: oRowDataArray[5],
							// profitCentre: oRowDataArray[6],
							itemText: oRowDataArray[7],
							// companyCode: oRowDataArray[8].replace(/['"]+/g, "")
						};
						oBulkUploadModelData.push(oTblRowData);
					}

					postDataModel.setProperty("/listNonPoItem", oBulkUploadModelData);

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
			if (!this._oDialog1) {
				this._oDialog1 = sap.ui.xmlfragment("saveTemplate", "com.inc.ApWorkbench.view.fragment.createTemplate", this);
			}
			// this._oDialogImport.setModel(postDataModel);
			this.getView().addDependent(this._oDialog1);
			this._oDialog1.open();
			postDataModel.setProperty("/saveTempBtn", true);

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
		onChangeAllPer: function (oEvent) {
			var sAllPer = oEvent.getParameter("value");
			var postDataModel = this.getView().getModel("postDataModel");
			var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
			if (sAllPer === "") {
				postDataModel.setProperty(sPath + "/allPerError", "Error");
				sap.m.MessageBox.information("Please Enter Percentage!");
			} else {
				postDataModel.setProperty(sPath + "/allPerError", "None");
			}
		},
		onChangeAccNum: function (oEvent) {
			var sAllPer = oEvent.getParameter("value");
			var postDataModel = this.getView().getModel("postDataModel");
			var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
			if (sAllPer === "") {
				postDataModel.setProperty(sPath + "/accNumberError", "Error");
				sap.m.MessageBox.information("Please Enter Account Number!");
			} else {
				postDataModel.setProperty(sPath + "/accNumberError", "None");
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

		/* Press Functions */

		handleTemplateSearch: function (oEvt) {
			var sValue = oEvt.getSource().getValue();
			var oFilter = new Filter("templateName", FilterOperator.Contains, sValue);
			var oBinding = this.byId("viewTemplate").getBinding("items");
			oBinding.filter([oFilter]);
		},
		addItem: function (oEvt) {
			var postDataModel = this.getView().getModel("postDataModel");
			var postDataModelData = postDataModel.getData();
			if (!postDataModelData.listNonPoItem) {
				postDataModelData.listNonPoItem = [];
			}
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
				"allPer": "",
				"accNumber": "",
				"itemText": itemText,
				"companyCode": companyCode,
				"assetNo": null,
				"subNumber": null,
				"wbsElement": null,
				"isNonPo": true
			});
			postDataModel.setProperty("/saveTempBtn", true);
			postDataModel.refresh();
		},
		onCreateTemp: function () {
			var postDataModel = this.getView().getModel("postDataModel");
			var postDataModelData = postDataModel.getData();
			if (postDataModelData.listNonPoItem) {
				postDataModelData.listNonPoItem = [];
				postDataModel.setProperty("/saveTempBtn", false);
				postDataModel.refresh();

			}
			if (!this._oDialog1) {
				this._oDialog1 = sap.ui.xmlfragment("saveTemplate", "com.inc.ApWorkbench.view.fragment.createTemplate", this);
			}
			this.getView().addDependent(this._oDialog1);
			this._oDialog1.open();

		},
		onCancelTemplate: function () {
			var postDataModel = this.getView().getModel("postDataModel");
			var postDataModelData = postDataModel.getData();
			if (postDataModelData.listNonPoItem) {
				postDataModelData.listNonPoItem = [];
			}
			postDataModel.refresh();
			this._oDialog1.close();
			// this._oDialog2.close();
		},
		onCancelViewTemplate: function () {
			var postDataModel = this.getView().getModel("postDataModel");
			var postDataModelData = postDataModel.getData();
			if (postDataModelData.listNonPoItem) {
				postDataModelData.listNonPoItem = [];
			}
			postDataModel.refresh();
			this._oDialog2.close();
		},
		onTemplate: function (oEvent) {
			var that = this;
			var postDataModel = this.getView().getModel("postDataModel");
			var templateModel = this.getView().getModel("templateModel");
			var tempId = oEvent.getSource().getText();
			var path = oEvent.getSource().getBindingContext("templateModel").sPath;
			var tempName = templateModel.getProperty(path + "/templateName");
			var sUrl = "InctureApDest/NonPoTemplate/getItemsByTemplateId/" + tempId;
			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: sUrl,
				dataType: "json",
				async: true,
				success: function (data, textStatus, jqXHR) {
					postDataModel.setProperty("/listNonPoItem", data);
					postDataModel.setProperty("/viewTemplateName", tempName);
					if (!that._oDialog2) {
						that._oDialog2 = sap.ui.xmlfragment("viewTemplate", "com.inc.ApWorkbench.view.fragment.viewTemplate", that);
					}
					that.getView().addDependent(that._oDialog2);
					that._oDialog2.open();
				},
				error: function (err) {
					// that._busyDialog.close();
					sap.m.MessageToast.show(err.statusText);
				}
			});
		},

		onUpdateTemp: function (oEvent) {
			var that = this;
			var postDataModel = this.getView().getModel("postDataModel");
			var templateModel = this.getView().getModel("templateModel");
			this.path = oEvent.getSource().getBindingContext("templateModel").sPath;
			var tempId = templateModel.getProperty(this.path + "/templateId");
			var name = templateModel.getProperty(this.path + "/templateName");
			templateModel.setProperty("/updateViewtemplateName", name);
			var sUrl = "InctureApDest/NonPoTemplate/getItemsByTemplateId/" + tempId;
			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: sUrl,
				dataType: "json",
				async: true,
				success: function (data, textStatus, jqXHR) {
					postDataModel.setProperty("/listNonPoItem", data);
					if (!that._oDialog3) {
						that._oDialog3 = sap.ui.xmlfragment("updateTemplate", "com.inc.ApWorkbench.view.fragment.updateTemplate", that);
					}
					that.getView().addDependent(that._oDialog3);
					that._oDialog3.open();
				},
				error: function (err) {
					// that._busyDialog.close();
					sap.m.MessageToast.show(err.statusText);
				}
			});

		},
		onCancelUpdateTemplate: function () {
			this._oDialog3.close();
		},
		onUpdateTemplate: function () {
			var sum = 0;
			var oGlobTempModel = this.getView().getModel("templateModel");
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
				if (alistNonPoData[i].accNumber === "" || alistNonPoData[i].accNumberError === "Error") {
					bValidate = true;
					alistNonPoData[i].accNumberError = "Error";
				}
				if (alistNonPoData[i].allPer === "" || alistNonPoData[i].allPerError === "Error") {
					bValidate = true;
					alistNonPoData[i].allPerError = "Error";
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
					//break;
					continue;
				}
				var val = alistNonPoData[i].allPer;
				var value = parseInt(val);
				sum = sum + value;
			}
			if (!bflag) {
				postDataModel.setProperty("/listNonPoItem", alistNonPoData);
				var sMsg = "Please Enter Required Fields G/L Account,Amount,Cost Center & Text!";
				sap.m.MessageBox.alert(sMsg);
				return;
			}
			if (sum != 100) {
				sap.m.MessageBox.error("Sum of percentage allocation should be 100");
				return;
			} else {
				// var oGlobTempModel = this.getView().getModel("templateModel");
				var detailPageModel = this.getView().getModel("detailPageModel");
				var postUpdateModel = new sap.ui.model.json.JSONModel();

				var oTemplateModel = this.getView().getModel("templateModel");
				var templateId = oTemplateModel.getProperty(this.path + "/templateId");
				var templateName = oTemplateModel.getProperty(this.path + "/templateName");
				var uuid = oTemplateModel.getProperty(this.path + "/uuid");
				var createdBy = oTemplateModel.getProperty(this.path + "/createdBy");
				if (templateId) {
					var oDate = new Date();
					this.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					});
					var dDate = this.dateFormat.format(oDate);
					if (templateId !== "null") {
						var objUpdate = {
							"nonPoTemplate": {
								"uuid": uuid,
								"templateId": templateId,
								"accClerkId": null,
								"basecoderId": null,
								"vendorId": "",
								"templateName": templateName,
								"createdBy": createdBy,
								"createdAt": "",
								"updatedBy": this.getView().getModel("oUserModel").getProperty("/email"),
								"updatedAt": dDate
							}
						};
						postUpdateModel.setData(objUpdate);
						postUpdateModel.getData().nonPoTemplateItems = [];
						var iListNonPoLen = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
						var len = iListNonPoLen.length;
						if (!len) {
							oTemplateModel.setProperty("/sPreviousVal", undefined);
							return;
						}
						oTemplateModel.setProperty("/sPreviousVal", undefined);
						for (var z = 0; z < len; z++) {
							postUpdateModel.getData().nonPoTemplateItems.push(postDataModel.getData().listNonPoItem[z]);
							postUpdateModel.getData().nonPoTemplateItems[z].templateId = templateId;
						}
						var url = "InctureApDest/NonPoTemplate/update";
						var dataObj = postUpdateModel.getData();
						var that = this;
						jQuery
							.ajax({
								url: url,
								dataType: "json",
								data: JSON.stringify(dataObj),
								contentType: "application/json",
								type: "PUT",
								// beforeSend: function (xhr) {
								// 	var token = that.getCSRFToken();
								// 	xhr.setRequestHeader("X-CSRF-Token", token);
								// 	xhr.setRequestHeader("Accept", "application/json");
								// },
								success: function (Success) {
									oGlobTempModel.setProperty("/sUpdateTemplate", templateId);
									// that.saveTemplate.close();
									sap.m.MessageToast.show(Success.message);
									that.onGetallTemp();
									that._oDialog3.close();
								},
								error: function (e) {}
							});
					}
				}

			}
			this.onGetallTemp();
		},
		onSaveTemplate: function (oEvt) {
			if (sap.ui.getCore().byId("saveTemplate--saveInput").getValue() !== "") {
				var oGlobTempModel = this.getView().getModel("templateModel");
				var postDataModel = this.getView().getModel("postDataModel");
				var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
				// var alistNonPoData = postDataModel.getProperty("/listNonPoItem");
				var bflag = true;
				var sum = 0;
				postDataModel.refresh();
				for (var i = 0; i < alistNonPoData.length; i++) {
					//To handle validations
					postDataModel.setProperty("/listNonPoItem/" + i + "/netValue", "");
					var bValidate = false;
					if (alistNonPoData[i].glAccount === "" || alistNonPoData[i].glError === "Error") {
						bValidate = true;
						alistNonPoData[i].glError = "Error";
					}
					if (alistNonPoData[i].accNumber === "" || alistNonPoData[i].accNumberError === "Error") {
						bValidate = true;
						alistNonPoData[i].accNumberError = "Error";
					}
					if (alistNonPoData[i].allPer === "" || alistNonPoData[i].allPerError === "Error") {
						bValidate = true;
						alistNonPoData[i].allPerError = "Error";
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
						//break;
						continue;
					}
					var val = alistNonPoData[i].allPer;
					var value = parseInt(val);
					sum = sum + value;
				}
				if (!bflag) {
					postDataModel.setProperty("/listNonPoItem", alistNonPoData);
					var sMsg = "Please Enter Required Fields G/L Account, Account Number , Percentage Allocation, Cost Center & Text!";
					sap.m.MessageBox.alert(sMsg);
					postDataModel.refresh();
					return;
				}
				if (sum != 100) {
					sap.m.MessageBox.error("Sum of percentage allocation should be 100");
					return;
				} else {
					this.onSaveTemp();
				}
				this.onGetallTemp();
			} else {
				sap.m.MessageBox.error("Please Enter Template Name!");
			}

		},
		onSaveTemp: function (oEvent) {

			var oGlobTempModel = this.getView().getModel("templateModel");
			var detailPageModel = this.getView().getModel("detailPageModel");
			// var sVendorId = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.vendorId;
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
						"vendorId": "",
						"templateName": tempName,
						"createdBy": this.getView().getModel("oUserModel").getProperty("/email"),
						"createdAt": dDate,
						"updatedBy": "",
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
						// beforeSend: function (xhr) {
						// 	var token = that.getCSRFToken();
						// 	xhr.setRequestHeader("X-CSRF-Token", token);
						// 	xhr.setRequestHeader("Accept", "application/json");
						// },
						success: function (Success) {
							// templateModel.setProperty("/sUpdateTemplate", tempName);
							that.onGetallTemp();
							// that.saveTemplate.close();
							sap.m.MessageBox.success(Success.message);
							that._oDialog1.close();
							// var postDataModel = this.getView().getModel("postDataModel");
						},
						error: function (e) {
							//  console.log(e);
						}
					});
			} else {
				sap.m.MessageBox.error("Please Enter Template Name!");
			}
			sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
			var postDataModelData = postDataModel.getData();
			postDataModelData.listNonPoItem = [];
			dataModel.getData().nonPoTemplateItems = [];

		},
		deleteNonPoData: function (oEvent) {
			var detailPageModel = this.getView().getModel("postDataModel");
			var index = oEvent.getSource().getParent().getBindingContextPath().split("/")[2];
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var sValue = detailPageModel.getProperty(sPath + "/netValue");
			detailPageModel.getData().listNonPoItem.splice(index, 1);
			detailPageModel.refresh();
			// var n = detailPageModel.getData().listNonPoItem.length;
			// if (n === 0) {
			// 	this.getView().byId("btnSavetemplate").setEnabled(false);
			// }
			// if (sValue) {
			// 	this.amountCal(oEvent);
			// }
		},
		onDeleteTemp: function (oEvent) {
			var that = this;
			var templateModel = this.getView().getModel("templateModel");
			var aNonPoTemplate = templateModel.getProperty("/aNonPoTemplate");
			// var len = this.selectTemplate._oTable._aSelectedPaths.length;
			// if (len > 0) {
			var arr = [];
			// for (var i = 0; i < len; i++) {
			var sIndx = oEvent.getSource().getBindingContext("templateModel").sPath.split("/")[2];
			var aIndexValue = Number(sIndx);
			arr.push(aIndexValue);
			// }
			var arrLength = arr.length;
			for (var j = 0; j < arrLength; j++) {
				var tempid = aNonPoTemplate[arr[j]].templateId;
				var url = "InctureApDest/NonPoTemplate/delete/" + tempid;
				that.onDeleteofNonpoTemplate(aNonPoTemplate, url, tempid);
				templateModel.refresh();
			}

			// else {
			// 	MessageBox.error("Please Select Template Name!");
			// }
		},
		onDeleteofNonpoTemplate: function (aNonPoTemplate, sUrl, tempid) {
			var that = this;
			var templateModel = this.getView().getModel("templateModel");
			jQuery
				.ajax({
					url: sUrl,
					contentType: "application/json",
					type: "DELETE",
					// beforeSend: function (xhr) {
					// 	var token = that.getCSRFToken();
					// 	xhr.setRequestHeader("X-CSRF-Token", token);
					// 	xhr.setRequestHeader("Accept", "application/json");
					// },
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
		glDescription: function (oEvt) {
			var glAccountDes = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var postDataModel = this.getView().getModel("postDataModel");
			var sPath = oEvt.getSource().getBindingContext("postDataModel").sPath;
			postDataModel.setProperty(sPath + "/materialDescription", glAccountDes);
			postDataModel.refresh();
		},
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			}
		}

	});

});