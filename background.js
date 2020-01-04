// This is a background script, listed in the manifest


chrome.runtime.onConnect.addListener(function(port) {

    console.assert(port.name == "portatoe");
    console.log("port connection established");

    port.onMessage.addListener(function(msg) {
        console.log("received message!!!");
        move_to_new_window(msg.ids);
    });
});



// Move the selected tabs to a new window
function move_to_new_window(ids) {

    chrome.windows.create({}, function(window) {

        var new_wind_id = window.id;
        var empty_tab_id = window.tabs[0].id;
        // console.log("empty tab id: ", empty_tab_id);
		
		//chrome.tabs.update(empty_tab_id, {"url": "https://www.google.com/"}, function(ignore){});

        // append each tab to last index
        chrome.tabs.move(ids, {"index": -1, "windowId": new_wind_id}, function(){
			
			console.log("inside move");
            //after inserted all tabs, remove empty tab
            chrome.tabs.remove(empty_tab_id, function(){});
        });

    });
    
}

// NOT USED right now
// prototype: triggered by keyboard command
// next is to enable UI elements and click trigger
chrome.commands.onCommand.addListener(function(command) {
    if(command == "move-to-new-window") {
        console.log('moving...');

        // directly call move_to_new_window()

        chrome.tabs.query({"currentWindow": true}, function(tabs){
            
            var tabs_to_move = tabs;
            move_to_new_window(tabs_to_move);

            // var idx = tabs[1].id;
            // chrome.tabs.move(tabs[0].id, {"index": -1}, function(){
            //     console.log("index: ", idx, tabs[1].id);
            //     chrome.tabs.remove(tabs[1].id, function(){});
            // });
            
        });


    }
    // printHi();
    
});