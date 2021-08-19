sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/core/library",
	"incture/com/APCreateInvoice/util/Formatter"
], function (Controller, Fragment, MessageBox, CoreLibrary, Formatter) {
	"use strict";
	var ValueState = CoreLibrary.ValueState,
		oData = {
			confirmationState: ValueState.Error,
			shipDateState: ValueState.Error,
			nextButtonEnabled: false,
			reviewButton: false,
			backButtonVisible: false,
			confirmationNumber: "",
			shippingDate: "",
			shipmentComment: ""
		};
	return Controller.extend("incture.com.APCreateInvoice.controller.displayPOdetails", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("displayPOdetails").attachPatternMatched(this._onObjectMatched, this);
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			var mHistoryDetails = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV");
			this.getView().setModel(mHistoryDetails, "mHistoryDetails");
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			var status = mHeaderDetails.getProperty("/Statusdesc");
			if (status === "REQUIRES CONFIRMATION") {
				mHeaderDetails.setProperty("/btnpoConfirmVisible", true);
			} else {
				mHeaderDetails.setProperty("/btnpoConfirmVisible", false);
			}

			//Start of Prashanth Shekar
			var oPOConfirmModel = new sap.ui.model.json.JSONModel();
			var oInitialModelState = Object.assign({}, oData);

			oPOConfirmModel.setData(oInitialModelState);
			this.getView().setModel(oPOConfirmModel, "oPOConfirmModel");
			oPOConfirmModel.setProperty("/nextButtonEnabled", false);
			oPOConfirmModel.refresh();

			this.POSelectedItems = [];
			this.selectedItems = [];

			this.busyDialog = new sap.m.BusyDialog();
			//End of PS
		},
		handleIconTabSelectChangeSelection: function (oEvent) {
			var mPropertyModel = this.getView().getModel("mPropertyModel");
			var selectedKey = oEvent.getSource().getProperty("selectedKey");
			if (selectedKey) {
				if (selectedKey === "POKey") {
					mPropertyModel.setProperty("/selectedIconTab", selectedKey);
				} else {
					mPropertyModel.setProperty("/selectedIconTab", selectedKey);
				}
			}
		},
		onGotoCreateEInvoice: function () {
			if (!this.createMemoFrag) {
				this.createMemoFrag = sap.ui.xmlfragment("incture.com.APCreateInvoice.Fragments.createMemoFrag", this);
				this.getView().addDependent(this.createMemoFrag);
			}
			this.createMemoFrag.open();
		},
		cancelCreditMemo: function () {
			this.createMemoFrag.close();
		},
		OKCreditMemo: function () {
			this.onClickSubmit();
		},
		onClickSubmit: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("singlePOinvoicecreate");
		},
		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrder");
		},
		changeType: function (oEvent) {
			var txt = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var mHeaderDetails = this.getOwnerComponent().getModel("mHeaderDetails");
			mHeaderDetails.setProperty("/type", txt);
		},
		_onObjectMatched: function (oEvent) {
			this.getView().byId("ObjectPageLayout").setSelectedSection(this.getView().byId("InvoiceInfo"));
			var obj = {
				"selectedIconTab": "summary"
			};
			var mPropertyModel = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(mPropertyModel, "mPropertyModel");
			mPropertyModel.setProperty("/selectedIconTab", obj.selectedIconTab);
			var that = this;
			var data = this.getView().getModel("selectedObject").getData();
			var poHeaderSet = new sap.ui.model.json.JSONModel({
				"results": data
			});
			this.getView().setModel(poHeaderSet, "poHeaderSet");
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			oPODetailModel.read("/L_EKKOSet('" + data.Purch_Ord + "')/HeadToItem", {
				async: false,
				success: function (oData, oResponse) {
					busyDialog.close();
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].taxCode = "V1";
						oData.results[i].taxPer = "10";
						oData.results[i].taxAmount = (parseFloat(oData.results[i].Net_Value) * (parseFloat(oData.results[i].taxPer) / 100)).toFixed(2);
					}
					var poItemSet = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(poItemSet, "poItemSet");

					var mReviewModel = that.getOwnerComponent().getModel("mReviewModel");
					var totalAmount = 0;
					var taxAmount = 0;
					var dueAmount = 0;
					mReviewModel.setProperty("/totalAmount", totalAmount.toFixed(2));
					mReviewModel.setProperty("/dueAmount", dueAmount.toFixed(2));
					mReviewModel.setProperty("/taxAmount", taxAmount.toFixed(2));
					var date = new Date();
					var mon = date.getMonth() + 1;
					var dDate = date.getDate();
					var year = date.getFullYear();
					var currentDate = year + "-" + mon + "-" + dDate;
					poItemSet.setProperty("/invDate", currentDate);
				},
				error: function (error) {
					busyDialog.close();
					var errorMsg = JSON.parse(error.responseText);
					errorMsg = errorMsg.error.message.value;
					that.errorMsg(errorMsg);
				}
			});

			oPODetailModel.read("/L_EKKOSet('" + data.Purch_Ord + "')/HeadToCond", {
				async: false,
				success: function (oData, oResponse) {
					var mconditionModel = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(mconditionModel, "mconditionModel");
				},
				error: function (error) {
					var errorMsg = JSON.parse(error.responseText);
					errorMsg = errorMsg.error.message.value;
					that.errorMsg(errorMsg);
				}
			});
			/*	
				var mHistoryModel = this.getView().getModel("mHistoryModel");
				mHistoryModel.read("/Header_DataSet", {
					urlParameters: "?$filter=Purchaseorder eq'" + data.Purch_Ord +
						"'&$expand=HTH,HTI/ITA,HTHIS,HTHT,HTSCH,HTR,HTA&$format=json",
					success: function (oData) {
						
						var mHistoryDetails = new sap.ui.model.json.JSONModel({
							"results": oData.results
						});
						that.getView().setModel(mHistoryDetails, "mHistoryDetails");
					},
					error: function (oError) {
						var errorMsg = JSON.parse(oError.responseText);
						errorMsg = errorMsg.error.message.value;
						that.errorMsg(errorMsg);
					}
				});*/

			this.getPOHistory();
		},
		getPOHistory: function () {
			var data = this.getView().getModel("selectedObject").getData();
			var mHistoryDetails = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mHistoryDetails, "mHistoryDetails");
			/*	var url =
					"DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV/Header_DataSet?$filter=Purchaseorder eq '" + data.Purch_Ord +
					"'&$expand=HTH,HTI/ITA,HTHIS,HTHT,HTSCH,HTR,HTA&$format=json";*/
			var url =
				"DEC_NEW/sap/opu/odata/sap/ZAP_BAPI_PO_GET_DET_SRV/Header_DataSet?$filter=Purchaseorder eq '" + data.Purch_Ord +
				"'&$expand=HTH,HTI/ITA,HTI/ITS,HTI/ITP,HTHIS,HTHT,HTSCH,HTA,HTP,HTR&$format=json";
			mHistoryDetails.loadData(url, null, true);
			mHistoryDetails.attachRequestCompleted(null, function () {
				mHistoryDetails.refresh();
			});
			/*	var mHistoryDetails = this.getView().getModel("mHistoryDetails");
				mHistoryDetails.read("/Header_DataSet", {
					urlParameters: "$filter=Purchaseorder eq '4500000093'&$expand=HTH,HTI/ITA,HTHIS,HTHT,HTSCH,HTR,HTA&$format=json",
					success: function (oData) {
						
					},
					error: function (oError) {

					}
				});*/
		},
		onPressMatcode: function (oEvent) {
			var oButton = oEvent.getSource();
			var poItemSet = this.getView().getModel("poItemSet");
			var sPath = oEvent.getSource().getBindingContext("poItemSet").getPath();
			var selectedObject = poItemSet.getProperty(sPath);
			var url = "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/MaterialDetailsSet?$filter=Material eq '" + selectedObject.Material +
				"'&$format=json";
			var that = this;
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						var matModel = new sap.ui.model.json.JSONModel();
						that.getView().setModel(matModel, "matModel");
						matModel.setProperty("/results", result.d.results);
						that.viewMatDetails = sap.ui.xmlfragment("viewMatDetails", "incture.com.APCreateInvoice.Fragments.viewMatDetails", that);
						that.viewMatDetails.setModel(matModel);
						that.getView().addDependent(that.viewMatDetails);
						that.viewMatDetails.openBy(oButton);
					},
					error: function (err) {
						sap.m.MessageToast.show(err.statusText);
					}
				});
		},
		onCloseviewMatDetails: function () {
			this.viewMatDetails.close();
		},

		//Start of Prashanth Shekar
		onPressConfirmOrder: function (oEvent) {
			var oView = this.getView();
			var selectedId = oEvent.getParameters().id;
			this.selectedId = oEvent.getParameters().id;
			var oPOConfirmModel = this.getView().getModel("oPOConfirmModel");
			oPOConfirmModel.setProperty("/results", this.getView().getModel("poItemSet").getData().results);
			var aData = this.getView().getModel("oPOConfirmModel").getData().results;
			for (var i = 0; i < aData.length; i++) {
				oPOConfirmModel.setProperty("/results/" + i + "/promisedDate", this.getView().getModel("poItemSet").getData().results[i].DeliveryDate);
				oPOConfirmModel.setProperty("/results/" + i + "/confirmQty", this.getView().getModel("poItemSet").getData().results[i].Quantity);
			}
			oPOConfirmModel.setProperty("/results", this.getView().getModel("poItemSet").getData().results);
			if (selectedId === "__xmlview1--partialConfirmation") {
				this.getView().getModel("oPOConfirmModel").setProperty("/partialConfirmItemVisible", true);
				this.getView().getModel("oPOConfirmModel").setProperty("/confirmEntireItemVisible", false);
				this.getView().getModel("oPOConfirmModel").setProperty("/POConfirmFragTitle", "Confirm Partial Order");
				this.cFlag = false;
				this.selectedItems = [];
			} else if (selectedId === "__xmlview1--confirmEntireOrder") {
				this.getView().getModel("oPOConfirmModel").setProperty("/partialConfirmItemVisible", false);
				this.getView().getModel("oPOConfirmModel").setProperty("/confirmEntireItemVisible", true);
				this.getView().getModel("oPOConfirmModel").setProperty("/POConfirmFragTitle", "Confirm Entire Order");
			}
			// create Dialog
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "incture.com.APCreateInvoice.Fragments.POConfirmationFrag",
					controller: this
				}).then(function (oDialog) {
					oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
					oView.addDependent(oDialog);
					// oDialog.bindElement("/ProductCollection/0");
					return oDialog;
				}.bind(this));
			}
			this._pDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onDialogAfterOpen: function () {
			this._oWizard = this.byId("POConfirmtWizard");
			this.handleButtonsVisibility();
		},

		handleButtonsVisibility: function () {
			var oModel = this.getView().getModel("oPOConfirmModel");
			switch (this._oWizard.getProgress()) {
			case 1:
				oModel.setProperty("/nextButtonVisible", true);
				oModel.setProperty("/nextButtonEnabled", true);
				oModel.setProperty("/backButtonVisible", false);
				oModel.setProperty("/reviewButtonVisible", false);
				oModel.setProperty("/finishButtonVisible", false);
				break;
			case 2:
				oModel.setProperty("/backButtonVisible", true);
				oModel.setProperty("/nextButtonVisible", false);
				oModel.setProperty("/reviewButtonVisible", true);
				oModel.setProperty("/finishButtonVisible", false);
				break;
			case 3:
				oModel.setProperty("/nextButtonVisible", false);
				oModel.setProperty("/finishButtonVisible", true);
				oModel.setProperty("/backButtonVisible", true);
				oModel.setProperty("/reviewButtonVisible", false);
				break;
			default:
				break;
			}

		},

		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {

						var selectedItems = this.getView().byId("partailConfirmTableId").getItems();
						for (var i = 0; i < selectedItems.length; i++) {
							selectedItems[i].setHighlight("None");
							selectedItems[i].getBindingContext("oPOConfirmModel").getObject().Action = "";
							selectedItems[i].getBindingContext("oPOConfirmModel").getObject().sHighLight = "None";
						}
						this.getView().byId("partailConfirmTableId").removeSelections();

						this._oWizard.discardProgress(this._oWizard.getSteps()[0]);

						this._oWizard.invalidateStep(this.byId("confirmOrderStep1"));
						this._oWizard.invalidateStep(this.byId("confirmOrderStep2"));
						this.selectedItems = [];
						this.byId("wizardDialog").close();
						this.getView().getModel("oPOConfirmModel").setData(Object.assign({}, oData));
					}
				}.bind(this)
			});
		},

		handleWizardCancel: function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel your transaction?", "warning");
		},

		onDialogBackButton: function () {
			this._oWizard.previousStep();
			this.handleButtonsVisibility();
		},

		onDialogNextButton: function () {
			if (this._oWizard.getProgressStep().getValidated()) {
				this._oWizard.nextStep();
			}

			// if (this.selectedId === "__xmlview1--partialConfirmation") {
			// 	if (this.selectedItems) {
			// 		this._oWizard.validateStep(this.byId("confirmOrderStep2"));
			// 		this._oWizard.nextStep();
			// 	} else {
			// 		sap.m.MessageToast.show("select atleast one item");
			// 	}
			// }

			this.handleButtonsVisibility();
		},
		onDialogReviewButton: function () {
			if (this.selectedId === "__xmlview1--confirmEntireOrder") {
				/*	if (this._oWizard.getProgressStep().getValidated()) {*/
				this._oWizard.nextStep();
				//}
			}
			if (this.selectedId === "__xmlview1--partialConfirmation") {
				if (this.selectedItems.length) {
					if (this.cFlag) {
						this._oWizard.validateStep(this.byId("confirmOrderStep2"));
						this._oWizard.nextStep();
					} else {
						sap.m.MessageToast.show("Please Acknowledge the selected line items ");
					}
				} else {
					sap.m.MessageToast.show("select atleast one item");
				}
			}
			this.handleButtonsVisibility();
		},

		discardProgress: function () {
			var oModel = this.getView().getModel("oPOConfirmModel");
			this._oWizard.discardProgress(this.byId("POConfirmtWizard"));

			var clearContent = function (aContent) {
				for (var i = 0; i < aContent.length; i++) {
					if (aContent[i].setValue) {
						aContent[i].setValue("");
					}

					if (aContent[i].getContent) {
						clearContent(aContent[i].getContent());
					}
				}
			};
			oModel.setProperty("/productWeightState", ValueState.None);
			oModel.setProperty("/productNameState", ValueState.None);
			clearContent(this._oWizard.getSteps());
		},

		confirmOrderIdValidation: function (oEvent) {
			var oModel = this.getView().getModel("oPOConfirmModel"),
				confirmOrderId = this.byId("confirmOrderId").getValue();

			this.handleButtonsVisibility();
			if (!confirmOrderId) {
				this._oWizard.invalidateStep(this.byId("confirmOrderStep1"));
				oModel.setProperty("/confirmationState", ValueState.Error);
			} else {
				this._oWizard.validateStep(this.byId("confirmOrderStep1"));
				oModel.setProperty("/confirmationState", ValueState.None);
			}
		},

		onSubmitConfirmText: function () {
			var state = this.getView().getModel("oPOConfirmModel").getProperty("/confirmationState");
			if (state === "None") {
				this._oWizard.validateStep(this.byId("confirmOrderStep1"));
				this._oWizard.nextStep();
				this.handleButtonsVisibility();

			} else {
				sap.m.MessageToast.show("Please fill the mandatory fields");
			}
		},

		onChangeShippingDate: function (oEvent) {
			var oModel = this.getView().getModel("oPOConfirmModel");
			var shipDated = this.byId("shippingDate").getValue();
			if (shipDated) {
				oModel.setProperty("/shipDateState", ValueState.None);
				this._oWizard.validateStep(this.byId("confirmOrderStep2"));
			} else {
				oModel.setProperty("/shipDateState", ValueState.Error);
				this._oWizard.invalidateStep(this.byId("confirmOrderStep2"));
			}
		},

		onPressRejectOrder: function (oEvent) {
			var selectedId = oEvent.getParameters().id;
			this.selectedId = oEvent.getParameters().id;
			if (!this.oRejectPODialog) {
				this.oRejectPODialog = new sap.m.Dialog({
					title: "Reject",
					type: sap.m.DialogType.Message,
					content: [
						new sap.m.Label({
							text: "Do you want to reject this order?",
							labelFor: "rejectionNote"
						}),
						new sap.m.TextArea("rejectionNote", {
							width: "100%",
							placeholder: "Add note (optional)",
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								this.getView().getModel("oPOConfirmModel").setProperty("/rejectionComment", sText);
								this.oRejectPODialog.getBeginButton().setEnabled(sText.length > 0);
								this.getView().getModel("oPOConfirmModel").refresh();
							}.bind(this)
						})
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Reject",
						press: function () {
							this.oRejectPODialog.close();
							this.onDialogPOPartialSubmit(this.selectedId);
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function () {
							this.oRejectPODialog.close();
						}.bind(this)
					})
				});
			}

			this.oRejectPODialog.open();
		},

		//This function is triggered on selection of table items from Partial Confirmation Frag #POConfirmationFrag
		onSelectPOPartialConfirmItem: function (oEvent) {
			var oPOConfirmModel = this.getView().getModel("oPOConfirmModel");
			var selectedItems = oEvent.getSource().getSelectedItems();
			this.selectedItems = oEvent.getSource().getSelectedItems();
			this.POSelectedItems = [];
			this.cFlag = false;
			if (selectedItems.length > 0) {
				for (var i = 0; i < selectedItems.length; i++) {
					var oPOConfirmModel = selectedItems[i].getBindingContext("oPOConfirmModel").getObject();
					this.POSelectedItems.push(oPOConfirmModel);
				}
			} else {
				sap.m.MessageToast.show("Please select atleast one line item");
				return;
			}
		},

		onPressAcceptLineitem: function (oEvent) {
			var selectedItems = this.getView().byId("partailConfirmTableId").getSelectedItems();
			if (this.selectedItems) {
				for (var i = 0; i < this.selectedItems.length; i++) {
					this.selectedItems[i].setHighlight("Success");
					this.selectedItems[i].getBindingContext("oPOConfirmModel").getObject().Action = "ACCEPT";
					this.selectedItems[i].getBindingContext("oPOConfirmModel").getObject().sHighLight = "Success";
				}
				this.cFlag = true;
				this.getView().byId("partailConfirmTableId").removeSelections();
			}
		},

		onPressRejectLineItem: function () {
			var selectedItems = this.getView().byId("partailConfirmTableId").getSelectedItems();
			if (this.selectedItems) {
				for (var i = 0; i < this.selectedItems.length; i++) {
					this.selectedItems[i].setHighlight("Error");
					this.selectedItems[i].getBindingContext("oPOConfirmModel").getObject().Action = "REJECT";
					this.selectedItems[i].getBindingContext("oPOConfirmModel").getObject().sHighLight = "Error";
				}
				this.cFlag = true;
				this.getView().byId("partailConfirmTableId").removeSelections();
			}

		},

		onQtyChange: function (oEvent) {
			var newValue = "";
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (!(/^([0-9]{1,12})(?:\.\d{0,3})?$/.test(newValue))) {
					newValue = newValue.slice(0, -1);
				}
			}
			newValue = Math.trunc(Number(newValue));
			oEvent.getSource().setValue(newValue);
			oEvent.getSource().getBindingContext("oPOConfirmModel").getObject().confirmQty = newValue;
			// oEvent.getSource().getBindingContext("oPOConfirmModel").getObject().Quantity = newValue;
			var vChangedIndex = parseInt(oEvent.getSource().getBindingContext("oPOConfirmModel").getPath().split("/")[2], 10);
			var oModel = oEvent.getSource().getModel("oPOConfirmModel");
			var oItem = oEvent.getSource().getBindingContext("oPOConfirmModel").getObject();
			oItem.Net_Value = parseFloat(parseFloat(oItem.Net_Price, 10) * parseFloat(oItem.confirmQty, 10), 10);
			oModel.refresh(true);
		},

		onChangeLineItemShippingDate: function (oEvent) {
			// var newValue = oEvent.getParameters().value;
			// oEvent.getSource().getBindingContext("oPOConfirmModel").getObject().promisedDate = newValue;
			// var oModel = oEvent.getSource().getModel("oPOConfirmModel");
			// oModel.refresh(true);
		},

		onDialogPOSubmit: function () {
			// this._handleMessageBoxOpen("Are you sure you want to submit your PO?", "confirm");
			var sMessageBoxType = "confirm";
			var sMessage = "Are you sure you want to submit your PO?";
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this.onDialogPOPartialSubmit();
						var selectedItems = this.getView().byId("partailConfirmTableId").getItems();
						for (var i = 0; i < selectedItems.length; i++) {
							selectedItems[i].setHighlight("None");
							selectedItems[i].getBindingContext("oPOConfirmModel").getObject().Action = "";
							selectedItems[i].getBindingContext("oPOConfirmModel").getObject().sHighLight = "None";
						}
						this.getView().byId("partailConfirmTableId").removeSelections();

						this._oWizard.discardProgress(this._oWizard.getSteps()[0]);

						this._oWizard.invalidateStep(this.byId("confirmOrderStep1"));
						this._oWizard.invalidateStep(this.byId("confirmOrderStep2"));
						this.selectedItems = [];
						this.byId("wizardDialog").close();
						this.getView().getModel("oPOConfirmModel").setData(Object.assign({}, oData));
					}
				}.bind(this)
			});
		},

		onDialogPOPartialSubmit: function (oEvent) {
			var selectedId = this.selectedId;
			var PO = this.getView().getModel("mHeaderDetails").getData().Purch_Ord;
			var POHeader = this.getView().getModel("mHeaderDetails").getData();
			var url = "InctureApDest/poConfirmation/savePurchaseOrderItem";
			var purchaseItemList = [];
			var poConfirmationItems = [];
			var POData = this.getView().getModel("oPOConfirmModel").getData();
			var aResults = POData.results;
			var obj = {};
			if (selectedId === "__xmlview1--partialConfirmation") {
				for (var i = 0; i < aResults.length; i++) {
					if (aResults[i].Action) {
						obj = {
							"poNumber": PO,
							"poItemId": aResults[i].Item,
							"confirmationSerialNo": "",
							"description": aResults[i].Decription,
							"materialCode": aResults[i].Material,
							"orderQuantity": aResults[i].Quantity,
							"uom": aResults[i].Unit,
							"unitPrice": aResults[i].Net_Price,
							"netPrice": aResults[i].Net_Value,
							"plant": aResults[i].Plant,
							"deliveryDate": aResults[i].DeliveryDate,
							"confirmQuantity": aResults[i].confirmQty,
							"promisedDeliveryDate": aResults[i].promisedDate, //-->DDMMYYYY 
							"confirmationStatus": aResults[i].Action,
							"serialNo": ""
						};
						poConfirmationItems.push(obj);
					} else {
						obj = {
							"documentNumber": PO,
							"documentItem": aResults[i].Item,
							"shortText": aResults[i].Decription,
							"materialCode": aResults[i].Material,
							"orderUnit": aResults[i].Unit,
							"netPrice": aResults[i].Net_Price,
							"taxCode": aResults[i].taxCode,
							"deliveredQty": aResults[i].Quantity,
							"invoiceQty": aResults[i].Quantity,
							"taxPercentage": aResults[i].taxPer,
							"totalPrice": aResults[i].Net_Value, //Net Price
							"taxAmount": "",
							"deliveryDate": aResults[i].DeliveryDate
						};
						purchaseItemList.push(obj);
					}
				}
				var oPayload = {
					"purchaseItemList": purchaseItemList,
					"poConfirmationItems": poConfirmationItems,
					"purchaseHeader": {
						"documentNumber": POHeader.Purch_Ord,
						"documentCat": "",
						"documentType": "",
						"companyCode": POHeader.Company_Code,
						"status": "",
						"vendor": POHeader.vendorName,
						"paymentTerms": "",
						"purchaseOrg": POHeader.Purch_Org,
						"currency": "",
						"confirmationText": POData.confirmationNumber,
						"poNetPrice": POHeader.NetPrice,
						"poCreatedBy": "",
						"createdBy": POHeader.Created_By,
						"poCreatedDate": POHeader.POdate
					}
				};
			}
			if (selectedId === "__xmlview1--confirmEntireOrder") {
				var sDate = this.getView().getModel("oPOConfirmModel").getData().shippingDate;
				var shippingDate = sDate.split("-")[2] + "-" + sDate.split("-")[1] + "-" + sDate.split("-")[0] + "T00:00:00";
				for (var i = 0; i < aResults.length; i++) {
					obj = {
						"poNumber": PO,
						"poItemId": aResults[i].Item,
						"confirmationSerialNo": "",
						"description": aResults[i].Decription,
						"materialCode": aResults[i].Material,
						"orderQuantity": aResults[i].Quantity,
						"uom": aResults[i].Unit,
						"unitPrice": aResults[i].Net_Price,
						"netPrice": aResults[i].Net_Value,
						"plant": aResults[i].Plant,
						"deliveryDate": aResults[i].DeliveryDate,
						"confirmQuantity": aResults[i].confirmQty,
						"promisedDeliveryDate": shippingDate, //-->DDMMYYYY 
						"confirmationStatus": "ACCEPT",
						"serialNo": ""
					};
					poConfirmationItems.push(obj);
				}
				var oPayload = {
					"purchaseItemList": purchaseItemList,
					"poConfirmationItems": poConfirmationItems,
					"purchaseHeader": {
						"documentNumber": POHeader.Purch_Ord,
						"documentCat": "",
						"documentType": "",
						"companyCode": POHeader.Company_Code,
						"status": "",
						"vendor": POHeader.vendorName,
						"paymentTerms": "",
						"purchaseOrg": POHeader.Purch_Org,
						"currency": "",
						"confirmationText": POData.confirmationNumber,
						"poNetPrice": POHeader.NetPrice,
						"poCreatedBy": "",
						"createdBy": POHeader.Created_By,
						"poCreatedDate": POHeader.POdate
					}
				};
			}
			if (selectedId === "__xmlview1--rejectEntireOrder") {
				// var sDate = this.getView().getModel("oPOConfirmModel").getData().shippingDate;
				// var shippingDate = sDate.split("-")[2] + "-" + sDate.split("-")[1] + "-" + sDate.split("-")[0] + "T00:00:00";
				var aResults = this.getView().getModel("poItemSet").getData().results;
				var rejectionComment = this.getView().getModel("oPOConfirmModel").getProperty("/rejectionComment");
				for (var i = 0; i < aResults.length; i++) {
					obj = {
						"poNumber": PO,
						"poItemId": aResults[i].Item,
						"confirmationSerialNo": "",
						"description": aResults[i].Decription,
						"materialCode": aResults[i].Material,
						"orderQuantity": aResults[i].Quantity,
						"uom": aResults[i].Unit,
						"unitPrice": aResults[i].Net_Price,
						"netPrice": aResults[i].Net_Value,
						"plant": aResults[i].Plant,
						"deliveryDate": aResults[i].DeliveryDate,
						"confirmQuantity": "",
						"promisedDeliveryDate": "", //-->DDMMYYYY 
						"confirmationStatus": "REJECT",
						"serialNo": ""
					};
					poConfirmationItems.push(obj);
				}
				var oPayload = {
					"purchaseItemList": purchaseItemList,
					"poConfirmationItems": poConfirmationItems,
					"purchaseHeader": {
						"documentNumber": POHeader.Purch_Ord,
						"documentCat": "",
						"documentType": "",
						"companyCode": POHeader.Company_Code,
						"status": "",
						"vendor": POHeader.vendorName,
						"paymentTerms": "",
						"purchaseOrg": POHeader.Purch_Org,
						"currency": "",
						"confirmationText": rejectionComment, // Reject comment for Reject a entire PO
						"poNetPrice": POHeader.NetPrice,
						"poCreatedBy": "",
						"createdBy": POHeader.Created_By,
						"poCreatedDate": POHeader.POdate
					}
				};
			}
			this.busyDialog.open();
			var that = this;
			jQuery.ajax({
				type: "POST",
				contentType: "application/json",
				url: url,
				dataType: "json",
				data: JSON.stringify(oPayload),
				async: true,
				success: function (result) {
					that.busyDialog.close();
					if (result.message === "Success") {
						var PONumber = that.getView().getModel("mHeaderDetails").getData().Purch_Ord;
						var msg = "Confirmation request for PO " + PONumber + " has been submitted";
					} else if (result.message === "Failure") {
						var msg = result.status;
					}

					MessageBox.success(msg, {
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === MessageBox.Action.OK) {
								that.oRouter.navTo("purchaseOrder");
							}
						}.bind(this)
					});
				},
				error: function (err) {
					that.busyDialog.close();
					sap.m.MessageToast.show(err.statusText);
				}
			});
		},

		//Partial Confirmation
		onPressConfirmPartialOrder: function (oEvent) {
			var oView = this.getView();
			var selectedId = oEvent.getParameters().id;
			this.selectedId = oEvent.getParameters().id;
			var oPOConfirmModel = this.getView().getModel("oPOConfirmModel");
			oPOConfirmModel.setProperty("/results", this.getView().getModel("poItemSet").getData().results);
			var aData = this.getView().getModel("oPOConfirmModel").getData().results;
			for (var i = 0; i < aData.length; i++) {
				oPOConfirmModel.setProperty("/results/" + i + "/promisedDate", this.getView().getModel("poItemSet").getData().results[i].DeliveryDate);
				oPOConfirmModel.setProperty("/results/" + i + "/confirmQty", this.getView().getModel("poItemSet").getData().results[i].Quantity);
			}
			oPOConfirmModel.setProperty("/results", this.getView().getModel("poItemSet").getData().results);
			// if (selectedId === "__xmlview1--partialConfirmation") {
			// 	this.getView().getModel("oPOConfirmModel").setProperty("/partialConfirmItemVisible", true);
			// 	this.getView().getModel("oPOConfirmModel").setProperty("/confirmEntireItemVisible", false);
			// 	this.getView().getModel("oPOConfirmModel").setProperty("/POConfirmFragTitle", "Confirm Partial Order");
			// } else if (selectedId === "__xmlview1--confirmEntireOrder") {
			// 	this.getView().getModel("oPOConfirmModel").setProperty("/partialConfirmItemVisible", false);
			// 	this.getView().getModel("oPOConfirmModel").setProperty("/confirmEntireItemVisible", true);
			// 	this.getView().getModel("oPOConfirmModel").setProperty("/POConfirmFragTitle", "Confirm Entire Order");
			// }
			// create Dialog
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "incture.com.APCreateInvoice.Fragments.POPartialConfirmationFrag",
					controller: this
				}).then(function (oDialog) {
					oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
					oView.addDependent(oDialog);
					// oDialog.bindElement("/ProductCollection/0");
					return oDialog;
				}.bind(this));
			}
			this._pDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		//End of Prashanth Shekar
	});

});