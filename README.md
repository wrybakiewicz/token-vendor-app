# Token Vendor App

Quest from: https://github.com/scaffold-eth/scaffold-eth-challenges challenge-2-token-vendor

## How to run on localhost
- `make node`
- `make compile deploy_local`
- setup local the graph node: `https://thegraph.academy/developers/local-development/` (change in docker-compose.yml etherium variable address to ip received from running setup.sh)
- `make deploy_graph`
- from ./frontend `npm install` `npm start`

## How to run on rinkeby
- add .env file with `RINKEBY_RPC_URL` `MNEMONIC` `ETHERSCAN_API_KEY`
- `make compile deploy_rinkeby`
- verify contracts using scripts from console