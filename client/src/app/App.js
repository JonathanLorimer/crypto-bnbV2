// Libraries
import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import { BigNumber } from "bignumber.js";

// Contract ABI's
import propertyABI from "../contracts/Property.json";
import propertyTokenABI from "../contracts/PropertyToken.json";
import propertyRegistryABI from "../contracts/PropertyRegistry.json";

// Styles
import "./styles/App.css";

// Components
import UserDropdown from "./components/UserDropdown.jsx";
import CreateProperty from "./components/CreateProperty.jsx";
import PropertyTokenCards from "./components/PropertyTokenCards.jsx";
import PropertyRegistryCards from "./components/PropertyRegistryCards.jsx";
import TokenTransfer from "./components/TokenTransfer.jsx";
import TokenApproval from "./components/TokenApproval.jsx";

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
    properties: [],
    registryProperties: [],
    web3: {},
    currentAccount: null,
    currentAccountBalance: null,
    loadingBalance: false,
    loadingProperties: false,
    propertyContract: {},
    propertyTokenContract: {}
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      /* 
        Deploy Contracts on Load
        Note: Would not have to do this if contract was deployed to a net
        In the future should hardcode contract addresses for interaction
       */
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

      const propertyRegistryContract = await deployContract(
        web3,
        propertyRegistryABI,
        accounts[0],
        propertyContract._address,
        propertyTokenContract._address
      );

      // Event Listeners
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

      propertyRegistryContract.events.Registered(cb);
      propertyRegistryContract.events.Approved(cb);
      propertyRegistryContract.events.Requested(cb);
      propertyRegistryContract.events.CheckIn(cb);
      propertyRegistryContract.events.CheckOut(cb);

      // Initializing State
      const totalTokens = new BigNumber(10000 * 10 ** 18);

      propertyTokenContract.methods
        .mint(accounts[0], web3.utils.numberToHex(totalTokens))
        .send({ from: accounts[0], gas: 6721975, gasPrice: "2000000000" });

      const currentAccountBalance = await propertyTokenContract.methods
        .balanceOf(accounts[0])
        .call()
        .then(res => (res / 10 ** 18).toString());

      const propertyTokens = await propertyContract.methods
        .getAllTokens()
        .call();

      const propertiesArray = await Promise.all(
        propertyTokens.map(id =>
          propertyRegistryContract.methods
            .getPropertyDetails(id)
            .call()
            .then(details => {
              return details
                ? { price: details[0], URI: details[1], tokenId: id }
                : null;
            })
        )
      );

      const registryProperties = propertiesArray.filter(e => e);
      this.setState({
        web3,
        currentAccount: accounts[0],
        currentAccountBalance,
        accounts,
        registryProperties,
        propertyContract,
        propertyTokenContract,
        propertyRegistryContract
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  // Event Handlers
  handleUserDropdownChange = async event => {
    this.setState({ currentAccount: event.target.value, loadingBalance: true });
    const currentAccountBalance = await this.state.propertyTokenContract.methods
      .balanceOf(event.target.value)
      .call()
      .then(res => (res / 10 ** 18).toString());
    this.setState({ currentAccountBalance, loadingBalance: false });
  };

  handleCreateProperty = async URI => {
    const createPropertyTX = await this.state.propertyContract.methods
      .createProperty()
      .send({
        from: this.state.currentAccount,
        gas: 250000
      });
    const tokenId = createPropertyTX.events.Transfer.returnValues._tokenId;

    await this.state.propertyContract.methods
      .setURI(parseInt(tokenId), URI)
      .send({
        from: this.state.currentAccount,
        gas: 250000
      });

    this.setState({
      properties: [
        ...this.state.properties,
        {
          owner: this.state.currentAccount,
          tokenId,
          URI
        }
      ]
    });
  };

  handleTokenTransferSubmit = async event => {
    event.preventDefault();
    const amount = event.target.tokenAmount.value;
    const toAccount = event.target.account.value;
    await this.state.propertyTokenContract.methods
      .transferFrom(
        this.state.currentAccount,
        toAccount,
        this.state.web3.utils.numberToHex(new BigNumber(amount * 10 ** 18))
      )
      .send({
        from: this.state.currentAccount,
        gas: 6721975,
        gasPrice: "2000000000"
      });

    console.log(this.state.currentAccountBalance);
    console.log(amount);
    const newBalance =
      parseInt(this.state.currentAccountBalance) - parseInt(amount);
    this.setState({
      currentAccountBalance: newBalance.toString()
    });
  };

  handleTokenApprovalSubmit = async event => {
    event.preventDefault();
    const toAccount = event.target.account.value;
    const approvalAmount = this.state.web3.utils.numberToHex(
      new BigNumber(event.target.approvalAmount.value * 10 ** 18)
    );
    await this.state.propertyTokenContract.methods
      .approve(toAccount, approvalAmount)
      .send({
        from: this.state.currentAccount,
        gas: 6721975,
        gasPrice: "2000000000"
      });
  };

  handlePropertyRegisterClick = async (event, tokenId, URI) => {
    event.preventDefault();
    const unformattedPrice = event.target.price.value;
    const price = this.state.web3.utils.numberToHex(
      new BigNumber(unformattedPrice * 10 ** 18)
    );
    await this.state.propertyRegistryContract.methods
      .registerProperty(tokenId, price, URI)
      .send({
        from: this.state.currentAccount,
        gas: 6721975,
        gasPrice: "2000000000"
      });
    this.setState({
      registryProperties: [
        ...this.state.registryProperties,
        {
          price: unformattedPrice,
          URI,
          tokenId,
          owner: this.state.currentAccount
        }
      ]
    });
  };

  handleRequestStayClick = async (event, tokenId) => {
    // TODO: Add input field to handle picking your own dates
    event.preventDefault();
    let now = Math.floor(new Date().getTime() / 1000) - 100;
    let tomorrow = now + 86400; //60s * 60m * 24hr

    await this.state.propertyRegistryContract.methods
      .requestStay(tokenId, now, tomorrow)
      .send({
        from: this.state.currentAccount,
        gas: 6721975,
        gasPrice: "2000000000"
      });

    const newProperties = this.state.registryProperties.map(property => {
      if (property.tokenId === tokenId)
        property.requested = this.state.currentAccount;
      return property;
    });

    this.setState({ registryProperties: newProperties });
  };

  handleApproveStayClick = async (event, tokenId) => {
    // TODO: Add input field to handle picking your own dates
    event.preventDefault();
    await this.state.propertyRegistryContract.methods
      .approveRequest(tokenId)
      .send({
        from: this.state.currentAccount,
        gas: 6721975,
        gasPrice: "2000000000"
      });
    const newProperties = this.state.registryProperties.map(property => {
      if (property.tokenId === tokenId) property.approved = true;
      return property;
    });

    this.setState({ registryProperties: newProperties });
  };

  handleCheckInClick = async (event, tokenId) => {
    // TODO: Check Dates
    event.preventDefault();
    await this.state.propertyRegistryContract.methods.checkIn(tokenId).send({
      from: this.state.currentAccount,
      gas: 6721975,
      gasPrice: "2000000000"
    });
    const newProperties = this.state.registryProperties.map(property => {
      if (property.tokenId === tokenId)
        property.occupied = this.state.currentAccount;
      return property;
    });

    this.setState({ registryProperties: newProperties });
  };

  handleCheckOutClick = async (event, tokenId) => {
    // TODO: Check Dates
    event.preventDefault();
    await this.state.propertyRegistryContract.methods.checkOut(tokenId).send({
      from: this.state.currentAccount,
      gas: 6721975,
      gasPrice: "2000000000"
    });
    const newProperties = this.state.registryProperties.map(property => {
      let { URI, owner, price } = property;
      if (property.tokenId === tokenId)
        property = { URI, owner, price, tokenId: property.tokenId };
      return property;
    });

    this.setState({ registryProperties: newProperties });
  };

  render() {
    return (
      <>
        <div className="hero-image">
          <h1 className="title">Crypto BnB</h1>
        </div>
        <UserDropdown
          accounts={this.state.accounts}
          handleUserDropdownChange={this.handleUserDropdownChange}
        />
        <div className="userDetails">
          <TokenApproval
            accounts={this.state.accounts}
            registryContractAddress={
              this.state.propertyRegistryContract
                ? this.state.propertyRegistryContract._address
                : null
            }
            handleTokenApprovalSubmit={this.handleTokenApprovalSubmit}
          />
          <TokenTransfer
            loadingBalance={this.state.loadingBalance}
            currentAccountBalance={this.state.currentAccountBalance}
            accounts={this.state.accounts}
            handleTokenTransferSubmit={this.handleTokenTransferSubmit}
          />
        </div>

        <CreateProperty
          handleCreateProperty={this.handleCreateProperty}
          currentAccount={this.state.currentAccount}
        />
        <PropertyTokenCards
          properties={this.state.properties}
          handlePropertyRegisterClick={this.handlePropertyRegisterClick}
        />
        <PropertyRegistryCards
          registryProperties={this.state.registryProperties}
          handleRequestStayClick={this.handleRequestStayClick}
          handleApproveStayClick={this.handleApproveStayClick}
          handleCheckInClick={this.handleCheckInClick}
          handleCheckOutClick={this.handleCheckOutClick}
          currentAccount={this.state.currentAccount}
        />
      </>
    );
  }
}

export default App;
