'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  it("should have 'create' function available", function() {
    expect(typeof modularApp.create).toBe("function");
  });
  it("should have 'run' function available", function() {
    expect(typeof modularApp.run).toBe("function");
  });

  var app;
  it("should be able to create application", function() {
    app = modularApp.create("test");
    expect(app).not.toBeNull();
  });

  describe("after creating application", function() {
    it("should have 'postBackground' function available", function() {
      expect(typeof app.postBackground).toBe("function");
    });
    it("should have 'terminate' function available", function() {
      expect(typeof app.terminate).toBe("function");
    });
    it("should have 'name' prop of value passed when creating app", function() {
      expect(app.name).toBe("test");
    });
  });
});

