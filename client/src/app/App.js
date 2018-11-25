import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import propertyABI from "../contracts/Property.json";
import propertyTokenABI from "../contracts/PropertyToken.json";
import "./styles/App.css";
import UserDropdown from "./components/UserDropdown.jsx";
import CreateProperty from "./components/CreateProperty.jsx";
import PropertyCards from "./components/PropertyCards.jsx";

const deployContract = async (web3, json, account, ...args) => {
  const { abi, bytecode } = json;

  const Contract = new web3.eth.Contract(abi, {
    from: account,
    gas: 250000
  });

  const instance = await Contract.deploy({
    data: bytecode,
    arguments: args
  }).send({ from: account, gas: 6721975, gasPrice: "2000000000" });

  return instance;
};

class App extends Component {
  state = {
    accounts: [],
    web3: {},
    currentAccount: null,
    propertyContract: {},
    properties: []
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      const propertyContract = await deployContract(
        web3,
        propertyABI,
        accounts[0],
        "Property Token",
        "PROP"
      );

      const propertyTokenContract = await deployContract(
        web3,
        propertyTokenABI,
        accounts[0],
        "CryptoBNB",
        "CBNB",
        18
      );

      console.log(propertyTokenContract);

      // .on('transactionHash', function(transactionHash){ console.log(transactionHash) })

      const cb = (err, res) => {
        if (err) console.log("watch error", err);
        else console.log("got an event", res);
      };

      propertyContract.events.Transfer(cb);
      propertyContract.events.Approval(cb);
      propertyContract.events.ApprovalForAll(cb);

      propertyTokenContract.events.Mint(cb);
      propertyTokenContract.events.Approval(cb);
      propertyTokenContract.events.Transfer(cb);

      propertyTokenContract.methods
        .mint(accounts[0], 10000 * (10 ^ 18))
        .send({ from: accounts[0], gas: 6721975, gasPrice: "2000000000" });

      this.setState({
        web3,
        currentAccount: accounts[0],
        accounts,
        propertyContract,
        propertyTokenContract
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  handleUserDropdownChange = event => {
    this.setState({ currentAccount: event.target.value });
  };

  handleCreateProperty = async URI => {
    const createPropertyTX = await this.state.propertyContract.methods
      .createProperty()
      .send({
        from: this.state.currentAccount,
        gas: 250000
      });
    const tokenId = createPropertyTX.events.Transfer.returnValues._tokenId;
    let property = {
      owner: this.state.currentAccount,
      tokenId
    };
    if (URI) {
      await this.state.propertyContract.methods
        .setURI(parseInt(tokenId), URI)
        .send({
          from: this.state.currentAccount,
          gas: 250000
        });
      property.URI = URI;
    }
    this.setState({ properties: [...this.state.properties, property] });
  };

  handlePropertyRegisterClick = (_, tokenId) => {};

  render() {
    return (
      <>
        <h1>Hello World</h1>
        <UserDropdown
          accounts={this.state.accounts}
          handleUserDropdownChange={this.handleUserDropdownChange}
        />
        <CreateProperty
          handleCreateProperty={this.handleCreateProperty}
          currentAccount={this.state.currentAccount}
        />
        <PropertyCards
          properties={this.state.properties}
          handlePropertyRegisterClick={this.handlePropertyRegisterClick}
        />
      </>
    );
  }
}

export default App;
