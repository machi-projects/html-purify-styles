"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (DOMParser) {

	var DOMParser_proto = DOMParser.prototype,
	    real_parseFromString = DOMParser_proto.parseFromString;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if (new DOMParser().parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	DOMParser_proto.parseFromString = function (markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var doc = document.implementation.createHTMLDocument("");
			if (markup.toLowerCase().indexOf('<!doctype') > -1) {
				doc.documentElement.innerHTML = markup;
			} else {
				doc.body.innerHTML = markup;
			}
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};
})(DOMParser);

var PurifyHtmlStyles = function () {
	function PurifyHtmlStyles(html) {
		_classCallCheck(this, PurifyHtmlStyles);

		this.xml = html;
	}

	PurifyHtmlStyles.prototype.parser = function parser(xml) {
		var xmlDoc = null;
		if (window.DOMParser) {
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(xml, "text/html");
		} else if (window.ActiveXObject) {
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = false;
			xmlDoc.loadXML(xml);
		}
		return xmlDoc;

		/* 
   	//Error Handling...
   	
   	var errorMsg = null;
            if (xmlDoc.parseError && xmlDoc.parseError.errorCode != 0) {
                errorMsg = "XML Parsing Error: " + xmlDoc.parseError.reason
                          + " at line " + xmlDoc.parseError.line
                          + " at position " + xmlDoc.parseError.linepos;
            }
            else {
                if (xmlDoc.documentElement) {
                    if (xmlDoc.documentElement.nodeName == "parsererror") {
                        errorMsg = xmlDoc.documentElement.childNodes[0].nodeValue;
                    }
                }
                else {
                    errorMsg = "XML Parsing Error!";
                }
            }
           
  	 */
	};

	PurifyHtmlStyles.prototype.createKey = function createKey() {
		var randomKey = Math.random().toString(36).substr(2, 6) + Math.random().toString(36).substr(2, 4);
		return "css__" + randomKey + "__class";
	};

	PurifyHtmlStyles.prototype.run = function run() {
		//Combine styles ....have to handle it..

		var myXmlDoc = this.parser("<div id='purifyStyleMyStyler'></div>");

		var purifyStyleMyStyler = myXmlDoc.getElementById("purifyStyleMyStyler");
		purifyStyleMyStyler.innerHTML = this.xml;

		//var stylingSheet = myXmlDoc.querySelectorAll('[data-css-purify-styler]')[0]; 
		var stylingSheet = myXmlDoc.createElement('style');
		stylingSheet.type = 'text/css';
		stylingSheet.setAttribute("data-css-purify-styler", Date.now());
		stylingSheet.appendChild(document.createTextNode(""));

		var cssStyleSheet = "";
		var unWantedStyleTags = myXmlDoc.querySelectorAll("[style]");
		for (var i = 0; i < unWantedStyleTags.length; i++) {
			var styledTag = unWantedStyleTags[i];
			var styledCssText = styledTag.getAttribute("style");
			if (styledCssText) {
				var stylingKey = this.createKey();

				cssStyleSheet += '.' + stylingKey + "{" + styledCssText + "}" + "\n";
				var classNames = styledTag.className || '';
				styledTag.className += classNames.indexOf(stylingKey) == -1 ? stylingKey : '';
			}
			styledTag.removeAttribute("style");
		}

		stylingSheet.innerHTML = cssStyleSheet;
		purifyStyleMyStyler.appendChild(stylingSheet);

		return purifyStyleMyStyler.innerHTML;
	};

	return PurifyHtmlStyles;
}();
