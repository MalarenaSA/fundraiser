"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 02
 * Covers Contributions
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("02 - Contributions", async(accounts) => {

  it("Standard Single Contribution", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 1000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 1000);

    let totalContributors = await instance.totalContributors();
    assert.equal(totalContributors, 1);

    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 1000);

    let amountRaised = await instance.amountRaised();
    assert.equal(amountRaised, 1000);
  });

  it("Multiple Contributions from same account", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let bob = accounts[1];

    let contribution01 = await instance.contribute({from: bob, value: 1000});
    assert.equal(contribution01.logs[0].event, "Contribution");

    let contribution02 = await instance.contribute({from: bob, value: 1000});
    assert.equal(contribution02.logs[0].event, "Contribution");
    
    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 2000);

    let totalContributors = await instance.totalContributors();
    assert.equal(totalContributors, 1);

    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 2000);

    let amountRaised = await instance.amountRaised();
    assert.equal(amountRaised, 2000);
  });

  it("Multiple Contributions from multiple accounts passed goal", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let bob = accounts[1];
    let peter = accounts[2];

    let contributionBob = await instance.contribute({from: bob, value: 8000});
    assert.equal(contributionBob.logs[0].event, "Contribution");

    let contributionPeter = await instance.contribute({from: peter, value: 4000});
    assert.equal(contributionPeter.logs[0].event, "Contribution");
    
    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 12000);

    let totalContributors = await instance.totalContributors();
    assert.equal(totalContributors, 2);

    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 8000);

    let peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 4000);

    let amountRaised = await instance.amountRaised();
    assert.equal(amountRaised, 12000);
  });

  it("Contribution below minimum level should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
    let bob = accounts[1];

    try {
      await instance.contribute({from: bob, value: 100});
      assert.fail("Contribution below minimum level not allowed. Contribution should fail");
    } catch (err) {
      assert(err.toString().includes("Minimum Contribution level not met"), "Message: " + err);
    }    
  });

  it("Contribution after deadline should fail", async() => {
    let instance = await FundRaiser.new("2", "10", "10000", "1000");
    let bob = accounts[1];

    let contribution01 = await instance.contribute({from: bob, value: 1000});
    assert.equal(contribution01.logs[0].event, "Contribution");

    let contribution02 = await instance.contribute({from: bob, value: 1000});
    assert.equal(contribution02.logs[0].event, "Contribution");
    
    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 2000);

    try {
      await instance.contribute({from: bob, value: 1000});
      assert.fail("Contributions after deadline not allowed. Contribution should fail");
    } catch (err) {
      assert(err.toString().includes("Deadline is passed"), "Message: " + err);
    }
  });

});