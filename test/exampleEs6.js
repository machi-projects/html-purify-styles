import PurifyHtmlStyles from './purify-html-styles';

let htmlString = `<div class='flet' style='color:red;display:none'> <span style='margin-left:10px'> testing </span> </div>`
PurifyHtmlStyles purifyHtmlStyles = new PurifyHtmlStyles( htmlString );
htmlString = purifyHtmlStyles.run();

console.log( htmlString );
