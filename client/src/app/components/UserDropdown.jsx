import React, { Component } from "react";

class UserDropdown extends Component {
  render() {
    return (
      <label className="userDropdown" htmlFor="userDropdown">
        Select an Account to Use
        <select
          className="select-dropdown"
          name="userDropdown"
          id="userDropdown"
          onChange={this.props.handleUserDropdownChange}
          value={this.props.currentAccount}
        >
          {this.props.accounts.map(account => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </select>
      </label>
    );
  }
}

export default UserDropdown;
