import React from "react";

import contracts from "./contracts/contracts.json";

import {ethers} from "ethers";
import {Balance} from "./Balance";
import {Transfer} from "./Transfer";
import {Vendor} from "./Vendor";

const NETWORK_ID = '31337';

export class Dapp extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.initialState = {
            selectedAddress: undefined,
            bugCoin: undefined,
            vendor: undefined,
            balanceActive: true,
            transferActive: false,
            vendorActive: false
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

        if (!this.state.bugCoin || !this.state.vendor) {
            return <div>Loading...</div>;
        }

        return <div className="container p-4">
            <div className="row">
                <div className="col-12">
                    <ul className="nav nav-tabs justify-content-center">
                        <li className="nav-item">
                            <a className={"nav-link " + this.showActive(this.state.balanceActive)}
                               onClick={() => this.setState({
                                   balanceActive: true,
                                   transferActive: false,
                                   vendorActive: false
                               })} href="#">Balance</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link " + this.showActive(this.state.transferActive)}
                               onClick={() => this.setState({
                                   balanceActive: false,
                                   transferActive: true,
                                   vendorActive: false
                               })} href="#">Transfer</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link " + this.showActive(this.state.vendorActive)}
                               onClick={() => this.setState({
                                   balanceActive: false,
                                   transferActive: false,
                                   vendorActive: true
                               })} href="#">Vendor</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="row">
                <div className="col-12 ">
                    <div>
                        {this.state.balanceActive && (<Balance bugCoin={this.state.bugCoin}
                                                               selectedAddress={this.state.selectedAddress}/>)}
                        {this.state.transferActive && (<Transfer bugCoin={this.state.bugCoin}
                                                                 selectedAddress={this.state.selectedAddress}/>)}
                        {this.state.vendorActive && (<Vendor bugCoin={this.state.bugCoin}
                                                             provider={this.state.provider}
                                                             vendor={this.state.vendor}
                                                             selectedAddress={this.state.selectedAddress}/>)}
                    </div>
                </div>
            </div>

        </div>;
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
        return window.ethereum.networkVersion === NETWORK_ID;

    }

    _initialize(userAddress) {
        console.log("User address: " + userAddress);
        this.setState({
            selectedAddress: userAddress,
        });
        this._intializeEthers();
    }

    _intializeEthers() {
        const ethereum = window.ethereum
        const provider = new ethers.providers.Web3Provider(ethereum);
        this.setState({provider: provider});
        this._initializeBugCoin(provider, ethereum);
        this._initializeVendor(provider, ethereum);
    }

    _initializeBugCoin(provider, ethereum) {
        const bugCoinContract = contracts[ethereum.networkVersion][0].contracts.BugCoin;
        const bugCoin = new ethers.Contract(
            bugCoinContract.address,
            bugCoinContract.abi,
            provider.getSigner(0)
        );
        this.setState({bugCoin: bugCoin});
    }

    _initializeVendor(provider, ethereum) {
        const vendorContract = contracts[ethereum.networkVersion][0].contracts.Vendor;
        const vendor = new ethers.Contract(
            vendorContract.address,
            vendorContract.abi,
            provider.getSigner(0)
        );
        this.setState({vendor: vendor});
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