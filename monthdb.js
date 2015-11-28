    var woosMonthly = {};
    window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
                    window.mozIndexedDB;

    woosMonthly.indexedDB = {};
    woosMonthly.indexedDB.db = null;

    window.addEventListener("DOMContentLoaded", init, false);

    window.addEventListener('DOMContentLoaded', function () {
      document.getElementById("newMonthly").addEventListener("click", addMonthly, false);
    });

    woosMonthly.indexedDB.onerror = function(e) {
      console.log(e);
    };

    woosMonthly.indexedDB.open = function() {
      //console.log("opened");

      var version = 2;
      var request = indexedDB.open("monthlys", version);

      //console.log("db opening");

      // We can only create Object stores in a versionchange transaction.
      request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = woosMonthly.indexedDB.onerror;

        if(db.objectStoreNames.contains("monthly")) {
          db.deleteObjectStore("monthly");
        }

        var store = db.createObjectStore("monthly",
          {keyPath: "timeStamp"});

        console.log("db created");
      };

      request.onsuccess = function(e) {
        woosMonthly.indexedDB.db = e.target.result;
        woosMonthly.indexedDB.getAllMonthlyItems();
        console.log("success");
      };

      request.onerror = woosMonthly.indexedDB.onerror;
    };

    woosMonthly.indexedDB.addMonthly = function(monthlyText) {
      console.log(monthlyText+"fxn");

      var db = woosMonthly.indexedDB.db;
      var trans = db.transaction(["monthly"], "readwrite");
      var store = trans.objectStore("monthly");

      var data = {
        "text": monthlyText,
        "timeStamp": new Date().getTime()
      }

      var request = store.put(data);

      request.onsuccess = function(e) {
        woosMonthly.indexedDB.getAllMonthlyItems();
        console.log("add to DB success");
      };

      request.onerror = function(e) {
        console.log("Error Adding: ", e);
      };
    };

    woosMonthly.indexedDB.deleteMonthly = function(id) {
      var db = woosMonthly.indexedDB.db;
      var trans = db.transaction(["monthly"], "readwrite");
      var store = trans.objectStore("monthly");

      var request = store.delete(id);

      request.onsuccess = function(e) {
        woosMonthly.indexedDB.getAllMonthlyItems();
      };

      request.onerror = function(e) {
        console.log("Error Adding: ", e);
      };
    };

    woosMonthly.indexedDB.getAllMonthlyItems = function() {
      console.log("at all items");
      var monthlys = document.getElementById("monthlyItems");
      monthlys.innerHTML = "";

      var db = woosMonthly.indexedDB.db;
      var trans = db.transaction(["monthly"], "readwrite");
      var store = trans.objectStore("monthly");

      // Get everything in the store;
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);

      cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false)
          return;

        renderMonthly(result.value);
        result.continue();
      };

      cursorRequest.onerror = woosMonthly.indexedDB.onerror;
    };

    function renderMonthly(row) {
      var monthlys = document.getElementById("monthlyItems");
      var li = document.createElement("li");
      var a = document.createElement("a");
      var t = document.createTextNode(row.text);
      var s = document.createElement("span");

      console.log("at render");

      a.addEventListener("click", function() {
        woosMonthly.indexedDB.deleteMonthly(row.timeStamp);
      }, false);

      a.href = "#";
      //a.className = "glyphicon glyphicon-minus red";
      s.className = "glyphicon glyphicon-minus red";
      a.appendChild(s);

      //a.textContent = " [Delete]";
      li.appendChild(t);
      li.appendChild(a);
      monthlys.appendChild(li);
    }

    function addMonthly() {
      console.log("clicked");
      var monthly = document.getElementById("monthly");
      console.log(monthly.value);
      woosMonthly.indexedDB.addMonthly(monthly.value);
      monthly.value = "";
    }

    function init() {
      woosMonthly.indexedDB.open();
    }