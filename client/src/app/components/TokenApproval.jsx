import React, { Component } from "react";

class TokenApproval extends Component {
  render() {
    return (
      <div className="token-approval">
        <h4 className="token-approval-title">Approve Address to Use Tokens</h4>
        <form onSubmit={this.props.handleTokenApprovalSubmit}>
          <input
            className="field"
            required
            type="text"
            name="approvalAmount"
            placeholder="Amount"
          />
          <input
            className="field"
            required
            list="approveAccount"
            name="account"
          />
          <datalist id="approveAccount">
            {this.props.accounts
              .concat([this.props.registryContractAddress])
              .map(account => (
                <option key={account} value={account} />
              ))}
          </datalist>
          <button className="btn approve-btn" type="submit" value="submit">
            Approve Address to Access Tokens
          </button>
        </form>
      </div>
    );
  }
}

export default TokenApproval;
