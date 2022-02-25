import React from "react";
import {ethers} from "ethers";
import 'react-toastify/dist/ReactToastify.css';

export class Balance extends React.Component {

    state = {
        balance: undefined,
        requestedBalance: undefined,
        requestedBalanceInput: ""
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
        if (!this.state.balance) {
            return <div></div>;
        }

        return <div className="d-flex align-items-center flex-column p-4">
            <p className="h3">Your balance: {ethers.utils.formatEther(this.state.balance)} BGC</p>
            <div className="form-group p-4">
                <label>Request Balance</label>
                <input type="string" className="form-control" placeholder="Request Balance"
                       value={this.state.requestedBalanceInput}
                       onChange={e => this.requestBalance(e.target.value)}/>
            </div>
            {this.renderRequestedBalance()}
        </div>
    }

    renderRequestedBalance() {
        if(this.state.requestedBalance) {
            return <p className="h3">Requested Balance: {ethers.utils.formatEther(this.state.requestedBalance)} BGC</p>
        }
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

    requestBalance(address) {
        this.setState({requestedBalanceInput: address});
        const {bugCoin} = this.props;
        bugCoin.balanceOf(address)
            .then(balance => this.setState({requestedBalance: balance}))
            .catch(_ => this.setState({requestedBalance: ""}));
    }

}