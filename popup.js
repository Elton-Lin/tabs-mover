//console.log("popup is run");

// TODO: keyboard shortcuts to perform everything


var wrapper; // the UI html holder
var cur_tabs = []; // sort by tab index for now
var cur_tab_count = 0;
var tabs_to_move = [];
var num_tabs_to_move = 0;
var button;

var port = chrome.runtime.connect({name: "portatoe"});
//port.postMessage({joke: [1, 2224, 3]});

function executeButton() {

	if(num_tabs_to_move > 0) {

		// go thru all tabs and filter out the selected ones
		var tabs_id = [];
		wrapper.childNodes.forEach(function(t) {
			if(t.getAttribute("selected") == "true") {
				var id = parseInt(t.getAttribute("data-id"));
				tabs_id.push(id);
			}
		});

		//move_to_new_window(tabs_id);
		port.postMessage({ids: tabs_id});
	}
	
	
}

// function printHi() {
// 	console.log("Hiiii");
// }



// tab object is clicked - set selected and highligh states
function triggerClick(elem) {
	
	
	var selected = elem.getAttribute("selected");
	// console.log(selected);
	// console.log("clicked: ", elem.getAttribute("data-title"));

	// booleans corerced to string...
	if(selected == "true") {

		elem.style["background-color"] = "transparent";
		num_tabs_to_move -= 1;
		elem.setAttribute("selected", false); 
	}
	else {

		elem.style["background-color"] = "#C5ECFC";
		num_tabs_to_move += 1;
		elem.setAttribute("selected", true);
	}

	// update button display with new count
	button.innerHTML = "Move Selected Tabs (" + num_tabs_to_move + ")";

}

// Extract useful info and add additional attributes
// Reduce a huge tab object - good?
function processTabs(tabs) {

	cur_tabs.length = cur_tab_count;
	//console.log(cur_tabs.length);
	tabs.forEach(function(t) {

		var ct = {
			"id": t.id,
			"title": t.title,
			"index": t.index,
			"favIconUrl": t.favIconUrl,
			"selected": false
		}
		cur_tabs.push(ct);
	});
	
}


/* Construct the popup UI with a list of tabs */
// extract favicon, title, (url) to display and create tab objects UI
function generateUI(tabs) {

    var tabs_UI_elems = [];

    // combine the next two to only one function?
    tabs.forEach(function(t) {
        tabs_UI_elems.push(genElemUI(t));
    });

    tabs_UI_elems.forEach(function(elem) {
        wrapper.appendChild(elem);
    });
}

/* Construct a single UI representation of tab - favicon and title are displayed */
function genElemUI(tab) {

	// to be appended to wrapper
	var elem = document.createElement("span");

    elem.setAttribute("data-id", tab.id);
    elem.setAttribute("data-index", tab.index);
    elem.setAttribute("data-title", tab.title);
	elem.setAttribute("data-favIconURL", tab.favIconUrl);
	elem.setAttribute("selected", tab.selected);
	
	var img = ""; // construct the favicon with constant size
	var dimension = "width=\'24px\' height=\'24px\'>";;
	if(tab.title == "New Tab" || tab.favIconUrl == undefined || tab.favIconUrl == "")
		img = "<img src = \'file_favicon.ico\'" + dimension; // default favicon
	else
		img = "<img src = \'" + tab.favIconUrl + "\'" + dimension;
    
    var text = img + "<body>" + tab.title + "</body>";
    // console.log(text);
    elem.innerHTML = text;

    return elem;
}

function createTabsList() {

    chrome.tabs.query({"currentWindow": true}, function(tabs) {

		cur_tab_count = tabs.length;
		processTabs(tabs); // construct cur_tabs
        generateUI(cur_tabs);

        wrapper.style.width = wrapper.clientWidth + "px";

	});
	console.log("ho");
}

(function() {

	wrapper = document.getElementById("wrapper");
	createTabsList();
	
	// to set selected state and highlight for tab objects
	wrapper.addEventListener("click", function(event) {
		triggerClick(event.target);
	});

	button = document.getElementById("moveButton");
	document.getElementById("moveButton").addEventListener("click", executeButton);
	

})();
