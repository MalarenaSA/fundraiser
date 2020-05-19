"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 01
 * Covers Contract Set-up & Admin Functions
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("01 - Contract Set-up and Admin functions", async(accounts) => {
  
  it("Deadline set", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");
    let currentBlockNumber = await web3.eth.getBlockNumber();

    let deadline = await instance.deadline();
    assert.equal(deadline, currentBlockNumber + 100);
  });

  it("Initial Payment Deadline set", async() => {
    let instance = await FundRaiser.new("100", "50", "10000000000000000000", "1000000000000000000");
    let currentBlockNumber = await web3.eth.getBlockNumber();

    let initialPaymentDeadline = await instance.initialPaymentDeadline();
    assert.equal(initialPaymentDeadline, currentBlockNumber + 150);
  });

  it("Goal set", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    let goal = await instance.goal();
    assert.equal(goal, 10000000000000000000);
  });

  it("Minimum contribution set", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    let minimumContribution = await instance.minimumContribution();
    assert.equal(minimumContribution, 1000000000000000000);
  });

  it("Owner set", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    let owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  it("RequestCountMax set", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    let requestCountMax = await instance.requestCountMax();
    assert.equal(requestCountMax, 100);
  });

  it("Contract does not allow fallback", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    try {
      await instance.sendTransaction("123");
      assert.fail("Contract does not allow Fallback. Transaction should fail!");
    } catch (err) {
      assert(err.toString().includes("revert"), "Message: " + err);
    }
  });

  it("Change ownership", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    let newOwner = await instance.changeOwner(accounts[1], {from: accounts[0]});
    assert.equal(newOwner.logs[0].event, "OwnerChanged");

    let owner = await instance.owner();
    assert.equal(owner, accounts[1]);
  });

  it("Change ownership by non-owner should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    try {
      await instance.changeOwner(accounts[1], {from: accounts[1]});
      assert.fail("Ownership change by non-owner not allowed. Change should fail");
    } catch (err) {
      assert(err.toString().includes("Caller is not the contract owner"), "Message: " + err);
    }
  });

  it("Change ownership to address zero should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000000000000000000", "1000000000000000000");

    try {
      await instance.changeOwner("0x0000000000000000000000000000000000000000", {from: accounts[0]});
      assert.fail("Ownership change to address zero not allowed. Change should fail");
    } catch (err) {
      assert(err.toString().includes("Invalid Owner change to address zero"), "Message: " + err);
    }
  });

});