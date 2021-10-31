const assert = require("assert");
const config = require("../../config/keys");

//tests in mocha are built in a describe and it format
//the describe gets a string that tells what the test does and a callback
//the it also describes the conditions of the test and runs the test in the callback

describe("Testing the config file", ()=>{
    it("should return an object of the configurations", async ()=>{
        assert.strictEqual("object", typeof config);
    });
});