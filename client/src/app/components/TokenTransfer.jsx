import React, { Component } from "react";

class TokenTransfer extends Component {
  render() {
    return (
      <div className="token-transfer">
        <h4 className="transfer-title">Transfer Tokens</h4>
        <form onSubmit={this.props.handleTokenTransferSubmit}>
          <input
            className="field"
            required
            type="text"
            name="tokenAmount"
            placeholder="Amount"
          />
          <input className="field" required list="toAccount" name="account" />
          <datalist id="toAccount">
            {this.props.accounts.map(account => (
              <option key={account} value={account} />
            ))}
          </datalist>
          <button className="btn" type="submit" value="submit">
            Transfer Tokens
          </button>
        </form>
        <p className="balance">
          Your Account's Property Token Balance:
          {this.props.loadingBalance
            ? "loading..."
            : this.props.currentAccountBalance}
        </p>
      </div>
    );
  }
}

export default TokenTransfer;
