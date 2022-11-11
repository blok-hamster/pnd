import { ethers } from "ethers";
import { config } from "../constants/index";
import sbtDomainFactoryABi from "../constance/sbtFactoryAbi.json";
import picardyDomainFactoryABi from "../constance/picardyDomainFactoryABi.json";
import { useState } from "react";
import dotenv from "dotenv";
dotenv.config();

export default function CreateDomain() {
  const [deafultAddress, setDeafultAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [domainAddress, setDomainAddress] = useState(null);
  const [sbtAddress, setSbtAddress] = useState(null);

  const connectwalletHandler = () => {
    if (window.Ethereum) {
      provider.send("eth_requestAccounts", []).then(async () => {
        await accountChangedHandler(provider.getSigner());
      });
    } else {
      setErrorMessage("Please Install Metamask!!!");
    }
  };

  // gets the default account, signer and balance
  const accountChangedHandler = async (newAccount) => {
    const address = await newAccount.getAddress();
    setSigner(newAccount);
    setDeafultAddress(address);
    const balance = await newAccount.getBalance();
    setUserBalance(ethers.utils.formatEther(balance));
    await getuserBalance(address);
  };

  //gets users eth balance
  const getuserBalance = async (address) => {
    const balance = await provider.getBalance(address, "latest");
  };

  const createSbtDomain = async (event) => {
    event.preventDeafult();
    const tldName = event.target.tldName;
    const symbol = event.target.symbol;
    const price = event.target.price;
    const buyingEnabled = event.target.buyingEnabled;

    const sbtFactory = new ethers.Contract(
      config.sbtFactoryAddress,
      sbtDomainFactoryABi,
      signer
    );
    const { 0: sbtAddress } = await sbtFactory.createTld(
      tldName,
      symbol,
      deafultAddress,
      price,
      buyingEnabled
    );
    setSbtAddress(sbtAddress);
  };

  const createDomain = async (event) => {
    event.preventDeafult();
    const tldName = event.target.tldName;
    const symbol = event.target.symbol;
    const price = event.target.price;
    const buyingEnabled = event.target.buyingEnabled;

    const domainFactory = new ethers.Contract(
      config.domainFactoryAddress,
      picardyDomainFactoryABi,
      signer
    );
    const { 0: domainAddress } = await domainFactory.createTld(
      tldName,
      symbol,
      deafultAddress,
      price,
      buyingEnabled
    );
    setDomainAddress(domainAddress);
  };

  return <div></div>;
}
