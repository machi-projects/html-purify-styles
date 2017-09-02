"use strict";

var _purifyHtmlStyles = require("./purify-html-styles");

var htmlString = "<div class='flet' style='color:red;display:none'> <span style='margin-left:10px'> testing </span> </div>";
var purifyHtmlStyles = new _purifyHtmlStyles2.default(htmlString);
htmlString = purifyHtmlStyles.run();

console.log(htmlString);
