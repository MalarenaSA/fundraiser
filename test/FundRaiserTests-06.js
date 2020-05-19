"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 06
 * Covers Payment Release
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");
const BN = web3.utils.BN;

contract("06 - Payment Release", async(accounts) => {

  it("Standard Payment Release", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 01", "10000", peter, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    let peterBalanceBefore = new BN(await web3.eth.getBalance(peter));

    let paymentRelease = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease.logs[0].event, "PaymentReleased");

    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 0);

    let peterBalanceAfter = new BN(await web3.eth.getBalance(peter));
    assert.equal(peterBalanceAfter.sub(peterBalanceBefore).toString(10), 10000);

    let amountPaidOut = await instance.amountPaidOut();
    assert.equal(amountPaidOut, 10000);

    let requestDetails = await instance.requests(0);
    assert.equal(requestDetails.completed, true);
  });

  it("Multiple Payment Releases", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "5000", peter, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let request1 = await instance.createRequest("Request 1", "4000", peter, {from: alice});
    assert.equal(request1.logs[0].event, "RequestCreated");

    let vote0 = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote0.logs[0].event, "Vote");

    let vote1 = await instance.voteForRequest(1, {from: bob});
    assert.equal(vote1.logs[0].event, "Vote");
    
    let peterBalanceBefore = new BN(await web3.eth.getBalance(peter));

    let paymentRelease0 = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease0.logs[0].event, "PaymentReleased");

    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 5000);

    let amountPaidOut = await instance.amountPaidOut();
    assert.equal(amountPaidOut, 5000);

    let paymentRelease1 = await instance.releasePayment(1, {from: alice});
    assert.equal(paymentRelease1.logs[0].event, "PaymentReleased");

    contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 1000);

    amountPaidOut = await instance.amountPaidOut();
    assert.equal(amountPaidOut, 9000);

    let peterBalanceAfter = new BN(await web3.eth.getBalance(peter));
    assert.equal(peterBalanceAfter.sub(peterBalanceBefore).toString(10), 9000);

    let requestDetails0 = await instance.requests(0);
    assert.equal(requestDetails0.completed, true);

    let requestDetails1 = await instance.requests(0);
    assert.equal(requestDetails1.completed, true);
  });

  it ("Payment Release from non-owner should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", peter, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    try {
      await instance.releasePayment(0, {from: bob});
      assert.fail("Payment Release from non-owner not allowed. Payment should fail");
    } catch (err) {
      assert(err.toString().includes("Caller is not the contract owner"), "Message: " + err);
    }
  });

  // it ("Payment Release before goal reached should fail", async() => {});
  /**
   * Technically there should be a test to ensure the payment is not released before the
   * goal is reached. However, as you cannot create a spending request before the goal is 
   * reached then this situation would never be reached
   */  

  it ("Payment Release for non-existent request should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", peter, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    try {
      await instance.releasePayment(1, {from: alice});
      assert.fail("Payment Release for non-existent spending request not allowed. Payment should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request does not exist"), "Message: " + err);
    }
  });

  it ("Payment Release for completed request should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", peter, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    let paymentRelease = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease.logs[0].event, "PaymentReleased");

    try {
      await instance.releasePayment(0, {from: alice});
      assert.fail("Payment Release for completed spending request not allowed. Payment should fail");
    } catch (err) {
      assert(err.toString().includes("Request already completed"), "Message: " + err);
    }
  });

  it ("Payment Release for request without majority vote should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contributionBob = await instance.contribute({from: bob, value: 5000});
    assert.equal(contributionBob.logs[0].event, "Contribution");

    let contributionPeter = await instance.contribute({from: peter, value: 5000});
    assert.equal(contributionPeter.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    try {
      await instance.releasePayment(0, {from: alice});
      assert.fail("Payment Release for request without majority vote not allowed. Payment should fail");
    } catch (err) {
      assert(err.toString().includes("Less than a majority voted"), "Message: " + err);
    }
  });

  it ("Payment Release above amount available should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "8000", peter, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let request1 = await instance.createRequest("Request 1", "4000", peter, {from: alice});
    assert.equal(request1.logs[0].event, "RequestCreated");

    let vote0 = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote0.logs[0].event, "Vote");

    let vote1 = await instance.voteForRequest(1, {from: bob});
    assert.equal(vote1.logs[0].event, "Vote");

    let paymentRelease0 = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease0.logs[0].event, "PaymentReleased");

    try {
      await instance.releasePayment(1, {from: alice});
      assert.fail("Payment Release above amount available not allowed. Payment should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request value greater than amount available"), "Message: " + err);
    }
  });

});