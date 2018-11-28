import React, { Component } from "react";

class PropertyRegistryCards extends Component {
  state = {};

  curryHandlerWithState = (fn, ...state) => event => fn(event, ...state);

  render() {
    return (
      <div className="property-registry-cards">
        <h2 className="prop-card-title">Property Registry</h2>
        <div className="prop-card-flex">
          {this.props.registryProperties.map(property => (
            <div className="property-card" key={property.tokenId}>
              {property.URI ? (
                <img
                  className="property-image"
                  src={property.URI}
                  alt="Property"
                />
              ) : null}
              <div className="prop-price">Property Price: {property.price}</div>
              <div className="prop-token">
                Property Token ID: {property.tokenId}
              </div>
              <button
                onClick={this.curryHandlerWithState(
                  this.props.handleRequestStayClick,
                  property.tokenId
                )}
                className="btn"
                disabled={property.requested}
              >
                Request Stay
              </button>
              {property.requested ? (
                <button
                  onClick={this.curryHandlerWithState(
                    this.props.handleApproveStayClick,
                    property.tokenId
                  )}
                  className="btn"
                  disabled={
                    this.props.currentAccount !== property.owner ||
                    property.approved
                  }
                >
                  Approve Stay
                </button>
              ) : null}
              {property.approved ? (
                <button
                  onClick={this.curryHandlerWithState(
                    this.props.handleCheckInClick,
                    property.tokenId
                  )}
                  className="btn"
                  disabled={
                    this.props.currentAccount !== property.requested ||
                    property.occupied
                  }
                  // TODO: Add Check for checkin date and checkout date
                >
                  Check-In
                </button>
              ) : null}
              {property.occupied ? (
                <button
                  onClick={this.curryHandlerWithState(
                    this.props.handleCheckOutClick,
                    property.tokenId
                  )}
                  className="btn"
                  disabled={this.props.currentAccount !== property.occupied}
                  // TODO: Add Check for checkin date and checkout date
                >
                  Check-Out
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default PropertyRegistryCards;
