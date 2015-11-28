    /*  * * * * * * * * 
        GETTING DATE
    */

    var minutes = 1000 * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var years = days * 365;

    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    var d = new Date();
    var printD = monthNames[d.getMonth()] + " " + d.getDate() + ", " + (1900 + d.getYear());
    document.getElementById("date").innerHTML = printD;

    /*  * * * * * * * *
        Database functions
    */

    var woosToDo = {};
    window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
                    window.mozIndexedDB;

    woosToDo.indexedDB = {};
    woosToDo.indexedDB.db = null;

    window.addEventListener("DOMContentLoaded", init, false);

    window.addEventListener('DOMContentLoaded', function () {
      document.getElementById("newTodo").addEventListener("click", addTodo, false);
    });

    woosToDo.indexedDB.onerror = function(e) {
      console.log(e);
    };

    woosToDo.indexedDB.open = function() {
      //console.log("opened");

      var version = 2;
      var request = indexedDB.open("todos", version);

      //console.log("db opening");

      // We can only create Object stores in a versionchange transaction.
      request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = woosToDo.indexedDB.onerror;

        if(db.objectStoreNames.contains("todo")) {
          db.deleteObjectStore("todo");
        }

        var store = db.createObjectStore("todo",
          {keyPath: "timeStamp"});

        //console.log("db created");
      };

      request.onsuccess = function(e) {
        woosToDo.indexedDB.db = e.target.result;
        woosToDo.indexedDB.getAllTodoItems();
        console.log("success");
      };

      request.onerror = woosToDo.indexedDB.onerror;
    };

    woosToDo.indexedDB.addTodo = function(todoText) {
      //console.log(todoText+"fxn");

      var db = woosToDo.indexedDB.db;
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");

      var data = {
        "text": todoText,
        "timeStamp": new Date().getTime()
      }

      var request = store.put(data);

      request.onsuccess = function(e) {
        woosToDo.indexedDB.getAllTodoItems();
        //console.log("add to DB success");
      };

      request.onerror = function(e) {
        console.log("Error Adding: ", e);
      };
    };

    woosToDo.indexedDB.deleteTodo = function(id) {
      var db = woosToDo.indexedDB.db;
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");

      var request = store.delete(id);

      request.onsuccess = function(e) {
        woosToDo.indexedDB.getAllTodoItems();
      };

      request.onerror = function(e) {
        console.log("Error Adding: ", e);
      };
    };

    woosToDo.indexedDB.getAllTodoItems = function() {
      var todos = document.getElementById("todoItems");
      todos.innerHTML = "";

      var db = woosToDo.indexedDB.db;
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

      cursorRequest.onerror = woosToDo.indexedDB.onerror;
    };

    function renderTodo(row) {
      var todos = document.getElementById("todoItems");
      var li = document.createElement("li");
      var a = document.createElement("a");
      var t = document.createTextNode(row.text);
      var timediv = document.createElement("div");
      var s = document.createElement("span");

      a.addEventListener("click", function() {
        woosToDo.indexedDB.deleteTodo(row.timeStamp);
      }, false);


      timediv.className = "timediv";
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
      //console.log("clicked");
      var todo = document.getElementById("todo");
      console.log(todo.value);
      woosToDo.indexedDB.addTodo(todo.value);
      todo.value = "";
    }

    function init() {
      woosToDo.indexedDB.open();
    }
