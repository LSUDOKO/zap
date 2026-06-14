# Use ERC-20 token permissions

[Advanced Permissions (ERC-7715)](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/) supports ERC-20 token permission types that allow you to request fine-grained
permissions for ERC-20 token transfers with periodic, fixed allowance, or streaming conditions, depending on your use case.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Configure the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/guides/configure-toolkit/)
- [Create a session account.](https://docs.metamask.io/smart-accounts-kit/guides/advanced-permissions/execute-on-metamask-users-behalf/#3-set-up-a-session-account)


## ERC-20 allowance permission​

This permission type ensures a fixed ERC-20 token allowance.
It allows transfers up to a maximum total amount and doesn't reset by period.

For example, a user signs an ERC-7715 permission that lets your dapp spend up to 50 USDC in total.
After the dapp transfers 50 USDC, no additional transfers are allowed under this permission.

See the [ERC-20 allowance permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#erc-20-allowance-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { parseUnits } from 'viem'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)

// 1 week from now.

const expiry = currentTime + 604800



// USDC address on Ethereum Sepolia.

const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'erc20-token-allowance',

      data: {

        tokenAddress,

        // 50 USDC in WEI format. Since USDC has 6 decimals, 50 * 10^6.

        allowanceAmount: parseUnits('50', 6),

        startTime: currentTime,

        justification: 'Permission to transfer up to 50 USDC in total',

      },

      isAdjustmentAllowed: true,

    },

  },

])

```


## ERC-20 periodic permission​

This permission type ensures a per-period limit for ERC-20 token transfers. At the start of each new period, the allowance resets.

For example, a user signs an ERC-7715 permission that lets a dapp spend up to 10 USDC on their behalf each day. The dapp can transfer a total of
10 USDC per day; the limit resets at the beginning of the next day.

See the [ERC-20 periodic permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#erc-20-periodic-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { parseUnits } from 'viem'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)

// 1 week from now.

const expiry = currentTime + 604800



// USDC address on Ethereum Sepolia.

const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'erc20-token-periodic',

      data: {

        tokenAddress,

        // 10 USDC in WEI format. Since USDC has 6 decimals, 10 * 10^6.

        periodAmount: parseUnits('10', 6),

        // 1 day in seconds.

        periodDuration: 86400,

        justification: 'Permission to transfer 10 USDC every day',

      },

      isAdjustmentAllowed: true,

    },

  },

])

```


## ERC-20 stream permission​

This permission type ensures a linear streaming transfer limit for ERC-20 tokens. Token transfers are blocked until the
defined start timestamp. At the start, a specified initial amount is released, after which tokens accrue linearly at the
configured rate, up to the maximum allowed amount.

For example, a user signs an ERC-7715 permission that allows a dapp to spend 0.1 USDC per second, starting with an initial amount
of 1 USDC, up to a maximum of 2 USDC.

See the [ERC-20 stream permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#erc-20-stream-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { parseUnits } from 'viem'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)

// 1 week from now.

const expiry = currentTime + 604800



// USDC address on Ethereum Sepolia.

const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'erc20-token-stream',

      data: {

        tokenAddress,

        // 0.1 USDC in WEI format. Since USDC has 6 decimals, 0.1 * 10^6.

        amountPerSecond: parseUnits('0.1', 6),

        // 1 USDC in WEI format. Since USDC has 6 decimals, 1 * 10^6.

        initialAmount: parseUnits('1', 6),

        // 2 USDC in WEI format. Since USDC has 6 decimals, 2 * 10^6.

        maxAmount: parseUnits('2', 6),

        startTime: currentTime,

        justification: 'Permission to use 0.1 USDC per second',

      },

      isAdjustmentAllowed: true,

    },

  },

])

```

# Use native token permissions

[Advanced Permissions (ERC-7715)](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/) supports native token permission types that allow you to request fine-grained
permissions for native token transfers with periodic, fixed-allowance, or streaming conditions, depending on your use case.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Configure the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/guides/configure-toolkit/)
- [Create a session account.](https://docs.metamask.io/smart-accounts-kit/guides/advanced-permissions/execute-on-metamask-users-behalf/#3-set-up-a-session-account)


## Native token allowance permission​

This permission type ensures a fixed native token allowance.
It allows transfers up to a maximum total amount and doesn't reset by period.

For example, a user signs an ERC-7715 permission that lets your dapp spend up to 0.05 ETH in total.
After the dapp transfers 0.05 ETH, no additional transfers are allowed under this permission.

See the [native token allowance permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#native-token-allowance-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { parseEther } from 'viem'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)

// 1 week from now.

const expiry = currentTime + 604800



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'native-token-allowance',

      data: {

        // 0.05 ETH in wei format.

        allowanceAmount: parseEther('0.05'),

        startTime: currentTime,

        justification: 'Permission to transfer up to 0.05 ETH in total',

      },

      isAdjustmentAllowed: true,

    },

  },

])

```


