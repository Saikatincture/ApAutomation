sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ValueState",
	"com/inc/ConfigCockpit/util/Formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function (Controller, JSONModel, ValueState, Formatter, MessageBox, MessageToast, History) {
	"use strict";

	return Controller.extend("com.inc.ConfigCockpit.controller.Cockpit", {
		onInit: function () {
			$("#splash-screen").remove();

			// var MasterData = {
			// 	selectedCompany: "",
			// 	selectedTaxCode: "",
			// 	rejectionMailSubject: "",
			// 	rejectionMailBody: "",
			// 	exceptionMailSubject: "",
			// 	exceptionMailBody: "",
			// 	maxPeople: ""
			// };
			

			
			var baseData = {
				"submitBtn": false,
				"editBtn": true,
				"Editable": false,
				"cancelBtn": false
			};
			
			var baseModel = new sap.ui.model.json.JSONModel(baseData);
			this.getView().setModel(baseModel, "baseModel");
			
			var ocrsourceData = {
				"SAPOCR": 0,
				"AbbyFlexiCapture": 1,
				"AbbyVantage": 2
			};
			baseModel.getData().ocrSourceRadio = ocrsourceData;
			// baseModel.getData().emailReaderSwitch = false;
			// baseModel.getData().grnSchedulerSwitch = false;
			// baseModel.refresh();

			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			this.handleLoadCompany();
			this.getConfigurationData();
			// var oTaxCodeModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV");
			// this.getView().setModel(oTaxCodeModel, "oTaxCodeModel");
			// var oNewObject = [{
			// 	"id": "",
			// 	"CompanyCode": "",
			// 	"autoPosting": false,
			// 	"partialPosting": false,
			// 	"autoRejection": false
			// }];
			// MasterModel.getData().postingTable = oNewObject;
			// var emailSchedularData = {
			// 	"startDate": "",
			// 	"endDate": "",
			// 	"frequencyNumber": "",
			// 	"frequencyUnit": ""
			// };
			// var grnSchedularData = {
			// 	"startDate": "",
			// 	"endDate": "",
			// 	"frequencyNumber": "",
			// 	"frequencyUnit": ""
			// };
			// MasterModel.getData().emailSchedular = emailSchedularData;
			// MasterModel.getData().grnSchedular = grnSchedularData;
			
			// MasterModel.getData().APScanTeamList = [""];
			// MasterModel.refresh();

		},

		getConfigurationData: function () {
			var that = this;
			var baseModel = this.getView().getModel("baseModel");
			$.ajax({
				type: "GET",
				url: "InctureApDest/configurationCockpit/get",
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {

				},
				success: function (data, textStatus, jqXHR) {
					var MasterModel = new JSONModel(data);
					that.getView().setModel(MasterModel, "MasterModel");
					that.taxDropDown();
					// MasterModel.getData().APMailIDList = [""];
					// MasterModel.getData().APMailIDList = [""];
					var ocr = MasterModel.getData().configurationDto.ocrSource;
					var iRadio = baseModel.getData().ocrSourceRadio;
					that.byId("ocrRadioGroup").setSelectedIndex(iRadio[ocr]);
					for(var i = 0; i < 2; i ++) {
						if(MasterModel.getData().schedulerConfigurationdto[i].actionType === "Email Scheduler Configuration") {
							baseModel.getData().emailReaderSwitch = MasterModel.getData().schedulerConfigurationdto[i].isActive;
							MasterModel.getData().emailSchedular = MasterModel.getData().schedulerConfigurationdto[i];
						}
						else if(MasterModel.getData().schedulerConfigurationdto[i].actionType === "GRN Scheduler Configuration") {
							baseModel.getData().grnSchedulerSwitch = MasterModel.getData().schedulerConfigurationdto[i].isActive;
							MasterModel.getData().grnSchedular = MasterModel.getData().schedulerConfigurationdto[i];
						}
					}
					
					for(var j=0; j<2; j++) {
						if(MasterModel.getData().emailTeamDto[j].actionType === "Accounts Payablle Mailbox Id") {
							MasterModel.getData().APMailIDList = MasterModel.getData().emailTeamDto[j].emailId;
						} else if (MasterModel.getData().emailTeamDto[j].actionType === "Accounts Payable Scanning Team") {
							MasterModel.getData().APScanTeamList= MasterModel.getData().emailTeamDto[j].emailId;
						}
					}
					for(var k=0; k<2; k++) {
						if(MasterModel.getData().mailTemplateDto[k].actionType === "Exception Mail Template") {
							MasterModel.getData().exceptionMail = MasterModel.getData().mailTemplateDto[k];
						} else if (MasterModel.getData().mailTemplateDto[k].actionType === "Rejection Mail Template") {
							MasterModel.getData().rejectionMail = MasterModel.getData().mailTemplateDto[k];
						}
					}
					baseModel.refresh();
					MasterModel.refresh();
				}
			});
		},
		
		taxDropDown: function() {
			var that = this;
			var MasterModel = this.getView().getModel("MasterModel");
			var compCode = MasterModel.getData().configurationDto.companyCode;
			var taxUrl = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/TaxCodeSet?$filter=companyCode eq '" + compCode + "'";
			$.ajax({
				type: "GET",
				url: taxUrl,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {

				},
				success: function (data, textStatus, jqXHR) {
					var mTaxModel = new JSONModel({
						"results": data.d.results
					});

					that.getView().setModel(mTaxModel, "mTaxModel");
				}

			});
		},

		onAddAPMailBox: function () {
			var MasterModel = this.getView().getModel("MasterModel");
			var APMailIDData = MasterModel.getData().APMailIDList;
			var nIndex = APMailIDData.length;
			APMailIDData.splice(nIndex, 0, "");
			MasterModel.refresh();
		},

		onAddAPScanTeam: function () {
			var MasterModel = this.getView().getModel("MasterModel");
			var APScanTeamData = MasterModel.getData().APScanTeamList;
			var nIndex = APScanTeamData.length;
			APScanTeamData.splice(nIndex, 0, "");
			MasterModel.refresh();
		},

		onAddPosting: function () {
			var MasterModel = this.getView().getModel("MasterModel");
			var aPostingData = MasterModel.getData().vendorDetailsDto;
			var oNewObject = {
				"id": "",
				"CompanyCode": "",
				"autoPosting": false,
				"partialPosting": false,
				"autoRejection": false
			};
			var oIndex = aPostingData.length;
			aPostingData.splice(oIndex, 0, oNewObject);
			MasterModel.refresh();

		},

		handleLoadCompany: function () {
			var that = this;
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			oPODetailModel.read("/CompanyCodeSet", {
				success: function (oData) {
					var mCompanyModel = new JSONModel({
						"results": oData.results
					});

					// var aCompany = mCompanyModel.getProperty("/results");
					// aCompany.push({
					// 	companyCode: "all",
					// 	companyName: "All"
					// });
					// mCompanyModel.setSizeLimit(aCompany.length + 1);

					that.getView().setModel(mCompanyModel, "mCompanyModel");

				},
				error: function (oError) {}
			});
		},

		onCompanySelect: function (oEvent) {
			var that = this;
			var sKey = oEvent.getSource().getSelectedKey();
			var oMasterModel = this.getView().getModel("MasterModel");

			oMasterModel.getData().configurationDto.companyCode = sKey;
			var taxUrl = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/TaxCodeSet?$filter=companyCode eq '" + sKey + "'";
			$.ajax({
				type: "GET",
				url: taxUrl,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {

				},
				success: function (data, textStatus, jqXHR) {
					var mTaxModel = new JSONModel({
						"results": data.d.results
					});

					that.getView().setModel(mTaxModel, "mTaxModel");

					oMasterModel.getData().configurationDto.defaultTaxCode = data.d.results[0].taxCode;
					oMasterModel.refresh();
				}

			});
		},

		validateEmail: function (oEvent) {
			var mail = oEvent.getSource().getValue();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!mailregex.test(mail)) {
				alert(mail + " is not a valid email address.");
				oEvent.getSource().setProperty("valueState", ValueState.Error);
			} else {
				oEvent.getSource().setProperty("valueState", ValueState.None);
			}
		},

		ValidateFrequency: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				// sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();
			var nFrequency = parseInt(sValue, 10);
			if (nFrequency > 0) {
				oValidatedComboBox.addStyleClass("borderlessBox");
				oValidatedComboBox.setValueState(ValueState.None);
			} else {
				oValidatedComboBox.removeStyleClass("borderlessBox");
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid frequency count!");
			}
		},

		searchVendorId: function (oEvent) {
			oEvent.getSource().setValueState("None");
			this.vendorFlag = false;
			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "suggestionModel");
			var value = oEvent.getParameter("suggestValue").trim();
			if (value && value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},

		onVendorSelected: function () {
			this.vendorFlag = true;
		},

		chkSelectedVendor: function (oEvent) {
			if (this.vendorFlag) {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValue("").setValueState("Error");
			}
		},

		radioSelectionHandler1: function (oEvent) {
			var MasterModel = this.getView().getModel("MasterModel");
			var nIndex = oEvent.getParameter("selectedIndex");
			if (nIndex === 0) {
				MasterModel.getData().configurationDto.ocrSource = "SAPOCR";
			} else if (nIndex === 1) {
				MasterModel.getData().configurationDto.ocrSource = "AbbyFlexiCapture";
			} else if (nIndex === 2) {
				MasterModel.getData().configurationDto.ocrSource = "AbbyVantage";
			}
			MasterModel.refresh();
		},

		onSubmit: function () {
			var that = this;
			var MasterModel = this.getView().getModel("MasterModel");
			var baseModel = this.getView().getModel("baseModel");
			var emailReader = MasterModel.getData().emailSchedular;
			var grnSchedular = MasterModel.getData().grnSchedular;
			// var postingData = MasterModel.getData().postingTable;
			var payload = {
				"configurationDto": {
					"ocrSource": MasterModel.getData().configurationDto.ocrSource,
					"defaultTaxCode": MasterModel.getData().configurationDto.defaultTaxCode,
					"companyCode": MasterModel.getData().configurationDto.companyCode,
					"maximumNoofUsers": MasterModel.getData().configurationDto.maximumNoofUsers
				},

				"schedulerConfigurationdto": [{
					"startDate": grnSchedular.startDate,
					"endDate": grnSchedular.endDate,
					"frequencyNumber": grnSchedular.frequencyNumber,
					"frequencyUnit": grnSchedular.frequencyUnit,
					"isActive": baseModel.getData().grnSchedulerSwitch,
					"actionType": "GRN Scheduler Configuration"
				}, {
					"startDate": emailReader.startDate,
					"endDate": emailReader.endDate,
					"frequencyNumber": emailReader.frequencyNumber,
					"frequencyUnit": emailReader.frequencyUnit,
					"isActive": baseModel.getData().emailReaderSwitch,
					"actionType": "Email Scheduler Configuration"
				}],

				"emailTeamDto": [{
					"emailId": MasterModel.getData().APMailIDList,
					"actionType": "Accounts Payablle Mailbox Id",
					"isActive": "true"
				}, {
					"emailId": MasterModel.getData().APScanTeamList,
					"actionType": "Accounts Payable Scanning Team",
					"isActive": "true"
				}],

				"vendorDetailsDto": MasterModel.getData().vendorDetailsDto,
				"mailTemplateDto": [{
						"subject": MasterModel.getData().exceptionMail.subject,
						"actionType": "Exception Mail Template",
						"body": MasterModel.getData().exceptionMail.body

					},

					{
						"subject": MasterModel.getData().rejectionMail.subject,
						"actionType": "Rejection Mail Template",
						"body": MasterModel.getData().rejectionMail.body

					}

				]

			};

			$.ajax({
				type: "POST",
				url: "InctureApDest/configurationCockpit/saveOrUpdate",
				dataType: "json",
				data: JSON.stringify(payload),
				contentType: "application/json",
				async: true,
				// beforeSend: function (xhr) {
				// 	var token = that.getCSRFToken("VendorReturns/returnsHeader/getReturnExceptions");
				// 	xhr.setRequestHeader("X-CSRF-Token", token);
				// 	xhr.setRequestHeader("Accept", "application/json");
				// },
				error: function (err) {
					// sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data, textStatus, jqXHR) {
					MessageBox.success("Configuration submitted successfully");
					that.onNavBack();
				}

			});
		},

		onEdit: function () {
			var baseModel = this.getView().getModel("baseModel");
			baseModel.getData().submitBtn = true;
			baseModel.getData().cancelBtn = true;
			baseModel.getData().editBtn = false;
			baseModel.getData().Editable = true;
			baseModel.refresh();

		},
		
		onNavBack: function () {
			var baseModel = this.getView().getModel("baseModel");
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				baseModel.getData().submitBtn = false;
				baseModel.getData().cancelBtn = false;
				baseModel.getData().editBtn = true;
				baseModel.getData().Editable = false;
				baseModel.refresh();
			}
		},

		validateStartDate: function (oEvent) {
			var odatePicker = oEvent.getSource();
			var start = oEvent.getParameters().value;
			var MasterModel = this.getView().getModel("MasterModel");
			var end = MasterModel.getData().emailSchedular.endDate;
			if (start > end && end !== "") {
				odatePicker.removeStyleClass("borderlessBox");
				odatePicker.setProperty("valueState", ValueState.Error);
				odatePicker.setValueStateText("Start Date should be lesser than End Date");

			} else {
				odatePicker.addStyleClass("borderlessBox");
				odatePicker.setProperty("valueState", ValueState.None);
			}
		},

		validateEndDate: function (oEvent) {
			var odatePicker = oEvent.getSource();
			var end = oEvent.getParameters().value;
			var MasterModel = this.getView().getModel("MasterModel");
			var start = MasterModel.getData().emailSchedular.startDate;
			if (end < start && start !== "") {
				odatePicker.removeStyleClass("borderlessBox");
				odatePicker.setProperty("valueState", ValueState.Error);
				odatePicker.setValueStateText("End Date should be greater than Start Date");
			} else {
				odatePicker.addStyleClass("borderlessBox");
				odatePicker.setProperty("valueState", ValueState.None);
			}
		},

		onDeleteAPMailBox: function (oEvent) {
			var oTable = this.byId("apMailboxTable");
			var aList = oTable.getSelectedContexts();
			if (aList.length === 0) {
				MessageToast.show("Select any Mail ID first!");
			}
			var MasterModel = this.getView().getModel("MasterModel");
			var aAPMailIDArray = MasterModel.getData().APMailIDList;
			
			for(var i = aList.length -1; i>=0; i--) {
				var oThisObject = aList[i].getObject();
				
				var index = $.map(aAPMailIDArray, function(obj, index){
					if(obj === oThisObject) {
						return index;
					}
				});
				aAPMailIDArray.splice(index,1);
			}
			

			// var aIndices = [];
			// for (var i = 0; i < aList.length; i++) {
			// 	var index = aList[i].slice(-1);
			// 	aIndices.push(index);
			// }
		
			// for (var j = 0; j < aIndices.length; j++) {
			// 	APMailIDArray.splice(aIndices[j], 1);
			// }
			MasterModel.refresh();
			oTable.removeSelections(true);
		},

		onDeleteAPScanTeam: function (oEvent) {
			var oScanTable = this.byId("apScanTable");
			var aScanList = oScanTable.getSelectedContexts();
			if (aScanList.length === 0) {
				MessageToast.show("Select any Mail ID first!");
			}
			
			var MasterModel = this.getView().getModel("MasterModel");
			var aAPScanTeamArray = MasterModel.getData().APScanTeamList;
			
			for(var i = aScanList.length -1; i>=0; i--) {
			
				var oObject = aScanList[i].getObject();
				
				var index = $.map(aAPScanTeamArray, function(obj, index){
					if(obj === oObject) {
						return index;
					}
				});
				aAPScanTeamArray.splice(index,1);
			}
			MasterModel.refresh();
			oScanTable.removeSelections(true);
		},
		
		onDeletePosting: function(oEvent) {
			var oPostTable = this.byId("idPostingTable");
			var aPostList = oPostTable.getSelectedContexts();
			if(aPostList.length === 0) {
					MessageToast.show("Please select a row first!");
			} 
			var MasterModel = this.getView().getModel("MasterModel");
			var aPostingArr = MasterModel.getData().vendorDetailsDto;
			
			for(var i=aPostList.length - 1; i>=0; i--){
				var oPostObject = aPostList[i].getObject();
				var index = $.map(aPostingArr, function(obj, index){
					if(obj === oPostObject){
						return index;
					}
				});
				aPostingArr.splice(index,1);
			}
			MasterModel.refresh();
			oPostTable.removeSelections(true);
		},
		
		onCancel:function() {
			var baseModel = this.getView().getModel("baseModel");
			baseModel.getData().submitBtn = false;
			baseModel.getData().cancelBtn = false;
			baseModel.getData().editBtn = true;
			baseModel.getData().Editable = false;
			baseModel.refresh();
		}

	});
});