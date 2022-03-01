import React from "react";

import contracts from "./contracts/contracts.json";

import {ethers} from "ethers";
import {Balance} from "./Balance";
import {Transfer} from "./Transfer";
import {Vendor} from "./Vendor";
import {Withdraw} from "./Withdraw";
import _ from 'underscore';

const NETWORK_ID = '4';

export class Dapp extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.initialState = {
            selectedAddress: undefined,
            bugCoin: undefined,
            vendor: undefined,
            balanceActive: true,
            transferActive: false,
            vendorActive: false,
            withdrawActive: false,
            showWithdraw: true
        };

        this.state = this.initialState;
    }

    componentDidMount() {
        this._connectWallet();
    }

    componentWillUnmount() {
        this.setState = () => {
        };
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
                                   vendorActive: false,
                                   withdrawActive: false
                               })} href="#">Balance</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link " + this.showActive(this.state.transferActive)}
                               onClick={() => this.setState({
                                   balanceActive: false,
                                   transferActive: true,
                                   vendorActive: false,
                                   withdrawActive: false
                               })} href="#">Transfer</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link " + this.showActive(this.state.vendorActive)}
                               onClick={() => this.setState({
                                   balanceActive: false,
                                   transferActive: false,
                                   vendorActive: true,
                                   withdrawActive: false
                               })} href="#">Vendor</a>
                        </li>
                        {this.renderWithdraw()}
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
                        {this.state.withdrawActive && (<Withdraw bugCoin={this.state.bugCoin}
                                                                 provider={this.state.provider}
                                                                 vendor={this.state.vendor}
                                                                 selectedAddress={this.state.selectedAddress}/>)}
                    </div>
                </div>
            </div>

        </div>;
    }

    renderWithdraw() {
        if (this.state.showWithdraw) {
            return <li className="nav-item">
                <a className={"nav-link " + this.showActive(this.state.withdrawActive)}
                   onClick={() => this.setState({
                       balanceActive: false,
                       transferActive: false,
                       vendorActive: false,
                       withdrawActive: true
                   })} href="#">Withdraw</a>
            </li>;
        }
    }

    _connectWallet() {
        if (!this._checkNetwork()) {
            return;
        }
        this._initialize();

        window.ethereum.on("accountsChanged", ([_]) => {
            this._resetState();
        });

        window.ethereum.on("chainChanged", ([_]) => {
            this._resetState();

        });
    }

    _checkNetwork() {
        return window.ethereum.networkVersion === NETWORK_ID;

    }

    async _initialize() {
        const addresses = await window.ethereum.request({method: 'eth_requestAccounts'});
        const selectedAddress = addresses[0];
        console.log("User address: " + selectedAddress);
        const initializeEthers = await this._intializeEthers(selectedAddress);
        const state = _.extend({}, initializeEthers, {selectedAddress: selectedAddress});
        this.setState(state);
    }

    _intializeEthers(selectedAddress) {
        const ethereum = window.ethereum
        const provider = new ethers.providers.Web3Provider(ethereum);
        const initializeBugCoin = this._initializeBugCoin(provider, ethereum);
        return this._initializeVendor(provider, ethereum, selectedAddress).then(initializeVendor =>
            _.extend({}, initializeBugCoin, initializeVendor, {provider: provider})
        );
    }

    _initializeBugCoin(provider, ethereum) {
        const bugCoinContract = contracts[ethereum.networkVersion][0].contracts.BugCoin;
        const bugCoin = new ethers.Contract(
            bugCoinContract.address,
            bugCoinContract.abi,
            provider.getSigner(0)
        );
        return {bugCoin: bugCoin};
    }

    _initializeVendor(provider, ethereum, selectedAddress) {
        const vendorContract = contracts[ethereum.networkVersion][0].contracts.Vendor;
        const vendor = new ethers.Contract(
            vendorContract.address,
            vendorContract.abi,
            provider.getSigner(0)
        );
        return this.updateWithdrawActive(vendor, selectedAddress)
            .then(updateWithdrawActive => _.extend({}, updateWithdrawActive, {vendor: vendor}));
    }

    _resetState() {
        console.log("Reset state");
        this.setState(this.initialState);
        this._initialize();
    }

    showActive(value) {
        if (value) {
            return "active";
        }
        return "";
    }

    updateWithdrawActive(vendor, selectedAddress) {
        return vendor.owner()
            .then(owner => {
                if (owner.toLowerCase() === selectedAddress) {
                    return {showWithdraw: true};
                } else {
                    return {showWithdraw: false};
                }
            });
    }

}