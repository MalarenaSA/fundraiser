"use strict";
//* global web3 */
/**
 * FundRaiser - Test Scripts 04
 * Covers Spending Requests
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("04 - Spending Requests", async(accounts) => {

  it("Standard Single Spending Request", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let requestDetails = await instance.requests(0);
    assert.equal(requestDetails.description, "Request 0");
    assert.equal(requestDetails.value, 10000);
    assert.equal(requestDetails.recipient, alice);
    assert.equal(requestDetails.completed, false);
    assert.equal(requestDetails.numberOfVoters, 0);

    let totalRequests = await instance.totalRequests();
    assert.equal(totalRequests, 1);
  });

  it("Multiple Spending Requests", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "8000", alice, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let requestDetails0 = await instance.requests(0);
    assert.equal(requestDetails0.description, "Request 0");
    assert.equal(requestDetails0.value, 8000);
    assert.equal(requestDetails0.recipient, alice);
    assert.equal(requestDetails0.completed, false);
    assert.equal(requestDetails0.numberOfVoters, 0);

    let totalRequests = await instance.totalRequests();
    assert.equal(totalRequests, 1);

    let request1 = await instance.createRequest("Request 1", "4000", alice, {from: alice});
    assert.equal(request1.logs[0].event, "RequestCreated");

    let requestDetails1 = await instance.requests(1);
    assert.equal(requestDetails1.description, "Request 1");
    assert.equal(requestDetails1.value, 4000);
    assert.equal(requestDetails1.recipient, alice);
    assert.equal(requestDetails1.completed, false);
    assert.equal(requestDetails1.numberOfVoters, 0);

    totalRequests = await instance.totalRequests();
    assert.equal(totalRequests, 2);
  });

  it("Spending Request to different recipient", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", peter, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let requestDetails = await instance.requests(0);
    assert.equal(requestDetails.description, "Request 0");
    assert.equal(requestDetails.value, 10000);
    assert.equal(requestDetails.recipient, peter);
    assert.equal(requestDetails.completed, false);
    assert.equal(requestDetails.numberOfVoters, 0);

    let totalRequests = await instance.totalRequests();
    assert.equal(totalRequests, 1);
  });

  it ("Spending Request from non-owner should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 0", "10000", alice, {from: bob});
      assert.fail("Spending Request from non-owner not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Caller is not the contract owner"), "Message: " + err);
    }
  });
  
  it ("Spending Request of zero value should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 0", "0", alice, {from: alice});
      assert.fail("Spending Request of zero value not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request value cannot be zero"), "Message: " + err);
    }
  });

  it ("Spending Request before goal reached should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 4000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 0", "1000", alice, {from: alice});
      assert.fail("Spending Request when Amount Raised is less than Goal is not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Amount Raised is less than Goal"), "Message: " + err);
    }
  });

  // it ("Spending Request value above amount raised should fail", async() => {
  /**
   * Technically there should be a test to ensure the Spending Request value cannot be above
   * the amount raised. However, as you cannot create a spending request above the total
   * amount available (see next test) then total raised would never be greater than total
   * available, so this situation would never be reached
   */

  it ("Spending Request value above amount available should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "6000", alice, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let vote0 = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote0.logs[0].event, "Vote");

    let paymentRelease0 = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease0.logs[0].event, "PaymentReleased");
    
    try {
      await instance.createRequest("Request 1", "5000", alice, {from: alice});
      assert.fail("Spending Request above amount available not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request value greater than amount available"), "Message: " + err);
    }
  });

  it ("Spending Request recipient of address zero should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 0", "10000", "0x0000000000000000000000000000000000000000", {from: alice});
      assert.fail("Spending Request recipient of address zero not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Invalid Recipient of address zero"), "Message: " + err);
    }
  });

});