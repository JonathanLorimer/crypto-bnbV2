import React, { Component } from "react";

class PropertyCards extends Component {
  state = {};

  curryHandlerWithState = (fn, state) => event => fn(event, state);

  render() {
    return (
      <>
        {this.props.properties.map(property => (
          <div key={property.tokenId}>
            {property.URI ? <img src={property.URI} alt="Property" /> : null}
            <div>Property Owner: {property.owner}</div>
            <div>Property Token: {property.tokenId}</div>
            <button
              onClick={this.curryHandlerWithState(
                this.props.handlePropertyRegisterClick,
                property.tokenId
              )}
            >
              Add to Property Registry
            </button>
          </div>
        ))}
      </>
    );
  }
}

export default PropertyCards;
