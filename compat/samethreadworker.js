function SameThreadWorker(scriptAddress, name) {
  var name = name || "worker";
  var location = { href: scriptAddress };
  var onmessage = function() {};
  var postMessage;

  function run(code) {
    var run = undefined;
    var scriptAddress = undefined;
    eval(code);
  }
  function importScripts() {
    Array.apply(null, arguments).forEach(function(url) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send();
      if (xhr.status !== 200) {
        throw Error(xhr.status + " " + xhr.statusText + ": " + url);
      }
      var code = xhr.responseText;
      run(code);
    });
  }
  
  var queue = [];
  var processing = false;
  function process() {
    if (processing) {
      return;
    }
    processing = true;
    while (queue.length) {
      queue.shift()();
    }
    processing = false;
  }

  var workerListener;
  postMessage = function(message) {
    queue.push(function() { workerListener && workerListener({ data: message }); });
    process();
  }
  importScripts(scriptAddress);

  var worker = {};
  function logError(e) { console.error("thrown from "+ name +": "+ e); };
  function catchExceptions(func) {
    return function() { try { func(); } catch(e) { logError(e); } };
  };
  worker.postMessage = function(msg) {
    queue.push(catchExceptions(function() { onmessage({ data:msg }); }));
    process();
  };

  Object.defineProperty(worker, 'onmessage', {
    get: function() { return workerListener; },
    set: function(func) { workerListener = func; process(); },
  });
  worker.terminate = function() {};
  worker.start = process;

  return worker;
}

