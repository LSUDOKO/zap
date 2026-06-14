# Pay for an x402 API with delegation

In this guide, you use a buyer account to access API data from an x402 server by creating
a [delegation](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#delegation)**Delegation** The ability for a MetaMask smart account to authorize another account to perform specific executions on its behalf. that authorizes token transfers
on your behalf.

You use [createx402DelegationProvider](https://docs.metamask.io/smart-accounts-kit/reference/x402/#createx402delegationprovider)
to set up an `x402Erc7710Client` with a delegation provider, register it with the x402 client,
and use `wrapFetchWithPayment` to automatically handle payment when calling a protected API route.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)


## Steps​


### 1. Install the dependencies​

```
npm install @x402/core @x402/fetch @metamask/x402

```


### 2. Create a buyer account​

Create an account to represent the buyer, the
[delegator](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#delegator-account)**Delegator account** The account that creates and signs a delegation to grant limited authority to another account. who creates a delegation.

The delegator must be a [MetaMask smart account](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#metamask-smart-account)**MetaMask smart account** A smart contract account created using the Smart Accounts Kit that supports programmable behavior, flexible signing options, and ERC-7710 delegations..
Use the toolkit's
[toMetaMaskSmartAccount](https://docs.metamask.io/smart-accounts-kit/reference/smart-account/#tometamasksmartaccount) method to
create the buyer account.

Fund the smart account with USDC for the requested payment.

```
import { Implementation, toMetaMaskSmartAccount } from '@metamask/smart-accounts-kit'

import { publicClient, buyerAccount } from './config'



export const buyerSmartAccount = await toMetaMaskSmartAccount({

  client: publicClient,

  implementation: Implementation.Hybrid,

  deployParams: [buyerAccount.address, [], [], []],

  deploySalt: '0x',

  signer: { account: buyerAccount },

})

```


### 3. Create an x402 ERC-7710 client​

Create an `x402Erc7710Client` using
[createx402DelegationProvider](https://docs.metamask.io/smart-accounts-kit/reference/x402/#createx402delegationprovider).
The provider creates an [open](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#open-delegation)**Open delegation** A delegation that leaves the delegate unspecified, allowing any account to redeem it.
[root delegation](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#root-delegation)**Root delegation** The first delegation in a chain, where an account delegates its own authority directly., signs it, and returns an ABI-encoded delegation chain
when the x402 client needs to pay for a request.

The provider appends [redeemer](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#redeemer),
[allowedTargets](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#allowedtargets), and
[timestamp](https://docs.metamask.io/smart-accounts-kit/reference/delegation/caveats/#timestamp)
[caveats](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#caveat)**Caveat** A restriction attached to a delegation that limits how delegated authority can be used. if not already present.

```
import { createx402DelegationProvider } from '@metamask/smart-accounts-kit/experimental'

import { x402Erc7710Client } from '@metamask/x402'



const erc7710Client = new x402Erc7710Client({

  delegationProvider: createx402DelegationProvider({

    account: buyerSmartAccount,

  }),

})

```


### 4. Register the client​

Register the ERC-7710 client with the x402 core client for all EVM networks.
Create an HTTP client and a payment-aware `fetch` function using `wrapFetchWithPayment`.

```
import { x402Client, x402HTTPClient } from '@x402/core/client'

import { wrapFetchWithPayment } from '@x402/fetch'



const coreClient = new x402Client().register('eip155:*', erc7710Client)

const httpClient = new x402HTTPClient(coreClient)



const fetchWithPayment = wrapFetchWithPayment(fetch, httpClient)

```


### 5. Make the paid request​

Call the protected endpoint using `fetchWithPayment`.
It handles the x402 payment flow, calling your delegation provider
to create an [open delegation](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#open-delegation)**Open delegation** A delegation that leaves the delegate unspecified, allowing any account to redeem it. when the server returns a `402` response.

```
const paidResponse = await fetchWithPayment('https://api.example.com/paid-endpoint', {

  method: 'GET',

})

```

# Recurring x402 payments

In this guide, you set up recurring x402 payments by requesting an ERC-20 periodic
[Advanced Permissions](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#advanced-permissions)**Advanced Permissions** Fine-grained, wallet execution permissions that dapps can request from MetaMask extension users. Based on ERC-7715. permission from a user.

For example, a user gives your agent permission to spend up to 10 USDC per week.
Later, when the agent calls an x402 endpoint, it checks the price, uses the granted permission,
and pays.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)


## Steps​


### 1. Install the dependencies​

```
npm install @x402/core @x402/fetch @metamask/x402

```


### 2. Set up a Wallet Client​

Set up a Wallet Client using Viem's
[createWalletClient](https://viem.sh/docs/clients/wallet) function.
Use this client to interact with MetaMask.

Extend the Wallet Client with `erc7715ProviderActions` to enable
[Advanced Permissions](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#advanced-permissions)**Advanced Permissions** Fine-grained, wallet execution permissions that dapps can request from MetaMask extension users. Based on ERC-7715. requests.

```
import { createWalletClient, custom } from 'viem'

import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions'



const walletClient = createWalletClient({

  transport: custom(window.ethereum),

}).extend(erc7715ProviderActions())

```


### 3. Set up an agent account​

The session account can be either a
[smart account](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#metamask-smart-account)**MetaMask smart account** A smart contract account created using the Smart Accounts Kit that supports programmable behavior, flexible signing options, and ERC-7710 delegations. or an
[EOA](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#externally-owned-account-eoa)**Externally owned account (EOA)** A private-key-controlled account with no built-in programmable execution logic..
This example uses an EOA as the session account.

```
import { privateKeyToAccount } from 'viem/accounts'



const sessionAccount = privateKeyToAccount('0x...')

```


### 4. Request Advanced Permissions​

Request Advanced Permissions from the user with the Wallet Client's
`requestExecutionPermissions` action.

In this example, you request an
[ERC-20 periodic permission](https://docs.metamask.io/smart-accounts-kit/guides/advanced-permissions/use-permissions/erc20-token/#erc-20-periodic-permission)
with a weekly allowance of 10 USDC.
This creates a recurring payment budget that your agent can store and reuse for x402 API calls.

See the
[requestExecutionPermissions](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/wallet-client/#requestexecutionpermissions)
API reference for more information.

```
import { base as chain } from 'viem/chains'

import { parseUnits } from 'viem'



// USDC address on Base.

const tokenAddress = '0x...'



const currentTime = Math.floor(Date.now() / 1000)

const expiry = currentTime + 60 * 60 * 24 * 30 // Permission expires in 30 days.



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    to: sessionAccount.address,

    permission: {

      type: 'erc20-token-periodic',

      data: {

        tokenAddress,

        periodAmount: parseUnits('10', 6),

        periodDuration: 604800,

        startTime: currentTime,

        justification:

          'Permission for agent to spend up to 10 USDC every week for making x402 API calls',

      },

      isAdjustmentAllowed: false,

    },

  },

])

```


### 5. Create an x402 ERC-7710 client​

Create an `x402Erc7710Client` using
[createx402DelegationProvider](https://docs.metamask.io/smart-accounts-kit/reference/x402/#createx402delegationprovider).

The provider creates an [open redelegation](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#open-redelegation)**Open redelegation** A redelegation with no specific delegate, allowing any account to redeem inherited permissions.
from the session account using the granted permission. The facilitator can then redeem the redelegated
permission context for x402 settlement.

```
import { createx402DelegationProvider } from '@metamask/smart-accounts-kit/experimental'

import { x402Erc7710Client } from '@metamask/x402'



const permission = grantedPermissions[0]



const erc7710Client = new x402Erc7710Client({

  delegationProvider: createx402DelegationProvider({

    account: sessionAccount,

    parentPermissionContext: permission.context,

    from: permission.from,

  }),

})

```


### 6. Register the client​

Register the ERC-7710 client with the x402 core client for all EVM networks,
then create an HTTP client and a payment-aware `fetch` function using `wrapFetchWithPayment`.

```
import { x402Client, x402HTTPClient } from '@x402/core/client'

import { wrapFetchWithPayment } from '@x402/fetch'



const coreClient = new x402Client().register('eip155:*', erc7710Client)

const httpClient = new x402HTTPClient(coreClient)



const fetchWithPayment = wrapFetchWithPayment(fetch, httpClient)

```


### 7. Make the paid request​

Call the protected endpoint using `fetchWithPayment`.
The x402 payment flow calls your delegation provider to create an open redelegation
when the server returns a `402` response.

```
const paidResponse = await fetchWithPayment('https://api.example.com/paid-endpoint', {

  method: 'GET',

})

```

You can reuse the same weekly granted permission for additional protected routes and providers
in your agent flow.
Your agent continues paying until the weekly cap is reached, then resumes after the next
weekly period starts.

