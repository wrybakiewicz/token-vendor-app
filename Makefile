.PHONY: test

accounts:
	npx hardhat accounts

compile:
	npx hardhat compile

#Localhost
node:
	npx hardhat node --no-deploy

test:
	npx hardhat test

deploy_local:
	npx hardhat deploy --network localhost --export-all ./frontend/src/contracts/contracts.json