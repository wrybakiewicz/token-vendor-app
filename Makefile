.PHONY: test

accounts:
	npx hardhat accounts

compile:
	npx hardhat compile

#Localhost
node:
	npx hardhat node --no-deploy --hostname 0.0.0.0

deploy_graph:
	$(MAKE) -C subgraph deploy_local

test:
	npx hardhat test

deploy_local:
	npx hardhat deploy --network localhost --export-all ./frontend/src/contracts/contracts.json

#Rinkeby
deploy_rinkeby:
	npx hardhat deploy --network rinkeby --export-all ./frontend/src/contracts/contracts.json