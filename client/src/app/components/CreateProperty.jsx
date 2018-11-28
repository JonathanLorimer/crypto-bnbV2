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
      <div className="create-property">
        <h4
          className="create-property-title"
          aria-label="Create property for User"
        >
          Create Property for {this.props.currentAccount}
        </h4>
        <label className="create-label" htmlFor="propertyUrl">
          Url with Property Details
          <input
            className="field create-field"
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
          className="btn property-btn"
        >
          Create Property
        </button>
        {this.state.loading ? (
          <p>Generating...</p>
        ) : (
          <button className="btn uri-btn" onClick={this.generateURI}>
            Generate URI
          </button>
        )}
      </div>
    );
  }
}

export default UserDropdown;
