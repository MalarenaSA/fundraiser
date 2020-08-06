# FundRaiser
_A Fund-Raising Smart Contract used to raise funds, with payments then released based on contributors voting_
> Created by Malarena SA - [www.malarena.com](https://www.malarena.com)

## FundRaiser Smart Contract Overview
This Smart Contract provides the following functionality:
- The Fund Raiser deploys this smart contract with a set duration, an initial payment duration, a financial goal and a minimum contribution amount
- Contributors send Ether to this contract
- Once the goal is reached, the Fund Raiser issues one or more Spending Requests of a value up to the total amount contributed to identify what the contribution money will be spent on
- Contributors vote for the Spending Request(s)
- If the Spending Request receives votes from over 50% of the total contributors then the value requested can be released
- If the financial goal is not reached by the deadline, or if no payments are released by the initial payment deadline, the contributors can receive a refund of their contribution

### Durations and Deadlines
This Smart Contract calculates the contract deadline and initial payment deadline using durations defined in blocks. The current settings of Ethereum (mainnet and most testnets) is to create a new block roughly every 15 seconds, e.g. 1 hour = 240 blocks; 1 day = 5760 blocks; 1 week = 40320 blocks, etc.

## Smart Contract Deployment
The Smart Contract is best deployed using the "New Contract" option in the [ethfundraiser](https://www.ethfundraiser.xyz) dApp. However, it can also be compiled and deployed stand-alone using [Remix](https://remix.ethereum.org/) or [Truffle](https://www.trufflesuite.com/truffle).

## Smart Contract Example Deployments
Examples of this Smart Contract being deployed and funded and then payment requests created, voted for and released can be found at:
- Mainnet: [0x4E57b2CDdbdA32a2fe721e3ff53aed56B75C2e4d](https://etherscan.io/address/0x4e57b2cddbda32a2fe721e3ff53aed56b75c2e4d)
- Goerli Test Network: [0xD3A09B674D8Fd6C544e9b44f8e16837ECCB11D02](https://goerli.etherscan.io/address/0xd3a09b674d8fd6c544e9b44f8e16837eccb11d02)
- Rinkeby Test Network: [0x24515D10C6B42ebEC05C200Bd750352DF2a69150](https://rinkeby.etherscan.io/address/0x24515d10c6b42ebec05c200bd750352df2a69150)

## Smart Contract Tests, Coverage and MythX Reports
A full suite of Truffle tests have been developed for the FundRaiser Smart Contract under the \test sub-directory. To run these you will need to have [Truffle](https://www.trufflesuite.com/docs/truffle/overview) and [Ganache](https://www.trufflesuite.com/docs/ganache/overview) installed:
1) Edit the `\contracts\FundRaiser.sol` smart contract and un-comment the Test Functions section at the end of the contract (these are only used for testing purposes)
2) Open a terminal window/command prompt, change to the project directory and start a local test node using `ganache-cli`, or statup Ganache for Windows
3) From another terminal window/command prompt, change to the project directory and enter `npm run test`.  This will compile the contract and then run the test suite using the Ganache blockchain
4) The Smart Contract has also been tested using [Solidity-Coverage](https://www.npmjs.com/package/solidity-coverage) to confirm all functions are fully tested. To run the tests, ensure Solidity-Coverage is installed and configured and then from the terminal window/command prompt run `npm run coverage` which will produce the coverage reports in the \coverage directory
5) The Smart Contract has also been verified through [MythX](https://mythx.io/). To run the verification process, ensure MythX is installed and configured and then from the terminal window/command prompt set your MYTHX_API_KEY and then run `npm run verify` to run the verification process. MythX is also available as a plug-in to Remix if preferred
6) Finally, remember to edit the `\contracts\FundRaiser.sol` smart contract and re-comment the Test Functions section at the end of the contract.

## Project Directory Structure
```powershell
fundraiser
  ├── build                   # Created by Truffle to hold the compiled smart contracts
  ├── contracts               # Contains the smart contract source files
  ├── coverage                # Created by solidity-coverage to hold the coverage reports
  ├── migrations              # Used by Truffle to handle smart contract deployments
  ├── node_modules            # Created by NPM to hold all the Node Modules and dependencies
  ├── test                    # Contains the Truffle test scripts
  ├ ...                       # Various other configuration files used by the tools
```

## Smart Contract Configuration
The following documents the configuration of the `fundraiser.sol` smart contract:

### constructor
Constructor Function used to deploy contract.

|name |type |description
|-----|-----|-----------
|_duration|uint256|Duration of fund-raising part of Contract, in blocks
|_initialPaymentDuration|uint256|Period after _duration for owner to start releasing payments, in blocks
|_goal|uint256|Financial goal of the Smart Contract, in wei
|_minimumContribution|uint256|Minimum amount required for each contribution, in wei

During Deploy the Ethereum address used to deploy the Smart Contract is set as the "owner" and certain functions below can only be actioned by the owner.

### contribute
Process a Contribution.

_No parameters_  

Payable function that should be sent Ether. Requires that minimum contribution value is met and deadline is not passed.

### createRequest
Create a spending request.

|name |type |description
|-----|-----|-----------
|_description|string|A description of what the money will be spent on
|_value|uint256|The amount being spent with this spending request
|_recipient|address|The Ethereum address of where the money will be sent

Can only be actioned by the owner. Requires that the goal has been reached and the _value is not zero and does not exceed amountRaised or balance available on the contract. Also requires that _recipient is not address zero and requestCountMax has not been reached. Each spending request is stored sequentially starting from record 0.

### voteForRequest
Vote for a spending request.

|name |type |description
|-----|-----|-----------
|_index|uint256|Index Number of Spending Request to vote for

Requires that the caller made a contribution and has not already voted for the request. Also requires that the request exists and is not completed.

### hasVoted - view-only
View if account has voted for spending request.

|name |type |description
|-----|-----|-----------
|_index|uint256|Index Number of Spending Request to check
|_account|address|Address of Account to check

Requires that the request exists.

### releasePayment
Release the payment for a spending request.

|name |type |description
|-----|-----|-----------
|_index|uint256|Index Number of Spending Request to release payment

Can only be actioned by the owner. Requires that the request exists and is not completed, and that there are funds available to make the payment. Also requires that over 50% of the contributors voted for the request.

### getRefund
Process a Refund, including reversing any voting.

_No parameters_

Requires that the contribution exists, the deadline has passed and NO payments have been made. If the goal is reached then requires that initialPaymentDeadline has passed.

### changeOwner
Change the owner of the contract.

|name |type |description
|-----|-----|-----------
|_newOwner|address|Address of new contract owner

Can only be actioned by the current owner. Requires that _newOwner is not address zero.

## Other view-only functions
_No parameters_

- deadline - Deadline Block Number for fundraising campaign
- initialPaymentDeadline - Deadline Block Number for initial payment release to be approved and processed
- goal - Total amount needing to be raised, in wei
- minimumContribution - Minimum contribution value, in wei
- owner - Ethereum address of the Smart Contract owner
- totalContributors - Total number of contributors
- totalRequests - Total number of spending requests
- amountRaised - Total amount actually raised
- amountPaidOut - Total amount actually paid out
- requestCountMax - Max Count of Spending Requests, required to stop refund/remove voting loop from getting out of gas. Recommend 100 and never > 1000

### contributions - view-only
Total Contributions made per address.

|name |type |description
|-----|-----|-----------
||address|Address of Contributor

### requests - view-only
Spending Request Details, including description, value, recipient, completed flag and number of voters of each spending request record.

|name |type |description
|-----|-----|-----------
||uint256|Index Number of Spending Request


## Events

### Contribution
Confirmation of Contribution made.

|name |type |description
|-----|-----|-----------
|from|address|Address of contributor
|value|uint256|Value of contribution

### RequestCreated
Confirmation of Spending Request Created.

|name |type |description
|-----|-----|-----------
|from|address|Address of account creating request
|requestId|uint256|Index Number of Spending Request
|description|string|A description of what the money will be spent on
|value|uint256|The amount being spent with this spending request
|recipient|address|The Ethereum address of where the money will be sent

### Vote
Confirmation of Vote processed.

|name |type |description
|-----|-----|-----------
|from|address|Address of account that voted
|requestId|uint256|Index Number of Spending Request

### PaymentReleased
Confirmation of Spending Request Payment Released.

|name |type |description
|-----|-----|-----------
|from|address|Address of account releasing payment
|requestId|uint256|Index Number of Spending Request
|value|uint256|Value released
|recipient|address|Address of account receiving payment

### Refund
Confirmation of Refund processed.

|name |type |description
|-----|-----|-----------
|to|address|Address of account receiving refund
|value|uint256|Value of refund

### OwnerChanged
Confirmation of Owner change processed.

|name |type |description
|-----|-----|-----------
|from|address|Original Owner Address
|to|address|New Owner Address

## Credits
The concept and some of the initial coding for this Smart Contract was based on an article written by Ankit Brahmbhatt: [Learning Solidity with a Simple Fundraising Smart Contract](https://medium.com/quick-code/learning-solidity-with-a-simple-fundraising-smart-contract-2fad8b1d8b73)

## Release Notes
- v1.0.0 - 19/05/2020 - Initial Release