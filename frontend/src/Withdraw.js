import React from "react";
import {ethers} from "ethers";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";

export class Withdraw extends React.Component {

    state = {
        balanceEth: undefined,
        vendorBalanceBgc: undefined,
        vendorBalanceEth: undefined
    };

    componentDidMount() {
        this.update();
    }

    componentWillUnmount() {
        this.setState = () => {
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.bugCoin === undefined) {
            this.update();
        }
    }

    render() {
        if (!this.state.balanceEth ||
            !this.state.vendorBalanceBgc ||
            !this.state.vendorBalanceEth) {
            return <div></div>;
        }

        return <div className="d-flex align-items-center flex-column p-4">
            <p className="h3">Your ETH
                balance: {parseFloat(ethers.utils.formatEther(this.state.balanceEth)).toFixed(2)}</p>
            <p className="h3">Vendor BGC balance: {ethers.utils.formatEther(this.state.vendorBalanceBgc)}</p>
            <p className="h3">Vendor ETH balance: {ethers.utils.formatEther(this.state.vendorBalanceEth)}</p>

            <button type="submit" className="btn btn-primary"
                    onClick={() => this.withdraw()}>Withdraw
            </button>
        </div>
    }

    async update() {
        console.log("Updating Withdraw component");
        const {bugCoin} = this.props;

        if (bugCoin) {
            this.updateBalanceEth();
            this.updateVendorBgc();
            this.updateVendorEth();
        }
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

    withdraw() {
        const {vendor} = this.props;
        const withdrawPromise = vendor.withdraw()
            .then(tx => tx.wait());
        toast.promise(withdrawPromise, {
            pending: 'Withdraw transaction in progress',
            success: 'Withdraw transaction succeed 👌',
            error: 'Withdraw transaction failed 🤯'
        });
        withdrawPromise
            .then(_ => this.update());
    }

}