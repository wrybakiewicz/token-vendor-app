import React from "react";

import BugCoinArtifact from "./contracts/BugCoin.json";
import contractAddress from "./contracts/contract-address.json";
import {ethers} from "ethers";

const NETWORK_ID = '31337';

export class Dapp extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.initialState = {
            selectedAddress: undefined,
            bugCoin: undefined,
        };

        this.state = this.initialState;
    }

    componentDidMount() {
        this._connectWallet();
    }

    render() {
        if (window.ethereum === undefined) {
            return <h2>Install ethereum wallet wallet</h2>;
        }

        if (!this.state.selectedAddress) {
            return (
                <div>Connect your Metamask with HardHat network</div>
            );
        }

        if (!this.state.bugCoin) {
            return <div>Loading...</div>;
        }

        return <div>Loaded</div>
    }

    async _connectWallet() {
        const addresses = await window.ethereum.request({method: 'eth_requestAccounts'});
        const selectedAddress = addresses[0];

        if (!this._checkNetwork()) {
            return;
        }
        this._initialize(selectedAddress);

        window.ethereum.on("accountsChanged", ([newAddress]) => {
            if (newAddress === undefined) {
                return this._resetState();
            }

            this._initialize(newAddress);
        });

        window.ethereum.on("chainChanged", ([_]) => {
            this._resetState();

        });
    }

    _checkNetwork() {
        console.log(window.ethereum.networkVersion);
        return window.ethereum.networkVersion === NETWORK_ID;

    }

    _initialize(userAddress) {
        console.log("User address: " + userAddress);
        this.setState({
            selectedAddress: userAddress,
        });
        this._intializeEthers();
    }

    async _intializeEthers() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const bugCoin = new ethers.Contract(
            contractAddress.BugCoin,
            BugCoinArtifact.abi,
            provider.getSigner(0)
        );
        this.setState({bugCoin: bugCoin, provider: provider});
    }

    _resetState() {
        this.setState(this.initialState);
        this._connectWallet();
    }

    showActive(value) {
        if (value) {
            return "active";
        }
        return "";
    }

}