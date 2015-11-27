    var woosMonthly = {};
    window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
                    window.mozIndexedDB;

    woosMonthly.indexedDB = {};
    woosMonthly.indexedDB.db = null;

    window.addEventListener("DOMContentLoaded", init, false);

    //window.addEventListener('DOMContentLoaded', function () {
    //  document.getElementById("newitem").addEventListener("click", addTodo, false);
    //});

    woosMonthly.indexedDB.onerror = function(e) {
      console.log(e);
    };

    woosMonthly.indexedDB.open = function() {
      console.log("opened");

      var version = 2;
      var request = indexedDB.open("monthlys", version);

      console.log("db opening");

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
        woosMonthly.indexedDB.getAllTodoItems();
        console.log("success");
      };

      request.onerror = woosMonthly.indexedDB.onerror;
    };

    woosMonthly.indexedDB.addTodo = function(todoText) {
      console.log(todoText+"fxn");

      var db = woosMonthly.indexedDB.db;
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");

      var data = {
        "text": todoText,
        "timeStamp": new Date().getTime()
      }

      var request = store.put(data);

      request.onsuccess = function(e) {
        woosMonthly.indexedDB.getAllTodoItems();
        console.log("add to DB success");
      };

      request.onerror = function(e) {
        console.log("Error Adding: ", e);
      };
    };

    woosMonthly.indexedDB.deleteTodo = function(id) {
      var db = woosMonthly.indexedDB.db;
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");

      var request = store.delete(id);

      request.onsuccess = function(e) {
        woosMonthly.indexedDB.getAllTodoItems();
      };

      request.onerror = function(e) {
        console.log("Error Adding: ", e);
      };
    };

    woosMonthly.indexedDB.getAllTodoItems = function() {
      var todos = document.getElementById("todoItems");
      todos.innerHTML = "";

      var db = woosMonthly.indexedDB.db;
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");

      // Get everything in the store;
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);

      cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false)
          return;

        renderTodo(result.value);
        result.continue();
      };

      cursorRequest.onerror = woosMonthly.indexedDB.onerror;
    };

    function renderTodo(row) {
      var todos = document.getElementById("todoItems");
      var li = document.createElement("li");
      var a = document.createElement("a");
      var t = document.createTextNode(row.text);
      var s = document.createElement("span");

      a.addEventListener("click", function() {
        woosMonthly.indexedDB.deleteTodo(row.timeStamp);
      }, false);

      a.href = "#";
      //a.className = "glyphicon glyphicon-minus red";
      s.className = "glyphicon glyphicon-minus red";
      a.appendChild(s);

      //a.textContent = " [Delete]";
      li.appendChild(t);
      li.appendChild(a);
      todos.appendChild(li);
    }

    function addTodo() {
      console.log("clicked");
      var todo = document.getElementById("todo");
      console.log(todo.value);
      woosMonthly.indexedDB.addTodo(todo.value);
      todo.value = "";
    }

    function init() {
      woosMonthly.indexedDB.open();
    }