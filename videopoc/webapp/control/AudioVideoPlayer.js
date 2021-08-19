sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("incture.com.videopoc.AudioVideoPlayer", {
		metadata: {
			properties: {
				"src": {
					"type": "string"
				},
				"type": {
					"type": "string",
					defaultValue: "audio/mpeg"
				}
			},
			aggregations: {},
			events: {}
		},
		init: function () {

		},
		renderer: {
			render: function (oRm, oControl) {
				oRm.write("<center><video width='320' height='240' controls autoplay>");
				oRm.write("<source src='" + oControl.getSrc() + "'>");
				oRm.write("</video></center>");
			}
		}
	});
});