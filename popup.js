console.log("popup is run");

// have listeners to update existed tabs?
// when fired, present all tabs in current window in a drop down menu
// - click to select (multi)
// - button(trigger a function/callback in background for the actual work) to move the tabs to new window



// ---------------my code ------------------------

var wrapper; // the UI html holder
var cur_tabs = []; // sort by tab index for now
var cur_tab_count = 0;
var tabs_to_move = [];
var num_tabs_to_move = 0;
// tab object needs more attributes
// - selected or not (on/off)

// var counter = 0;
document.getElementById("moveButton").addEventListener("click", executeButton);

function executeButton() {

	// console.log("clickedddd");
	// counter += 1;
	// document.getElementById("moveButton").innerHTML = counter;

	// go thru all tabs and filter out the selected ones
	var tabs_id = [];
	wrapper.childNodes.forEach(function(t) {
		if(t.getAttribute("selected") == "true") {
			var id = parseInt(t.getAttribute("data-id"));
			tabs_id.push(id);
		}
	});

	if(tabs_id.length > 0) {
		move_to_new_window(tabs_id);
	}
	
}

function move_to_new_window(ids) {

    chrome.windows.create({}, function(window) {

        var new_wind_id = window.id;
        var empty_tab_id = window.tabs[0].id;
        console.log("empty tab id: ", empty_tab_id);

        // append each tab to last index
        chrome.tabs.move(ids, {"index": -1, "windowId": new_wind_id}, function(){

            //after inserted all tabs, remove empty tab
            chrome.tabs.remove(empty_tab_id, function(){});
        });

    });
    
}

function printHi() {
	console.log("Hiiii");
}

// tab object is clicked
function triggerClick(elem) {
	
	
	var selected = elem.getAttribute("selected");
	console.log(selected);
	console.log("clicked: ", elem.getAttribute("data-title"));

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

	// update button display
	var button = document.getElementById("moveButton");
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

        wrapper = document.getElementById("wrapper");
		
		// construct cur_tabs
		cur_tab_count = tabs.length;
		processTabs(tabs);
        
        // extract favicon, title, (url) to display and create tab objects UI
        generateUI(cur_tabs);

		// (hover style is done in HTML), selectable(style also change?)
		wrapper.addEventListener("click", function(event) {
			triggerClick(event.target);
		});


        wrapper.style.width = wrapper.clientWidth + "px";

        // button to execute
    });
}

(function() {


    createTabsList();
})();
