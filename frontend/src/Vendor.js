import React from "react";
import {ethers} from "ethers";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";

export class Vendor extends React.Component {

    state = {
        balanceBgc: undefined,
        balanceEth: undefined,
        vendorBalanceBgc: undefined,
        vendorBalanceEth: undefined,
        vendorBgcEthPrice: undefined,
        amountBgcToBuy: "",
        amountEthToPay: ""
    };

    componentDidMount() {
        this.update();
    }

    componentWillUnmount() {
        this.setState = () => {
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.bugCoin === undefined || (prevProps.selectedAddress !== this.props.selectedAddress)) {
            this.update();
        }
        if(prevState.amountBgcToBuy !== this.state.amountBgcToBuy) {
            this.updateAmountEthToPay();
        }
    }

    render() {
        if (!this.state.balanceBgc ||
            !this.state.balanceEth ||
            !this.state.vendorBalanceBgc ||
            !this.state.vendorBalanceEth ||
            !this.state.vendorBgcEthPrice) {
            return <div></div>;
        }

        return <div className="d-flex align-items-center flex-column p-4">
            <p className="h3">Your BGC balance: {ethers.utils.formatEther(this.state.balanceBgc)}</p>
            <p className="h3">Your ETH
                balance: {parseFloat(ethers.utils.formatEther(this.state.balanceEth)).toFixed(2)}</p>
            <p className="h3">Vendor BGC balance: {ethers.utils.formatEther(this.state.vendorBalanceBgc)}</p>
            <p className="h3">Vendor ETH balance: {ethers.utils.formatEther(this.state.vendorBalanceEth)}</p>
            <p className="h3">BGC/ETH price: {this.state.vendorBgcEthPrice.toNumber()}</p>
            <div className="form-group p-4">
                <p className="h5">Buy BGC</p>
                <label>Amount</label>
                <input type="number" className="form-control" placeholder="Amount"
                       value={this.state.amountBgcToBuy}
                       onChange={e => this.setState({amountBgcToBuy: e.target.value})}/>
                <p className="h6 p-2">ETH to pay: {this.state.amountEthToPay}</p>
            </div>
            <button type="submit" className="btn btn-primary"
                    onClick={() => this.buy()}>Buy
            </button>
        </div>
    }

    async update() {
        console.log("Updating Vendor component");
        const {bugCoin} = this.props;

        if (bugCoin) {
            this.updateBalanceBgc();
            this.updateBalanceEth();
            this.updateVendorBgc();
            this.updateVendorEth();
            this.updateVendorBgcEth();
        }
    }

    updateBalanceBgc() {
        const {bugCoin, selectedAddress} = this.props;
        bugCoin.balanceOf(selectedAddress).then(balanceBgc => this.setState({balanceBgc: balanceBgc}));
    }

    updateBalanceEth() {
        const {provider, selectedAddress} = this.props;
        provider.getBalance(selectedAddress)
            .then(balanceEth => this.setState({balanceEth: balanceEth}));
    }

    updateVendorBgc() {
        const {bugCoin, vendor} = this.props;
        bugCoin.balanceOf(vendor.address).then(vendorBalanceBgc => this.setState({vendorBalanceBgc: vendorBalanceBgc}));
    }

    updateVendorEth() {
        const {provider, vendor} = this.props;
        provider.getBalance(vendor.address).then(vendorBalanceEth => this.setState({vendorBalanceEth: vendorBalanceEth}));
    }

    updateVendorBgcEth() {
        const {vendor} = this.props;
        vendor.bugCoinPerEth().then(vendorBgcEthPrice => this.setState({vendorBgcEthPrice: vendorBgcEthPrice}));
    }

    updateAmountEthToPay() {
        console.log("Updating amount eth to pay");
        this.setState({amountEthToPay: this.state.amountBgcToBuy / this.state.vendorBgcEthPrice});
    }

    buy() {
        const {vendor} = this.props;
        const amount = ethers.utils.parseEther(this.state.amountEthToPay.toString());
        const buyPromise = vendor.buy({value: amount})
            .then(tx => tx.wait());
        toast.promise(buyPromise, {
            pending: 'Buy transaction in progress',
            success: 'Buy transaction succeed 👌',
            error: 'Buy transaction failed 🤯'
        });
        buyPromise
            .then(_ => this.setState({amountBgcToBuy: ""}))
            .then(_ => this.update());
    }

}