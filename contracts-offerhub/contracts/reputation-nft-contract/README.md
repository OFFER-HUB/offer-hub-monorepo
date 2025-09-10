# Reputation NFT Smart Contract

This contract implements a reputation-based NFT system using Soroban, the smart contract platform on the Stellar blockchain.

## Features

- **Achievement NFT Minting**: Only authorized users (admin or minter role) can mint NFTs for user achievements.
- **NFT Transfers**: Owners can transfer NFTs to other Stellar addresses.
- **Metadata Management**: Metadata is stored on-chain (name, description, URI).
- **Ownership Tracking**: The contract maintains a registry of owners.
- **Events**: Emits events for external tracking (minting, achievement minting, transfers, admin changes).
- **Access Control**: Implements roles (admin, minters) for privileged operations.

## Project Structure

The contract is organized into modules to facilitate maintenance and understanding:

- `lib.rs`: Contract entry point and public interface definition.
- `contract.rs`: Main implementation of Reputation NFT functionality.
- `storage.rs`: Data storage management.
- `events.rs`: Event emission.
- `access.rs`: Access control and authorization.
- `metadata.rs`: Metadata management.
- `types.rs`: Definition of data types, errors, and constants.
- `test.rs`: Tests to verify contract functionality.

## Compilation

To compile the contract:

```bash
cd contracts-offerhub
cargo build --target wasm32-unknown-unknown --release
```

The resulting WASM file will be in `target/wasm32-unknown-unknown/release/nft_contract.wasm`.

## Deployment on Testnet

1. Install Soroban CLI:

```bash
cargo install --locked soroban-cli
```

2. Configure the connection to testnet:

```bash
soroban config network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443/soroban/rpc \
  --network-passphrase "Test SDF Network ; September 2015"
```

3. Create an account (if you don't have one):

```bash
soroban config identity generate --global admin
soroban config identity address admin
```

4. Fund the account from friendbot:

```
curl "https://friendbot.stellar.org/?addr=$(soroban config identity address admin)"
```

5. Deploy the contract:

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nft_contract.wasm \
  --source admin \
  --network testnet
```

This will return a contract ID that will be used to interact with it.

## Usage Examples

### Initialize the Contract

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  init \
  --admin $(soroban config identity address admin)
```

### Mint an NFT

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  mint \
  --caller $(soroban config identity address admin) \
  --to $(soroban config identity address admin) \
  --token_id 1 \
  --name "My First NFT" \
  --description "An interesting description" \
  --uri "ipfs://QmExample123456789"
```

### Transfer an NFT

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  transfer \
  --from $(soroban config identity address admin) \
  --to <RECIPIENT_ADDRESS> \
  --token_id 1
```

### Query an NFT Owner

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  get_owner \
  --token_id 1
```

### Query NFT Metadata

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  get_metadata \
  --token_id 1
```

## Security

The contract implements various security mechanisms:

- Role-based access control
- Ownership verification for transfers
- Token existence validations
- Operation authentication

## Testing

The contract includes comprehensive tests to ensure all functionality works as expected. To run the tests:

```bash
cd contracts-offerhub
cargo test -p nft-contract
```

The test suite covers:

- Contract initialization
- NFT minting
- Transfer operations
- Metadata retrieval
- Access control
- Error handling

---
