console.log("popup is run");

// have listeners to update existed tabs?
// when fired, present all tabs in current window in a drop down menu
// - click to select (multi)
// - button(trigger a function/callback in background for the actual work) to move the tabs to new window


// this is a copy from https://github.com/ardcore/chrome-better-bookmark
// not used directly, but for inspiration and template to learn setting up .js UI elements and events
var categoryNodes = [];
var wrapper;
var focusedElement;
//var fuzzySearch;
var currentNodeCount = 0;

var DOWN_KEYCODE = 40;
var UP_KEYCODE = 38;
var CONFIRM_KEYCODE = 13;

function filterRecursively(nodeArray, childrenProperty, filterFn, results) {

  results = results || [];

  nodeArray.forEach( function( node ) {
    if (filterFn(node)) results.push( node );
    if (node.children) filterRecursively(node.children, childrenProperty, filterFn, results);
  });

  return results;

};

function createUiElement(node) {

  var el = document.createElement("span");
  el.setAttribute("data-id", node.id);
  el.setAttribute("data-count", node.children.length);
  el.setAttribute("data-title", node.title);
  el.innerHTML = node.title;

  return el;

}

function triggerClick(element) {

  var categoryId = element.getAttribute("data-id");
  var newCategoryTitle;

  if (categoryId == "NEW") {

    newCategoryTitle = element.getAttribute("data-title");

    chrome.bookmarks.create({
      title: newCategoryTitle
    }, function(res) {
      processBookmark(res.id);
    })

  } else {

    processBookmark(categoryId);

  }

}

function processBookmark(categoryId) {

  getCurrentUrlData(function(url, title) {

    if (title && categoryId && url) {
      addBookmarkToCategory(categoryId, title, url);
      window.close();
    }

  });

}

function addBookmarkToCategory(categoryId, title, url) {

  chrome.bookmarks.create({
    'parentId': categoryId,
    'title': title,
    'url': url
  });

}

function getCurrentUrlData(callbackFn) {

  chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
    callbackFn(tabs[0].url, tabs[0].title)
  });

}

function createUiFromNodes( categoryNodes ) {

  var categoryUiElements = [];
  currentNodeCount = categoryNodes.length;

  categoryNodes.forEach( function( node ) {
    categoryUiElements.push( createUiElement(node) );
  })

  categoryUiElements.forEach( function( element ) {
    wrapper.appendChild( element );
  });

};

function resetUi() {

  wrapper.innerHTML = "";

};

function focusItem(index) {

  if (focusedElement) focusedElement.classList.remove("focus");
  focusedElement = wrapper.childNodes[index];
  focusedElement.classList.add("focus");

  focusedElement.scrollIntoView(false);

}

function addCreateCategoryButton(categoryName) {

  var el = document.createElement("span");
  el.setAttribute("data-id", "NEW");
  el.setAttribute("data-title", categoryName);
  el.classList.add("create");
  el.innerHTML = chrome.i18n.getMessage("new") + ": " + categoryName;

  wrapper.appendChild(el);
  currentNodeCount = currentNodeCount + 1;

}

function createInitialTree() {

  chrome.bookmarks.getTree( function(t) {

    wrapper = document.getElementById("wrapper");

    var options = {
      keys: ['title'],
      threshold: 0.4
    }
    
    categoryNodes = filterRecursively(t, "children", function(node) {
      return !node.url && node.id > 0;
    }).sort(function(a, b) {
      return b.dateGroupModified - a.dateGroupModified;
    })

    createUiFromNodes( categoryNodes );

    wrapper.style.width = wrapper.clientWidth + "px";

    if (currentNodeCount > 0) focusItem(0);

    //fuzzySearch = new Fuse(categoryNodes, options);

    wrapper.addEventListener("click", function(e) {
      triggerClick(e.target);
    })

  });

}

var wrapper;
var cur_tabs = []; // sort by tab index
var cur_tab_count = 0;

function generate_UI(cur_tabs) {

    var tabs_UI_elems = [];
    cur_tab_count = cur_tabs.length;

    // combine the next two to only one function?
    cur_tabs.forEach(function(t) {
        tabs_UI_elems.push(gen_UI_elem(t));
    });

    tabs_UI_elems.forEach(function(elem) {
        wrapper.appendChild(elem);
    });
}

function gen_UI_elem(tab) {

    var elem = document.createElement("span");
    elem.setAttribute("data-id", tab.id);
    elem.setAttribute("data-index", tab.index);
    elem.setAttribute("data-title", tab.title);
    elem.setAttribute("data-favIconURL", tab.favIconUrl);
    
    // construct the favicon with constant size
    // @@need to have a default icon
    var img = "<img src = \'" + tab.favIconUrl + "\' width=\'32px\' height=\'32px\'>";
    var text = img + "<body>" + tab.title + "</body>";
    console.log(text);
    elem.innerHTML = text;

    return elem;
}

function create_tabs_list() {

    chrome.tabs.query({"currentWindow": true}, function(tabs) {

        wrapper = document.getElementById("wrapper");

        // create tab objects...
        // extract favicon, title, url to display 
        generate_UI(tabs);

        // (hover), selectable


        wrapper.style.width = wrapper.clientWidth + "px";

        // button to execute
    });
}

(function() {


    create_tabs_list();
})();
