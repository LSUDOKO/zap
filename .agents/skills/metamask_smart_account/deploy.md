# Deploy a smart account

You can deploy [MetaMask Smart Accounts](https://docs.metamask.io/smart-accounts-kit/concepts/smart-accounts/) in two different ways. You can either deploy a smart account automatically when sending
the first [user operation](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#user-operation)**User operation** A pseudo-transaction object defined by ERC-4337 that describes what a smart account should execute. User operations are submitted to the alternate mempool managed by bundlers., or manually deploy the account.


## Prerequisites​

- [Install and set up the Smart Accounts Kit.](https://docs.metamask.io/smart-accounts-kit/get-started/install/)
- [Create a MetaMask smart account.](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/)


## Deploy with the first user operation​

When you send the first user operation from a smart account, the Smart Accounts Kit checks whether the account is already deployed. If the account
is not deployed, the toolkit adds the `initCode` to the user operation to deploy the account within the
same operation. Internally, the `initCode` is encoded using the `factory` and `factoryData`.

```
import { bundlerClient, smartAccount } from './config.ts'

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

})

```


## Deploy manually​

To deploy a smart account manually, call the [getFactoryArgs](https://docs.metamask.io/smart-accounts-kit/reference/smart-account/#getfactoryargs)
method from the smart account to retrieve the `factory` and `factoryData`. This allows you to use a relay account to sponsor the deployment without needing a paymaster.

The `factory` represents the contract address responsible for deploying the smart account, while `factoryData` contains the
calldata that will be executed by the `factory` to deploy the smart account.

The relay account can be either an [EOA](https://docs.metamask.io/smart-accounts-kit/development/reference/glossary#externally-owned-account-eoa)**Externally owned account (EOA)** A private-key-controlled account with no built-in programmable execution logic. or another smart account. This example uses an EOA.

```
import { walletClient, smartAccount } from './config.ts'



const { factory, factoryData } = await smartAccount.getFactoryArgs()



// Deploy smart account using relay account.

const hash = await walletClient.sendTransaction({

  to: factory,

  data: factoryData,

})

```


## Next steps​

- Learn more about [sending user operations](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/send-user-operation/).
- To sponsor gas for end users, see how to [send a gasless transaction](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/send-gasless-transaction/).

