"use strict";
createDomParserPloyfill();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
		var randomKey = Math.random().toString(36).substr(2, 6);
		return "sty__" + randomKey + "__cls";
	};

	PurifyHtmlStyles.prototype.groupStyleTagRules = function groupStyleTagRules(styleTags) {

		var styleRules = {};
		var selectorsList = [];
		var duplicateFinder = [];

		for (var i = 0; i < styleTags.length; i++) {
			var styleTag = styleTags[i];
			var cssRules = styleTag.sheet.cssRules || styleTag.sheet.rules;

			for (var j = 0, len = cssRules.length; j < len; j++) {
				var cssRule = cssRules[j];

				var ruleSelector = cssRule.selectorText;

				var styleRule = styleRules[ruleSelector];
				var styleCssTxt = cssRule.style.cssText;

				//duplicateFinder[ ]  -- have to be added..

				styleRules[ruleSelector] = styleRule ? styleRule + styleCssTxt : styleCssTxt;
			}
		}

		for (var selectorProp in styleRules) {
			selectorsList.push(selectorProp);
		}

		return { selectors: selectorsList, rules: styleRules };
	};

	PurifyHtmlStyles.prototype.mergeStyles = function mergeStyles(stylesString) {

		var cssStyles = stylesString.trim().split(";");
		var jsonStyles = {};
		for (var k = 0; k < cssStyles.length; k++) {
			var cssStyle = cssStyles[k].trim();
			if (cssStyle) {
				var cssProperties = cssStyle.split(":");
				var _cssPropertyName = cssProperties[0].trim();
				var cssPropertyValue = cssProperties[1].trim();
				jsonStyles[_cssPropertyName] = cssPropertyValue;
			}
		}

		var cssString = "";
		// jsonStyles would be the JavaScript object representing your CSS.
		for (var cssPropertyName in jsonStyles) {

			// In this case, it is also the CSS selector.
			cssString += cssPropertyName + ": " + jsonStyles[cssPropertyName] + ";";
		}

		return cssString;
	};

	PurifyHtmlStyles.prototype.run = function run() {

		var myXmlDoc = this.parser("<div id='purifyStyleMyStyler'></div>");

		var purifyStyleMyStyler = myXmlDoc.getElementById("purifyStyleMyStyler");
		purifyStyleMyStyler.innerHTML = this.xml;

		//get previous styles rules from dom...
		var oldStyledSheets = myXmlDoc.querySelectorAll('[data-css-purify-styler]');
		var oldStylesList = Object.assign({}, this.groupStyleTagRules(oldStyledSheets));
		var oldStyleRulesSelectors = oldStylesList.selectors;
		var oldStyleRules = oldStylesList.rules;

		var unWantedStyleTags = myXmlDoc.querySelectorAll("[style]");
		for (var i = 0; i < unWantedStyleTags.length; i++) {
			var styledTag = unWantedStyleTags[i];
			var styledCssText = styledTag.getAttribute("style");
			if (styledCssText) {

				var classNames = (styledTag.className || '').trim();

				//Find old classNames...
				var classNamesToSelectors = ("." + classNames.replace(/ /g, " .")).split(" ");
				var oldClassName = '';
				var foundClassName = classNamesToSelectors.some(function (r) {
					var whichIndex = oldStyleRulesSelectors.indexOf(r);
					oldClassName = oldStyleRulesSelectors[whichIndex];
					return whichIndex >= 0;
				});

				//generate new className if not exists in  old styles 
				var stylingSelectorKey = oldClassName ? oldClassName : '.' + this.createKey();

				//combine with old styles 
				var oldStylesCssText = oldStyleRules[oldClassName] || '';
				oldStyleRules[stylingSelectorKey] = oldStylesCssText ? this.mergeStyles(oldStylesCssText + styledCssText) : styledCssText;

				//Add/update classsName
				var classNamesSeprator = classNames ? ' ' : '';
				var stylingSelectorKey1 = stylingSelectorKey.replace('.', '');
				styledTag.className += classNames.indexOf(stylingSelectorKey1) == -1 ? classNamesSeprator + stylingSelectorKey1 : '';
			}

			//Remove style attributes...
			styledTag.removeAttribute("style");
		}

		//Create new styler..
		var cssStyleSheet = "";
		for (var cssSelector in oldStyleRules) {
			var cssProperties = oldStyleRules[cssSelector];
			cssStyleSheet += cssSelector + "{" + cssProperties + "}" + "\n";
		}

		//Add stylesheet to dom...
		var stylingSheet = myXmlDoc.createElement('style');
		stylingSheet.type = 'text/css';
		stylingSheet.setAttribute("data-css-purify-styler", Date.now());
		//webkit bugfix...
		stylingSheet.appendChild(document.createTextNode(""));
		stylingSheet.innerHTML = cssStyleSheet;

		//Remove previous style tags from dom...
		Array.prototype.forEach.call(oldStyledSheets, function (node) {
			node.parentNode.removeChild(node);
		});

		/*for (var j = elem.length-1; j >= 0; j--) {
      if (elem[j].parentNode) {
          elem[j].parentNode.removeChild(elem[j]);
      }
  }*/

		purifyStyleMyStyler.appendChild(stylingSheet);

		return purifyStyleMyStyler.innerHTML;
	};

	return PurifyHtmlStyles;
}();
