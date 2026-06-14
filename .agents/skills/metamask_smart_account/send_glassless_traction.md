# Send a gasless transaction

[MetaMask Smart Accounts](https://docs.metamask.io/smart-accounts-kit/concepts/smart-accounts/) support gas sponsorship, which simplifies onboarding by abstracting gas fees away from end users.
You can use any [paymaster](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#paymaster)**Paymaster** A service that pays for user operations on behalf of a smart account. service provider, such as [Pimlico](https://docs.pimlico.io/references/paymaster) or [ZeroDev](https://docs.zerodev.app/meta-infra/rpcs), or plug in your own custom paymaster.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Create a MetaMask smart account.](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/)


## Send a gasless transaction​

The following example demonstrates how to use Viem's [Paymaster Client](https://viem.sh/account-abstraction/clients/paymaster) to send gasless transactions.
You can provide the paymaster client using the paymaster property in the [sendUserOperation](https://viem.sh/account-abstraction/actions/bundler/sendUserOperation#paymaster-optional) method, or in the [Bundler Client](https://viem.sh/account-abstraction/clients/bundler#paymaster-optional).

In this example, the paymaster client is passed to the `sendUserOperation` method.

```
import { bundlerClient, smartAccount, paymasterClient } from './config.ts'

import { parseEther } from 'viem'



// Appropriate fee per gas must be determined for the specific bundler being used.

const maxFeePerGas = 1n

const maxPriorityFeePerGas = 1n



const userOperationHash = await bundlerClient.sendUserOperation({

  account: smartAccount,

  calls: [

    {

      to: '0x1234567890123456789012345678901234567890',

      value: parseEther('0.001'),

    },

  ],

  maxFeePerGas,

  maxPriorityFeePerGas,

  paymaster: paymasterClient,

})

```

