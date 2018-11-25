import React, { Component } from "react";

class UserDropdown extends Component {
  render() {
    return (
        <label htmlFor="userDropdown">
            Select an Account to Use
            <select 
                name="userDropdown" 
                id="userDropdown"
                onChange={this.props.handleUserDropdownChange}
                value={this.props.currentAccount}
            >
                {
                    this.props.accounts.map(account => (
                        <option key={account} value={account}>{account}</option>
                    ))
                }
            </select>
        </label>
    )
  }
}

export default UserDropdown;