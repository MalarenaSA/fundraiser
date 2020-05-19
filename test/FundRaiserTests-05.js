"use strict";
//* global web3 */
/**
 * FundRaiser - Test Scripts 05
 * Covers Voting
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("05 - Voting", async(accounts) => {

  it("Standard Vote and hasVoted true check", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    let hasVoted = await instance.hasVoted(0, bob);
    assert.equal(hasVoted, true);

    let requestDetails = await instance.requests(0);
    assert.equal(requestDetails.numberOfVoters, 1);
  });

  it("Vote for multiple requests", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request0 = await instance.createRequest("Request 0", "8000", alice, {from: alice});
    assert.equal(request0.logs[0].event, "RequestCreated");

    let request1 = await instance.createRequest("Request 1", "4000", alice, {from: alice});
    assert.equal(request1.logs[0].event, "RequestCreated");

    let vote0 = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote0.logs[0].event, "Vote");
    
    let hasVoted0 = await instance.hasVoted(0, bob);
    assert.equal(hasVoted0, true);

    let vote1 = await instance.voteForRequest(1, {from: bob});
    assert.equal(vote1.logs[0].event, "Vote");
    
    let hasVoted1 = await instance.hasVoted(0, bob);
    assert.equal(hasVoted1, true);
  });

  // it ("Vote before goal reached should fail", async() => {});
  /**
   * Technically there should be a test to ensure a vote cannot be made before the
   * goal is reached. However, as you cannot create a spending request before the goal is 
   * reached then this situation would never be reached
   */

  it ("Vote for non-existent request should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    try {
      await instance.voteForRequest(1, {from: bob});
      assert.fail("Vote for non-existent spending request not allowed. Vote should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request does not exist"), "Message: " + err);
    }
  });

  it ("Vote for completed request should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    let paymentRelease = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease.logs[0].event, "PaymentReleased");

    try {
      await instance.voteForRequest(0, {from: bob});
      assert.fail("Vote for completed spending request not allowed. Vote should fail");
    } catch (err) {
      assert(err.toString().includes("Request already completed"), "Message: " + err);
    }
  });

  it ("Vote for request by non-contributor should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    try {
      await instance.voteForRequest(0, {from: peter});
      assert.fail("Vote for request by non-contributor not allowed. Vote should fail");
    } catch (err) {
      assert(err.toString().includes("No contribution from Caller"), "Message: " + err);
    }
  });

  it ("Repeated Vote for same request should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    try {
      await instance.voteForRequest(0, {from: bob});
      assert.fail("Repeated Vote for same request not allowed. Vote should fail");
    } catch (err) {
      assert(err.toString().includes("Caller already voted"), "Message: " + err);
    }
  });

  it("hasVoted false check", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let hasVoted = await instance.hasVoted(0, bob);
    assert.equal(hasVoted, false);
  });

  it ("hasVoted check for non-existent request should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 0", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    try {
      await instance.hasVoted(1, bob);
      assert.fail("hasVoted check for non-existent spending request not allowed. Check should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request does not exist"), "Message: " + err);
    }
  });
});