# html-purify-styles

Used for replace the HTML style attributes from given string.

It will give new string with style will be moved to last given string.

The styles will be converted as inline <style> tag.


## It supports run from npm javascript, es6 supported javascript, Pure javascript support also there... :-)


#Exmaple 

```

var htmlString = "<div class='flet' style='color:red;display:none'> <span style='margin-left:10px'> testing </span> </div>"
purifyHtmlStyles = new PurifyHtmlStyles( htmlString );
htmlString = purifyHtmlStyles.run();

console.log( htmlString );

```


