// This is a background script, listed in the manifest



// first create a new window and move selected tabs to it
function move_to_new_window(tabs) {

    chrome.windows.create({}, function(window) {

        var new_wind_id = window.id;
        var empty_tab_id = window.tabs[0].id;
        console.log("empty tab id: ", empty_tab_id);

        // append each tab to last index
        chrome.tabs.move([tabs[0].id, tabs[1].id], {"index": -1, "windowId": new_wind_id}, function(){

            //after inserted all tabs, remove empty tab
            chrome.tabs.remove(empty_tab_id, function(){});

            // chrome.tabs.query({"windowId": window_id}, function(tabs) {

            //     tabs.forEach(function(t){
            //         console.log("tabs: ", t.id, t.title);
            //     });
            //     //chrome.tab.remove(tabs[0].id, function(){});
            // });
        });

    });

    
}

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