"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 07
 * Covers SafeMath & ChangeRequestCountMax Functions
 * NOTE: These tests require the Test Functions section from FundRaiser.sol to be
 * un-commented in order to expose the additional internal functions
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");
const BN = web3.utils.BN;

contract("07 - SafeMath & ChangeRequestCountMax Functions", async(accounts) => {

  it("Standard addition", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    
    let result = await instance.testAdd(2, 3);
    assert.equal(result.valueOf(), 5);
  });

  it("Addition overflow should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let maxUINT256 = new BN("2").pow(new BN("256")).sub(new BN("1"));

    try {
      await instance.testAdd(maxUINT256, 1);
      assert.fail("Overflow not allowed. Addition should fail!");
    } catch (err) {
      assert(err.toString().includes("SafeMath: addition overflow"), "Message: " + err);
    }
  });

  it("Standard subtraction", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");

    let result = await instance.testSub(5, 3);
    assert.equal(result.valueOf(), 2);
  });

  it("Subtraction resulting in negative number should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");

    try {
      await instance.testSub(1, 2);
      assert.fail("Subtraction to negative value not allowed. Subtraction should fail!");
    } catch (err) {
      assert(err.toString().includes("SafeMath: subtraction overflow"), "Message: " + err);
    }
  });

  it ("Standard Change RequestCountMax", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");

    let newrequestCountMax = await instance.changeRequestCountMax(50);
    assert.equal(newrequestCountMax.logs[0].event, "RequestCountMaxChanged");

    let requestCountMax = await instance.requestCountMax();
    assert.equal(requestCountMax, 50);
  });

  it("Change RequestCountMax to 0 should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");

    try {
      await instance.changeRequestCountMax(0);
      assert.fail("Change RequestCountMax to 0 not allowed. Change should fail");
    } catch (err) {
      assert(err.toString().includes("Request Count limit cannot be less than zero"), "Message: " + err);
    }
  });

  it("Change RequestCountMax to less than TotalRequests should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "5000", alice, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let request1 = await instance.createRequest("Request 1", "5000", alice, {from: alice});
    assert.equal(request1.logs[0].event, "RequestCreated");

    let totalRequests = await instance.totalRequests();
    assert.equal(totalRequests, 2);

    let newrequestCountMax = await instance.changeRequestCountMax(2);
    assert.equal(newrequestCountMax.logs[0].event, "RequestCountMaxChanged");

    try {
      await instance.changeRequestCountMax(1);
      assert.fail("Change RequestCountMax to less than TotalRequests not allowed. Change should fail");
    } catch (err) {
      assert(err.toString().includes("Request Count limit cannot be less than Total Current Requests"), "Message: " + err);
    }
  });


  it("Create Request beyond RequestCountMax should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "5000", alice, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let newrequestCountMax = await instance.changeRequestCountMax(1);
    assert.equal(newrequestCountMax.logs[0].event, "RequestCountMaxChanged");

    try {
      await instance.createRequest("Request 1", "5000", alice, {from: alice});
      assert.fail("Spending Request beyond RequestCountMax not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Spending Request Count limit reached"), "Message: " + err);
    }
  });

});
