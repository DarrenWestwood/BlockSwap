# Web app for Chainflip Swaps
Swap BTC -> USDT using decentralised Chainflip services

Chainflip Node + NodeJS (Express) Backend + React Frontend

# Setup

## Broker Light RPC node

As of version `1.12.0`, to call the Broker RPC endpoints, you must run your own Broker Light RPC node. Operating a Chainflip light-RPC node is straightforward and resource-efficient.
The Broker light-rpc node is just a normal Chainflip node running in a specialized `--sync light-rpc` mode. Your Broker account key must be injected in the node's keystore to be able to expose the Broker RPC endpoints and submit extrinsics.

This `light-rpc` mode prunes older blocks and permits querying only recent blocks, significantly reducing disk space requirements compared to running a full node. The recommended minimum requirements for running a light-rpc node include:
* 2 vCPU
* 4 GB RAM
* 20 GB SSD

## Running the Broker light-rpc node using Docker

Reference setup and compose profiles: [BlockSwap](https://github.com/DarrenWestwood/BlockSwap)

### Setup

* Clone the `BlockSwap` repo
```bash
git clone https://github.com/DarrenWestwood/BlockSwap.git
cd BlockSwap
```

### Broker account key

> ⛔️ Please make sure you backup your keys. If you lose your keys, you will lose access to your funds. ⛔️

* If you have an existing Broker account key, copy it to the `./chainflip/keys/broker/signing_key_file` file. Please make sure that the key is in the correct location, otherwise it won't be properly injected into the node's keystore.

If you don't have a Broker account key, you can generate one using the following steps.

```bash
mkdir -p ./chainflip/keys/broker
docker run --platform=linux/amd64 --entrypoint=/usr/local/bin/chainflip-cli chainfliplabs/chainflip-cli:berghain-1.12.0 generate-keys --json > chainflip/broker-keys.json
cat chainflip/broker-keys.json | jq -r '.signing_key.secret_key' > chainflip/keys/broker/signing_key_file
```

### Funding the Account
> The minimum funding amount for registering as a Broker or LP role is technically 1 FLIP. However, we recommend funding your accounts with at least 5 FLIP to account for transaction fees.

Get the public key of the Broker account:
```bash
cat chainflip/broker-keys.json | jq -r '.signing_account_id'
```

* Head to the [Auctions Web App](https://auctions.chainflip.io/auction)

* Click "Register Node" and follow the instructions to fund the account

### Running the node
* Start a Broker RPC node and wait for it to sync:
```bash
docker compose --profile broker up -d
```

* View the logs to monitor sync progress
```bash
docker compose --profile broker logs -f
```

You should see something like this:

```log
node-with-broker-1  | 2025-10-30 11:48:30 Chainflip Node
node-with-broker-1  | 2025-10-30 11:48:30 ✌️  version 1.12.0-11b2cc9c943
node-with-broker-1  | 2025-10-30 11:48:30 ❤️  by Chainflip Team <https://github.com/chainflip-io>, 2021-2025
node-with-broker-1  | 2025-10-30 11:48:30 📋 Chain specification: Chainflip-Berghain
node-with-broker-1  | 2025-10-30 11:48:30 🏷  Node name: prickly-goose-4764
node-with-broker-1  | 2025-10-30 11:48:30 👤 Role: FULL
node-with-broker-1  | 2025-10-30 11:48:30 💾 Database: RocksDb at /etc/chainflip/chaindata/chains/Chainflip-Berghain/db/full_light
node-with-broker-1  | 2025-10-30 11:48:30 ⚡  Light-RPC mode enabled
node-with-broker-1  | 2025-10-30 11:48:30 Deleting old db files and recreating a new RocksDB database on startup.
node-with-broker-1  | 2025-10-30 11:48:32 🔨 Initializing Genesis block/state (state: 0xceb9…3b8d, header-hash: 0x8b8c…6eb9)
node-with-broker-1  | 2025-10-30 11:48:32 🏷  Local node identity is: 12D3KooWG27QwsvJfphc9ErHPb6Pwa6iVwcyS8eMuELXkfVZ2Zx6
node-with-broker-1  | 2025-10-30 11:48:32 Running libp2p network backend
node-with-broker-1  | 2025-10-30 11:48:32 🗝️ Broker key found in the keystore, enabling Broker-related RPCs
node-with-broker-1  | 2025-10-30 11:48:32 💻 Operating system: linux
node-with-broker-1  | 2025-10-30 11:48:32 💻 CPU architecture: x86_64
node-with-broker-1  | 2025-10-30 11:48:32 💻 Target environment: gnu
node-with-broker-1  | 2025-10-30 11:48:32 💻 Memory: 23996MB
node-with-broker-1  | 2025-10-30 11:48:32 💻 Kernel: 6.10.14-linuxkit
node-with-broker-1  | 2025-10-30 11:48:32 💻 Linux distribution: Ubuntu 22.04.5 LTS
node-with-broker-1  | 2025-10-30 11:48:32 💻 Virtual machine: no
node-with-broker-1  | 2025-10-30 11:48:32 📦 Highest known block at #0
node-with-broker-1  | 2025-10-30 11:48:32 〽️ Prometheus exporter started at 127.0.0.1:9615
node-with-broker-1  | 2025-10-30 11:48:32 Running JSON-RPC server: addr=0.0.0.0:9944, allowed origins=["*"]
```

Make sure:
* To see that light-rpc mode is enabled in the logs. Log line similar to: `⚡  Light-RPC mode enabled`
* Broker key is properly injected and Broker RPC endpoints are enabled. Log line similar to: ` 🗝️ Broker key found in the keystore, enabling Broker-related RPCs`


* Wait until the node is synced before start making RPC calls. This should take around 2 minutes.

> 💡 Note: Your node is considered synced when you see logs similar to:
```log
node-with-broker-1  | 2025-10-30 11:49:55 🏆 Imported #10260723 (0x5d76…b3af → 0x93df…717b)
node-with-broker-1  | 2025-10-30 11:49:56 💤 Idle (8 peers), best: #10260723 (0x93df…717b), finalized #10260721 (0xb28f…247c), ⬇ 190.9kiB/s ⬆ 102.5kiB/s
node-with-broker-1  | 2025-10-30 11:50:01 🏆 Imported #10260724 (0x93df…717b → 0xc2ca…a98c)
```

* You can check the node's health and verify it is synced by using this RPC call:
```
curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "system_health"}' \
    http://localhost:9944
```
You should a response showing that `isSyncing` is false, similar to:
```
{"jsonrpc":"2.0","result":{"peers":8,"isSyncing":false,"shouldHavePeers":true},"id":1}
```

* To stop the node:
```bash
docker compose --profile broker down
```

### Interacting with the APIs

Now you can interact with the APIs using any HTTP or WS client. Here we use the `curl` and `wscat` commands.

#### Register the Broker account via RPC

```bash copy
curl -H "Content-Type: application/json" \
  -d '{"id":1,"jsonrpc":"2.0","method":"broker_registerAccount"}' \
  http://localhost:9944
```

## Running the Broker + Backend + Frontend

Ensure the chainflip node is stopped
* To stop the node:
```bash
docker compose --profile broker down
```

* Start the Broker + Backend + Frontend:
```bash
docker compose --profile broker --profile backend --profile frontend up --build -d
```