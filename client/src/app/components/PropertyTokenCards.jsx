import React, { Component } from "react";

class PropertyTokenCards extends Component {
  state = {};

  curryHandlerWithState = (fn, ...state) => event => fn(event, ...state);

  render() {
    return (
      <div className="property-token-cards">
        <h2 className="prop-card-title">Property Tokens</h2>
        <div className="prop-card-flex">
          {this.props.properties.map(property => (
            <div className="property-card" key={property.tokenId}>
              {property.URI ? (
                <img
                  className="property-image"
                  src={property.URI}
                  alt="Property"
                />
              ) : null}
              <div className="prop-owner">Property Owner: {property.owner}</div>
              <div className="prop-token">
                Property Token: {property.tokenId}
              </div>
              <form
                onSubmit={this.curryHandlerWithState(
                  this.props.handlePropertyRegisterClick,
                  property.tokenId,
                  property.URI
                )}
              >
                <input
                  className="field"
                  type="text"
                  name="price"
                  placeholder="price"
                />
                <button className="btn prop-btn">
                  Add to Property Registry
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default PropertyTokenCards;
