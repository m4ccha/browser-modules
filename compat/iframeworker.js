var IFrameWorker = (function() {
  var nextId = 0;
  var uninitializedChannels = {};

  var constructor = function(scriptAddress, name) {
    var queue = [];
    var dom = document.createElement("worker");

    var channel = {};
    channel.src = scriptAddress;
    channel.output = function(message) {
      var evt = new CustomEvent("message", { detail: message });
      dom.dispatchEvent(evt);
    };
    channel.input = function() {
      var retVal = queue;
      queue = [];
      return retVal;
    };

    var worker = {};
    worker.postMessage = function(message) {
      queue.push({ data: message });
    };
    worker.onmessage = function() {};
    worker.terminate = function() {
      dom.removeEventListener("message", messageListener, false)
      document.body.removeChild(dom);
      document.body.removeChild(iframe);
      queue.push("terminate");
    };

    function messageListener(evt) {
      worker.onmessage(evt.detail);
    }
    document.body.appendChild(dom);
    dom.addEventListener("message", messageListener, false);

    var id = nextId++;
    uninitializedChannels[id] = channel;
    var iframe = document.createElement("iframe");
    iframe.src = "compat/iframeworker.html?id="+ id;
    iframe.border = 0;
    iframe.width = 1;
    iframe.height = 1;
    iframe.style.visibility = "hidden";
    iframe.style.height = "1px";
    iframe.style.width = "1px";
    document.body.appendChild(iframe);

    return worker;
  };

  constructor.get = function(id) {
    var channel = uninitializedChannels[id];
    if (!channel) {
      throw new Error("channel of id "+ id +
          " already initialized or channel not found");
    }
    delete uninitializedChannels[id];
    return channel;
  };

  return constructor;
})();

