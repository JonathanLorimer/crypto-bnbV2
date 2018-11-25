import React, { Component } from "react";

class UserDropdown extends Component {
  state = {
    URI: "",
    loading: false
  };
  generateURI = () => {
    this.setState({ loading: true });
    fetch("https://source.unsplash.com/1600x900/?property,building,house").then(
      res => {
        this.setState({ URI: res.url, loading: false });
      }
    );
  };
  handleURIChange = event => {
    this.setState({ URI: event.target.value });
  };
  handleCreatePropertyClick = () => {
    this.props.handleCreateProperty(this.state.URI);
    this.setState({ URI: "" });
  };

  render() {
    return (
      <>
        <h1 aria-label="Create property for User">
          Create Property for {this.props.currentAccount}
        </h1>
        <label htmlFor="propertyUrl">
          Url with Property Details
          <input
            type="url"
            name="propertyUrl"
            placeholder="Property Url"
            value={this.state.URI}
            onChange={this.handleURIChange}
          />
        </label>
        <button
          onClick={this.handleCreatePropertyClick}
          onKeyPress={this.clearGeneratedURI}
        >
          Create Property
        </button>
        {this.state.loading ? (
          <p>Generating...</p>
        ) : (
          <button onClick={this.generateURI}>Generate URI</button>
        )}
      </>
    );
  }
}

export default UserDropdown;
