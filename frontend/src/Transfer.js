import React from "react";
import {ethers} from "ethers";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";

export class Transfer extends React.Component {

    state = {
        balance: undefined,
        transferTo: "",
        amount: ""
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
    }

    render() {
        if (!this.state.balance) {
            return <div></div>;
        }

        return <div className="d-flex align-items-center flex-column p-4">
            <p className="h3">Your balance: {ethers.utils.formatEther(this.state.balance)} BGC</p>
            <div className="form-group p-4">
                <label>Transfer to</label>
                <input type="string" className="form-control" placeholder="Transfer to"
                       value={this.state.transferTo}
                       onChange={e => this.setState({transferTo: e.target.value})}/>
                <label>Amount</label>
                <input type="number" className="form-control" placeholder="Amount"
                       value={this.state.amount}
                       onChange={e => this.setState({amount: e.target.value})}/>
            </div>
            <button type="submit" className="btn btn-primary" disabled={this.sendDisabled()}
                    onClick={() => this.send()}>Send
            </button>
        </div>
    }

    async update() {
        console.log("Updating Balance component");
        const {bugCoin} = this.props;

        if (bugCoin) {
            this.updateBalance();
        }
    }

    updateBalance() {
        const {bugCoin, selectedAddress} = this.props;
        bugCoin.balanceOf(selectedAddress).then(balance => this.setState({balance: balance}));
    }

    sendDisabled() {
        return !this.state.amount
            || this.state.amount <= 0
            || !this.state.transferTo;
    }

    send() {
        const {bugCoin} = this.props;
        const amount = ethers.utils.parseEther(this.state.amount);
        const transferPromise = bugCoin.transfer(this.state.transferTo, amount)
            .then(tx => tx.wait());
        toast.promise(transferPromise, {
            pending: 'Transfer transaction in progress',
            success: 'Transfer transaction succeed 👌',
            error: 'Transfer transaction failed 🤯'
        });
        transferPromise
            .then(_ => this.setState({transferTo: "", amount: ""}))
            .then(_ => this.update());
    }

}