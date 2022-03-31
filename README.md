> **Notice: The current documentation is a draft version describing an API that has yet to be developed as part of the upcoming Web3 SDK.**

# @web3-sdk/react

@web3-sdk/react will provide an easy to use toolset used to simplify Web3 development. Currently, we propose to implement abstractions around the following:

- [Connections](#connection-management)
- [Contracts](#contract-management)
- [Transactions](#transaction-management)
- [Events](#event-management)

## Setting Up

The library exposes a stateful [React Context API](https://reactjs.org/docs/context.html) provider that provides a global state for the built-in hooks. The user must implement this for the hooks to work.

```tsx
const supportedChains = [
  // This is a utility function for common chains
  getChainParams('mainnet', InfuraRPC(process.env.NEXT_INFURA_API_KEY)),
  {
    chainId: 80001,
    name: 'Mumbai',

    // Auto adds the chain to the wallet of the user on connect
    nativeCurrency: MATIC_CURRENCY_INFO,
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],

    // Also supports websockets
    rpc: 'https://matic-mumbai.chainstacklabs.com',
  },
];

<Web3Provider
  supportedChains={supportedChains}
  defaultChain={supportedChains[0].chainId}

  // Only enable certain connectors
  supportedConnectors={[
    ConnectorTypes.NetworkConnector,
    ConnectorTypes.MetamaskConnector
  ]} 
  
  // These allow the user to resume previous sessions
  cacheChainId={true}
  cacheConnector={true}
  cacheAccount={true}
  autoConnect={true}
>
  {...children}
</Web3Provider>
```

## Connection Management

### Connectors
The library doesn't supply any UI components for wallet connections. Instead, the user should implement a modal (or similar) with the different connectors that they want to support.

```tsx
const connectors = useConnectors();

return connectors.map((connector, i) => (
  <button
    key={`connector-${i}`}
    onClick={() => connector.connect()}
  >
    Connect {connector.getName()}
  </button>
));
```

Not all connectors support every chain. For example, TrustWallet [doesn't support testnets](https://community.trustwallet.com/t/integrating-testnet-chains-to-trust/4547), and Metamask does not support SSR  mode. The user can use the `isSupported` method to check for support in those cases.

```tsx
const connector = useMetamaskConnector()

return (
  <button
    disabled={!connector.isSupported()}
    onClick={() => connector.connect()}
  >
    Connect to Metamask
  </button>
);
```

Alternatives could be: `useNetworkConnector`, `useMetamaskConnector`, `useWalletConnectConnector`, `useMagicLinkConnector`, etc.

### Connection Hooks
As opposed to alternatives, this library makes a clear distinction between the backend connection of a connected wallet and the connection of the web app.

The reason for this is that the web app can't fully control the connector settings, i.e., situations where the wallet does not:

- Have support for certain chains the web app supports;
- Support WebSocket events while required by the app.
- Have a working, and *nearby* RPC setup*;
- Etc.

In those cases, it is beneficial to control the contents of the web app by managing the network connection ourselves.

> <small>1* We once encountered a situation where a user had the JSON-RPC for Mainnet set to `localhost`, causing the DApp not to load.</small>

```ts
// The NetworkConnection is contructed using the RPC/WS from the supportedChains property on the Web3Provider.
const { isConnected, isConnecting, isError, error, chainId } =
  useNetworkConnection();

// The WalletConnection will be contructed when  
const {
  isConnected,
  isConnecting,
  isError,
  error,
  chainId,

  // These are only available for the wallet connection, which can also use a NetworkConnector
  account,
  connector,
} = useWalletConnection();
```

The developer should always make sure buttons that can mutate blockchain state are disabled and show a banner (or similar component) indicating if the user is connected to a different chain than is currently selected.

```tsx
const { chainId: networkChainId } = useNetworkConnection();
const { chainId: walletChainId } = useWalletConnection();

// Exposed wrapper around react-query, see below.
const switchChainQuery = useSwitchChain();

if (walletChainId !== networkChainId) {
  return (
    <div>
      You're connected to the right network, click here to switch to{' '}
      <button onClick={() => switchChainQuery.mutate({ chainId: networkChainId })}>Ethereum</button>
    </div>
  );
}
```

Similarly, there are two providers.

```ts
// Used for querying blockchain data
const networkProvider = useNetworkProvider();

// Used for mutating blocckhain data
const walletProvider = useWalletProvider();
```

## Contract Management

### Contract Hooks

Querying and mutating blockchain data is a common challenge in blockchain development. Luckily, [TypeChain](https://github.com/dethcrypto/TypeChain) allows us to create typed smart contracts which we can wrap in custom hooks.

```ts
// Contruct custom contracts with generated factories by TypeChain
const typedContract = useContract(address, ERC20__factory);

// Or use built in contracts
const { decimals, balanceOf, approve } = useERC20Contract(address);
const { mint, name, symbol } = useERC721Contract(address); 
```
Alternatives could be: `useERC721AContract`, `useERC1155Contract`, etc.

### Contract Method Hooks
The library makes it easy to query and mutate contract methods anywhere in the app using [react-query](https://github.com/tannerlinsley/react-query), which caches, error handles, dedupes, and invalidates async requests. That allows the developer to use contract method hooks anywhere in the application, and the request will only execute once unless invalidated.

The most verbose way of querying data from the blockchain is:

```tsx
const erc20Contract = useERC20Contract(contractAddress);

// The hook will automatically select the NetworkProvider because this is a query request
const { data, isLoading, isError, error } = useContractQuery<
  Parameters<typeof erc20Contract.balanceOf>
>(erc20Contract.balanceOf, { address: userAddress });

if (isError) {
  return <div>Woops, something went wrong: {error}</div>
}

if (isLoading) {
  return <FontAwesomeIcon icon={faSpinnerThird} />
}

return <div>{ data }</div>
```

Similarly, we can mutate the blockchain:

```ts
const { data, mutate, isLoading } = useContractMutate<
  Parameters<typeof erc20Contract.approve>
>(erc20Contract.approve, { amount: BigNumber.from("1000000000") });
```

But we should also expose often used methods as easy to use hooks:

```ts
const balanceQuery = useERC20BalanceOf(contractAddress, userAddress);
const approveMutation = useERC721Mint(contractAddress);
```

And make cached keys globally available so we can easily re-fetch data.

```ts
const queryClient = useQueryClient();
const { erc20BalanceOf } = useCachingKeys();
const transferMutation = useERC20Transfer(contractAddress);

const transaction = transferMutation.mutate(
  userAddress,
  BigNumber.from('100000000000'),
  {
    onSuccess: (transaction) =>
      // Trigger refetch for all balanceOf queries
      queryClient.invalidateQueries(erc20BalanceOf.ALL)
  }
);
```

## Transaction Management
Handling long-running transactions can be done in two ways:

- using the `isLoading` property of the mutation
- using the `useTransactions()` hook

Accessing the transaction in the same component as it's dispatched can be done as follows:

```tsx
// isLoading will be true if the user is signing the transaction
const {
  data: transaction,
  isLoading: isAwaitingConfirmation,
  mutate: transfer,
} = useERC20Transfer(contractAddress);

// isLoading will be true if transaction is pending
const { isLoading: isAwaitingTransaction } = useTransaction(transaction);

return (
  <button
    // Trigger the approval modal
    onClick={() => transfer(userAddress, BigNumber.from("100000000000"))}
    loading={isAwaitingConfirmation || isAwaitingTransaction}
  >
    Transfer Tokens
  </button>
);
```

However, usually, it's more convenient to show transactions in a single place (e.g., a notification manager) so that the user can continue using the app while the transaction is pending.

```ts
const transactions = useTransactions();

return transactions.map((transaction, i) => (
  <div key={`transaction-${i}`}>
    Transaction loading: {transaction.isLoading}
  </div>
));
```

The example above is different from transactions made by the user, which can be obtained by: `useWalletProvider().getHistory()`.

## Event Management

Events are exposed from the query filter API from Ethers, supplemented with `react-query` for global access. Again, because we've implemented the contract layer, these are fully typed.

```ts
const contract = useERC20Contract(contractAddress);

const { data, isLoading } = useContractFilter(
  contract,
  contract.filters.Transfer,
  { from: userAddress } // Typed properties
);
```

If instead, you want to listen to live events from the blockchain, you can do so by:

```tsx
const events = useEvents();

const [clearedEvents, setClearedEvents] = useState<Array<Event>>([]);

return events
  .filter((event) => !clearedEvents.includes(event))
  .map((event, i) => (
    <div
      key={`event-${i}`}
      // Clear the notification onClick
      onClick={() => setClearedEvents([...clearedEvents, event])}
    >
      Event happened: {event.event}
    </div>
  ));
```

## Misc

> This list we're not sure about yet.

We might also expose other abstractions like:

- Decimal parsing from token address, using the contract hooks from above.
  * `weiValue(1, tokenAddress)`
  * `etherValue(1, tokenAddress)`
- Merkle Proof generating and validating
- If required, we might re-expose certain Ethers methods
