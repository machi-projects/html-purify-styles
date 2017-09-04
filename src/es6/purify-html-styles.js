import createDomParserPloyfill from './dom-parser-polyfill';

createDomParserPloyfill();

export default class PurifyHtmlStyles
{
	constructor(html)
	{
		this.xml = html;
	}
	
	parser( xml )
	{
		let xmlDoc = null;
		if (window.DOMParser) {
			var parser = new DOMParser ();
			xmlDoc = parser.parseFromString( xml , "text/html");
		} else if (window.ActiveXObject) {
			xmlDoc = new ActiveXObject ("Microsoft.XMLDOM");
			xmlDoc.async = false;
			xmlDoc.loadXML ( xml );
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
	}
	  
	createKey()
	{
		let randomKey = ( Math.random().toString(36).substr(2,6) ) ;
		return "sty__"+randomKey+"__cls";
	}

    
	groupStyleTagRules (styleTags) {

		let styleRules = {}
		let selectorsList = [];
		let duplicateFinder = [];

		for(var i=0;i<styleTags.length;i++)
		{
			let styleTag = styleTags[i];
			let cssRules = styleTag.sheet.cssRules || styleTag.sheet.rules;

			for(var j=0 ,len=cssRules.length;j<len;j++)
			{
				let cssRule = cssRules[j];

				let ruleSelector = cssRule.selectorText;
				
				
				let styleRule = styleRules[ ruleSelector ];
				let styleCssTxt = cssRule.style.cssText;
				
				//duplicateFinder[ ]  -- have to be added..
				
				styleRules[ ruleSelector  ] = (styleRule ? styleRule + styleCssTxt : styleCssTxt ) ;

			}	

		}	

		for(var selectorProp in styleRules )
		{
			selectorsList.push( selectorProp );
		}

		return { selectors : selectorsList , rules :  styleRules } ;
	}

	mergeStyles(stylesString)
	{

		let cssStyles = stylesString.trim().split(";");
		let jsonStyles = {};
		for(var k=0; k<cssStyles.length; k++)
		{
			let cssStyle = cssStyles[k].trim();
			if( cssStyle ){
				let cssProperties = cssStyle.split(":");
				let cssPropertyName = cssProperties[0].trim();
				let cssPropertyValue = cssProperties[1].trim();
				jsonStyles[ cssPropertyName ] = cssPropertyValue; 
			}
			
		}	
		
		let cssString = "";
		// jsonStyles would be the JavaScript object representing your CSS.
		for (var cssPropertyName in jsonStyles) {

			// In this case, it is also the CSS selector.
			cssString += cssPropertyName + ": " + jsonStyles[cssPropertyName] + ";";
		}

		return cssString;

	}
    
    
	run()
	{
		
		let myXmlDoc = this.parser( "<div id='purifyStyleMyStyler'></div>");

		var purifyStyleMyStyler=  myXmlDoc.getElementById("purifyStyleMyStyler")
		purifyStyleMyStyler.innerHTML = this.xml;

		//get previous styles rules from dom...
		let oldStyledSheets = myXmlDoc.querySelectorAll('[data-css-purify-styler]'); 
		let oldStylesList = Object.assign({},this.groupStyleTagRules( oldStyledSheets ));
		let oldStyleRulesSelectors = oldStylesList.selectors;
		let oldStyleRules = oldStylesList.rules;
		
		var unWantedStyleTags = myXmlDoc.querySelectorAll("[style]");
		for(var i=0; i < unWantedStyleTags.length; i++ )
		{
			var styledTag = unWantedStyleTags[ i ];
			var styledCssText = styledTag.getAttribute("style");
			if( styledCssText ){
				
				let classNames = (styledTag.className || '').trim();
				
				//Find old classNames...
				let classNamesToSelectors = ("."+classNames.replace(/ /g, " .")).split(" ");
				let oldClassName = '';
				let foundClassName = classNamesToSelectors.some((r)=>{
					let whichIndex = oldStyleRulesSelectors.indexOf(r);
					oldClassName = oldStyleRulesSelectors[ whichIndex ];
					return whichIndex >= 0;
				})
				
				//generate new className if not exists in  old styles 
				var stylingSelectorKey = oldClassName ? oldClassName : '.'+this.createKey();
				
				//combine with old styles 
				let oldStylesCssText = (oldStyleRules[ oldClassName ] || '');
				oldStyleRules[ stylingSelectorKey ] = oldStylesCssText ? this.mergeStyles( oldStylesCssText + styledCssText ) : styledCssText;
				
				
				//Add/update classsName
				let classNamesSeprator = classNames ? ' ' : '';
				let stylingSelectorKey1 = stylingSelectorKey.replace('.','');
				styledTag.className += ( classNames.indexOf( stylingSelectorKey1 ) == -1 ? classNamesSeprator+stylingSelectorKey1 : '' );
				
			}
			
			//Remove style attributes...
			styledTag.removeAttribute("style");
		}	
		
		
		//Create new styler..
		let cssStyleSheet = "";
		for(var cssSelector in oldStyleRules)
		{
			let cssProperties = oldStyleRules[  cssSelector ];
			cssStyleSheet += ( cssSelector + "{" + cssProperties + "}" + "\n");
		}
		
		//Add stylesheet to dom...
		let stylingSheet = myXmlDoc.createElement('style');
			stylingSheet.type = 'text/css';
			stylingSheet.setAttribute("data-css-purify-styler", Date.now());
			//webkit bugfix...
			stylingSheet.appendChild(document.createTextNode(""));
			stylingSheet.innerHTML = cssStyleSheet;
		
		//Remove previous style tags from dom...
		Array.prototype.forEach.call( oldStyledSheets, function( node ) {
		    node.parentNode.removeChild( node );
		});
		
		/*for (var j = elem.length-1; j >= 0; j--) {
		    if (elem[j].parentNode) {
		        elem[j].parentNode.removeChild(elem[j]);
		    }
		}*/

		purifyStyleMyStyler.appendChild( stylingSheet );
		
		return  purifyStyleMyStyler.innerHTML;
	}
	
}