## Native token periodic permission​

This permission type ensures a per-period limit for native token transfers. At the start of each new period, the allowance resets.

For example, a user signs an ERC-7715 permission that lets a dapp spend up to 0.001 ETH on their behalf each day. The dapp can transfer a total of
0.001 ETH per day; the limit resets at the beginning of the next day.

See the [native token periodic permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#native-token-periodic-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { parseEther } from 'viem'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)

// 1 week from now.

const expiry = currentTime + 604800



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'native-token-periodic',

      data: {

        // 0.001 ETH in wei format.

        periodAmount: parseEther('0.001'),

        // 1 hour in seconds.

        periodDuration: 86400,

        startTime: currentTime,

        justification: 'Permission to use 0.001 ETH every day',

      },

      isAdjustmentAllowed: true,

    },

  },

])

```


## Native token stream permission​

This permission type ensures a linear streaming transfer limit for native tokens. Token transfers are blocked until the
defined start timestamp. At the start, a specified initial amount is released, after which tokens accrue linearly at the
configured rate, up to the maximum allowed amount.

For example, a user signs an ERC-7715 permission that allows a dapp to spend 0.0001 ETH per second, starting with an initial amount
of 0.1 ETH, up to a maximum of 1 ETH.

See the [native token stream permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#native-token-stream-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { parseEther } from 'viem'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)

// 1 week from now.

const expiry = currentTime + 604800



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'native-token-stream',

      data: {

        // 0.0001 ETH in wei format.

        amountPerSecond: parseEther('0.0001'),

        // 0.1 ETH in wei format.

        initialAmount: parseEther('0.1'),

        // 1 ETH in wei format.

        maxAmount: parseEther('1'),

        startTime: currentTime,

        justification: 'Permission to use 0.0001 ETH per second',

      },

      isAdjustmentAllowed: true,

    },

  },

])

```

# Use approval revocation permission

[Advanced Permissions (ERC-7715)](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/) supports the token approval
revocation permission type that allows you to request permission to revoke existing token approvals
on behalf of the user.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Configure the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/guides/configure-toolkit/)
- [Create a session account.](https://docs.metamask.io/smart-accounts-kit/guides/advanced-permissions/execute-on-metamask-users-behalf/#3-set-up-a-session-account)


## Token approval revocation permission​

This permission type enables revoking existing token approvals on behalf of the user.

For example, a user signs an ERC-7715 permission that lets a dapp revoke any ERC-20 token
allowances periodically, or during an ongoing exploit.

See the [token approval revocation permission API reference](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/permissions/#token-approval-revocation-permission) for more information.

```
import { sepolia as chain } from 'viem/chains'

import { walletClient } from './client.ts'



// Since current time is in seconds, convert milliseconds to seconds.

const currentTime = Math.floor(Date.now() / 1000)



// 30 days from now.

const expiry = currentTime + 60 * 60 * 24 * 30



const grantedPermissions = await walletClient.requestExecutionPermissions([

  {

    chainId: chain.id,

    expiry,

    // The requested permissions will be granted to the

    // session account.

    to: sessionAccount.address,

    permission: {

      type: 'token-approval-revocation',

      data: {

        erc20Approve: true,

        erc721Approve: false,

        erc721SetApprovalForAll: false,

        permit2Approve: true,

        permit2Lockdown: false,

        permit2InvalidateNonces: false,

        justification: 'Permission to revoke ERC-20 token approvals',

      },

      isAdjustmentAllowed: false,

    },

  },

])

```

# Get granted permissions

[ERC-7715](https://eip.tools/eip/7715) defines an RPC method that returns the granted execution permissions
for a wallet. Use the method to get the granted [Advanced Permissions](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#advanced-permissions)**Advanced Permissions** Fine-grained, wallet execution permissions that dapps can request from MetaMask extension users. Based on ERC-7715. for a wallet.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Learn about Advanced Permissions.](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/)


## Request granted permissions​

Request the granted Advanced Permissions for a wallet with the
Wallet Client's [getGrantedExecutionPermissions](https://docs.metamask.io/smart-accounts-kit/reference/advanced-permissions/wallet-client/#getgrantedexecutionpermissions) action.

```
import { walletClient } from './config.ts'



const grantedExecutionPermissions = await walletClient.getGrantedExecutionPermissions()

```

