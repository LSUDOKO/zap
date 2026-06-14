# Use spending limit scopes

Spending limit scopes define how much a [delegate](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#delegate-account)**Delegate account** The account that receives delegated authority and can redeem a delegation under its constraints. can spend in native, ERC-20, or ERC-721 tokens.
You can set transfer limits with or without time-based (periodic) or streaming conditions, depending on your use case.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Configure the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/guides/configure-toolkit/)
- [Create a delegator account.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/execute-on-smart-accounts-behalf/#3-create-a-delegator-account)
- [Create a delegate account.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/execute-on-smart-accounts-behalf/#4-create-a-delegate-account)


## ERC-20 periodic scope​

This scope ensures a per-period limit for ERC-20 token transfers.
You set the amount, period, and start data.
At the start of each new period, the allowance resets.
For example, Alice creates a delegation that lets Bob spend up to 10 USDC on her behalf each day.
Bob can transfer a total of 10 USDC per day; the limit resets at the beginning of the next day.

When this scope is applied, the toolkit automatically disallows native token transfers (sets the native token transfer limit to `0`).

Internally, this scope uses the [erc20PeriodTransfer](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#erc20periodtransfer) and [valueLte](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#valuelte) [caveat enforcers](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks..
See the [ERC-20 periodic scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#erc-20-periodic-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseUnits } from 'viem'



// startDate should be in seconds.

const startDate = Math.floor(Date.now() / 1000)



const delegation = createDelegation({

  scope: {

    type: ScopeType.Erc20PeriodTransfer,

    tokenAddress: '0xb4aE654Aca577781Ca1c5DE8FbE60c2F423f37da',

    // USDC has 6 decimal places.

    periodAmount: parseUnits('10', 6),

    periodDuration: 86400,

    startDate,

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## ERC-20 streaming scope​

This scopes ensures a linear streaming transfer limit for ERC-20 tokens.
Token transfers are blocked until the defined start timestamp.
At the start, a specified initial amount is released, after which tokens accrue linearly at the configured rate, up to the maximum allowed amount.
For example, Alice creates a delegation that allows Bob to spend 0.1 USDC per second, starting with an initial amount of 10 USDC, up to a maximum of 100 USDC.

When this scope is applied, the toolkit automatically disallows native token transfers (sets the native token transfer limit to `0`).

Internally, this scope uses the [erc20Streaming](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#erc20streaming) and [valueLte](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#valuelte) [caveat enforcers](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks..
See the [ERC-20 streaming scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#erc-20-streaming-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseUnits } from 'viem'



// startTime should be in seconds.

const startTime = Math.floor(Date.now() / 1000)



const delegation = createDelegation({

  scope: {

    type: ScopeType.Erc20Streaming,

    tokenAddress: '0xc11F3a8E5C7D16b75c9E2F60d26f5321C6Af5E92',

    // USDC has 6 decimal places.

    amountPerSecond: parseUnits('0.1', 6),

    initialAmount: parseUnits('10', 6),

    maxAmount: parseUnits('100', 6),

    startTime,

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## ERC-20 transfer scope​

This scope ensures that ERC-20 token transfers are limited to a predefined maximum amount.
This scope is useful for setting simple, fixed transfer limits without any time-based or streaming conditions.
For example, Alice creates a delegation that allows Bob to spend up to 10 USDC without any conditions.
Bob may use the 10 USDC in a single transaction or make multiple transactions, as long as the total does not exceed 10 USDC.

When this scope is applied, the toolkit automatically disallows native token transfers (sets the native token transfer limit to `0`).

Internally, this scope uses the [erc20TransferAmount](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#erc20transferamount) and [valueLte](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#valuelte) [caveat enforcers](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks..
See the [ERC-20 transfer scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#erc-20-transfer-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseUnits } from 'viem'



const delegation = createDelegation({

  scope: {

    type: ScopeType.Erc20TransferAmount,

    tokenAddress: '0xc11F3a8E5C7D16b75c9E2F60d26f5321C6Af5E92',

    // USDC has 6 decimal places.

    maxAmount: parseUnits('10', 6),

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## ERC-721 scope​

This scope limits the delegation to ERC-721 token transfers only.
For example, Alice creates a delegation that allows Bob to transfer an NFT she owns on her behalf.

Internally, this scope uses the [erc721Transfer](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#erc721transfer) [caveat enforcer](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks..
See the [ERC-721 scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#erc-721-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'



const delegation = createDelegation({

  scope: {

    type: ScopeType.Erc721Transfer,

    tokenAddress: '0x3fF528De37cd95b67845C1c55303e7685c72F319',

    tokenId: 1n,

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Native token periodic scope​

This scope ensures a per-period limit for native token transfers.
You set the amount, period, and start date.
At the start of each new period, the allowance resets.
For example, Alice creates a delegation that lets Bob spend up to 0.01 ETH on her behalf each day.
Bob can transfer a total of 0.01 ETH per day; the limit resets at the beginning of the next day.

When this scope is applied, the toolkit disallows ERC-20 and ERC-721 token transfers by default (sets `exactCalldata` to `0x`).
You can optionally configure `exactCalldata` to restrict transactions to a specific operation, or configure
`allowedCalldata` to allow transactions that match certain patterns or ranges.

Internally, this scope uses the [nativeTokenPeriodTransfer](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#nativetokenperiodtransfer) [caveat enforcer](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks., and
optionally uses the [allowedCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedcalldata) or [exactCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#exactcalldata) caveat enforcers when those parameters are specified.
See the [native token periodic scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#native-token-periodic-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseEther } from 'viem'



// startDate should be in seconds.

const startDate = Math.floor(Date.now() / 1000)



const delegation = createDelegation({

  scope: {

    type: ScopeType.NativeTokenPeriodTransfer,

    periodAmount: parseEther('0.01'),

    periodDuration: 86400,

    startDate,

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Native token streaming scope​

This scopes ensures a linear streaming transfer limit for native tokens.
Token transfers are blocked until the defined start timestamp.
At the start, a specified initial amount is released, after which tokens accrue linearly at the configured rate, up to the maximum allowed amount.
For example, Alice creates delegation that allows Bob to spend 0.001 ETH per second, starting with an initial amount of 0.01 ETH, up to a maximum of 0.1 ETH.

When this scope is applied, the toolkit disallows ERC-20 and ERC-721 token transfers by default (sets `exactCalldata` to `0x`).
You can optionally configure `exactCalldata` to restrict transactions to a specific operation, or configure
`allowedCalldata` to allow transactions that match certain patterns or ranges.

Internally, this scope uses the [nativeTokenStreaming](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#nativetokenstreaming) [caveat enforcer](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks., and
optionally uses the [allowedCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedcalldata) or [exactCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#exactcalldata) caveat enforcers when those parameters are specified.
See the [native token streaming scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#native-token-streaming-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseEther } from 'viem'



// startTime should be in seconds.

const startTime = Math.floor(Date.now() / 1000)



const delegation = createDelegation({

  scope: {

    type: ScopeType.NativeTokenStreaming,

    amountPerSecond: parseEther('0.001'),

    initialAmount: parseEther('0.01'),

    maxAmount: parseEther('0.1'),

    startTime,

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Native token transfer scope​

This scope ensures that native token transfers are limited to a predefined maximum amount.
This scope is useful for setting simple, fixed transfer limits without any time-based or streaming conditions.
For example, Alice creates a delegation that allows Bob to spend up to 0.1 ETH without any conditions.
Bob may use the 0.1 ETH in a single transaction or make multiple transactions, as long as the total does not exceed 0.1 ETH.

When this scope is applied, the toolkit disallows ERC-20 and ERC-721 token transfers by default (sets `exactCalldata` to `0x`).
You can optionally configure `exactCalldata` to restrict transactions to a specific operation, or configure
`allowedCalldata` to allow transactions that match certain patterns or ranges.

Internally, this scope uses the [nativeTokenTransferAmount](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#nativetokentransferamount) [caveat enforcer](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks., and
optionally uses the [allowedCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedcalldata) or [exactCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#exactcalldata) caveat enforcers when those parameters are specified.
See the [native token transfer scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#native-token-transfer-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseEther } from 'viem'



const delegation = createDelegation({

  scope: {

    type: ScopeType.NativeTokenTransferAmount,

    maxAmount: parseEther('0.001'),

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Next steps​

See [how to further constrain the authority of a delegation](https://docs.metamask.io/smart-accounts-kit/guides/delegation/use-delegation-scopes/constrain-scope/) using caveat enforcers.

# Use the function call scope

The function call scope defines the specific methods, contract addresses, and calldata that are allowed for the [delegation](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#delegation)**Delegation** The ability for a MetaMask smart account to authorize another account to perform specific executions on its behalf..
For example, Alice delegates to Bob the ability to call the `approve` function on the USDC contract, with the approval amount set to `0`.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Configure the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/guides/configure-toolkit/)
- [Create a delegator account.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/execute-on-smart-accounts-behalf/#3-create-a-delegator-account)
- [Create a delegate account.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/execute-on-smart-accounts-behalf/#4-create-a-delegate-account)


## Function call scope​

This scope requires `targets`, which specifies the permitted contract addresses, and `selectors`, which specifies the allowed methods.

Internally, this scope uses the [allowedTargets](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedtargets), [allowedMethods](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedmethods), and [valueLte](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#valuelte) [caveat enforcers](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks., and
optionally uses the [allowedCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedcalldata) or [exactCalldata](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#exactcalldata) caveat enforcers when those parameters are specified.
See the [function call scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#function-call-scope) for more details.

The following example sets the delegation scope to allow the delegate to call the `approve` function on the USDC token contract:

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'



// USDC address on Sepolia.

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const delegation = createDelegation({

  scope: {

    type: ScopeType.FunctionCall,

    targets: [USDC_ADDRESS],

    selectors: ['approve(address, uint256)'],

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


### Define allowed calldata​

You can further restrict the scope by defining the `allowedCalldata`. For example, you can set
`allowedCalldata` so the [delegate](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#delegate-account)**Delegate account** The account that receives delegated authority and can redeem a delegation under its constraints. is only permitted to call the `approve` function on the
USDC token contract with an allowance value of `0`. This effectively limits the delegate to
revoking ERC-20 approvals.

The `allowedCalldata` doesn't support multiple selectors. Each entry in the
list represents a portion of calldata corresponding to the same function signature.

You can include or exclude specific parameters to precisely define what parts of the calldata are valid.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { encodeAbiParameters, erc20Abi } from 'viem'



// USDC address on Sepolia.

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const delegation = createDelegation({

  scope: {

    type: ScopeType.FunctionCall,

    targets: [USDC_ADDRESS],

    selectors: ['approve(address, uint256)'],

    allowedCalldata: [

      {

        // Limits the allowance amount to be 0.

        value: encodeAbiParameters([{ name: 'amount', type: 'uint256' }], [0n]),

        // The first 4 bytes are for selector, and next 32 bytes

        // are for spender address.

        startIndex: 36,

      },

    ],

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


### Define exact calldata​

You can define the `exactCalldata` instead of the `allowedCalldata`. For example, you can
set `exactCalldata` so the [delegate](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#delegate-account)**Delegate account** The account that receives delegated authority and can redeem a delegation under its constraints. is permitted to call only the `approve` function on the USDC token
contract, with a specific spender address and an allowance value of 0. This effectively limits the delegate to
revoking ERC-20 approvals for a specific spender.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { encodeFunctionData, erc20Abi } from 'viem'



// USDC address on Sepolia.

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const delegation = createDelegation({

  scope: {

    type: ScopeType.FunctionCall,

    targets: [USDC_ADDRESS],

    selectors: ['approve(address, uint256)'],

    exactCalldata: {

      calldata: encodeFunctionData({

        abi: erc20Abi,

        args: ['0x0227628f3F023bb0B980b67D528571c95c6DaC1c', 0n],

        functionName: 'approve',

      }),

    },

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


### Allow native token transfer​

You can set `valueLte` to allow native token transfer up to a specified amount per call. By default, this value is set to `0`. For example, Alice can allow Bob
to take `0.00001` ETH as a fee each time he revokes a token approval on her behalf.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'

import { parseEther } from 'viem'



// USDC address on Sepolia.

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const delegation = createDelegation({

  scope: {

    type: ScopeType.FunctionCall,

    targets: [USDC_ADDRESS],

    selectors: ['approve(address, uint256)'],

    valueLte: { maxValue: parseEther('0.00001') },

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Next steps​

See [how to further constrain the authority of a delegation](https://docs.metamask.io/smart-accounts-kit/guides/delegation/use-delegation-scopes/constrain-scope/) using caveat enforcers.

# Use the ownership transfer scope

The ownership transfer scope restricts a delegation to ownership transfer calls only.
For example, Alice has deployed a smart contract, and she delegates to Bob the ability to transfer ownership of that contract.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Configure the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/guides/configure-toolkit/)
- [Create a delegator account.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/execute-on-smart-accounts-behalf/#3-create-a-delegator-account)
- [Create a delegate account.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/execute-on-smart-accounts-behalf/#4-create-a-delegate-account)


## Ownership transfer scope​

This scope requires a `contractAddress`, which represents the address of the deployed contract.

Internally, this scope uses the [ownershipTransfer](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#ownershiptransfer) [caveat enforcer](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat-enforcer)**Caveat enforcer** A smart contract that enforces delegation rules by validating caveat conditions during redemption hooks..
See the [ownership transfer scope reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/delegation-scopes/#ownership-transfer-scope) for more details.

```
import { createDelegation, ScopeType } from '@metamask/smart-accounts-kit'



const contractAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const delegation = createDelegation({

  scope: {

    type: ScopeType.OwnershipTransfer,

    contractAddress,

  },

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Next steps​

See [how to further constrain the authority of a delegation](https://docs.metamask.io/smart-accounts-kit/guides/delegation/use-delegation-scopes/constrain-scope/) using caveat enforcers.

# Constrain a delegation scope

[Delegation scopes](https://docs.metamask.io/smart-accounts-kit/guides/delegation/use-delegation-scopes/) define the delegation's initial authority and help prevent delegation misuse.
You can further constrain these scopes and limit the delegation's authority by applying [caveat enforcers](https://docs.metamask.io/smart-accounts-kit/concepts/delegation/caveat-enforcers/).


## Prerequisites​

[Configure a delegation scope.](https://docs.metamask.io/smart-accounts-kit/guides/delegation/use-delegation-scopes/)


## Apply a caveat enforcer​

For example, Alice creates a delegation with an [ERC-20 transfer scope](https://docs.metamask.io/smart-accounts-kit/guides/delegation/use-delegation-scopes/spending-limit/#erc-20-transfer-scope) that allows Bob to spend up to 10 USDC.
If Alice wants to further restrict the scope to limit Bob's delegation to be valid for only seven days,
she can apply the [timestamp](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#timestamp) caveat enforcer.

The following example creates a delegation using [createDelegation](https://docs.metamask.io/smart-accounts-kit/reference/delegation/#createdelegation), applies the ERC-20 transfer scope with a spending limit of 10 USDC, and applies the `timestamp` caveat enforcer to restrict the delegation's validity to a seven-day period:

```
import { createDelegation, ScopeType, CaveatType } from '@metamask/smart-accounts-kit'



// Convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)



// Seven days after current time.

const beforeThreshold = currentTime + 604800



const caveats = [

  {

    type: CaveatType.Timestamp,

    afterThreshold: currentTime,

    beforeThreshold,

  },

]



const delegation = createDelegation({

  scope: {

    type: ScopeType.Erc20TransferAmount,

    tokenAddress: '0xc11F3a8E5C7D16b75c9E2F60d26f5321C6Af5E92',

    maxAmount: 10000n,

  },

  // Apply caveats to the delegation.

  caveats,

  to: delegateAccount,

  from: delegatorAccount,

  environment: delegatorAccount.environment,

})

```


## Next steps​

- See the [caveats reference](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/) for the full list of caveat types and their parameters.
- For more specific or custom control, you can also [create custom caveat enforcers](https://docs.metamask.io/tutorials/create-custom-caveat-enforcer/)
and apply them to delegations.

