"use strict";

exports.__esModule = true;

var _domParserPloyfill = require("./dom-parser-ployfill");

var _domParserPloyfill2 = _interopRequireDefault(_domParserPloyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(0, _domParserPloyfill2.default)();

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

exports.default = PurifyHtmlStyles;
