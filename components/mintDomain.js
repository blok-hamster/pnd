import { ethers } from "ethers";
import { config } from "../constants/index";
import sbtDomainABi from "../constance/sbtDomainAbi.json";
import sbtDomainFactoryABi from "../constance/sbtFactoryAbi.json";
import picardyDomainFactoryABi from "../constance/picardyDomainFactoryABi.json";
import domainAbi from "../constance/picardyDomainAbi.json";
import { useState, useEffect } from "react";
import dotenv from "dotenv";
dotenv.config();

// This component mints the different types of domain
export default function MintDomains() {
  const [deafultAddress, setDeafultAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [sbtFactory, setSbtFactory] = useState(null);
  const [domainFactory, setDomainFactory] = useState(null);
  const [tlds, setTlds] = useState([]);
  const [sbtTlds, setSbtTlds] = useState([]);

  //gets all the created domains and sbtDomain names and stores in an array
  useEffect(async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_MUMBAI_ENDPOINT
    );
    const newSbtFactory = new ethers.Contract(
      config.sbtFactoryAddress,
      sbtDomainFactoryABi,
      provider
    );
    setSbtFactory(newSbtFactory);
    const newDomainFactory = new ethers.Contract(
      config.domainFactoryAddress,
      picardyDomainFactoryABi,
      provider
    );
    setDomainFactory(newDomainFactory);

    const sbtAddresses = await newSbtFactory.getTldsArray().then((res) => {
      setSbtTlds(res);
    });

    const tldAddresses = await newDomainFactory.getTldsArray().then((res) => {
      setTlds(res);
    });
  }, []);

  // connects metamask
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

  //mints the soul bound domain to specified soul wallet
  const mintSbtDomain = async (event) => {
    event.preventDeafult();

    const name = event.target.name;
    const sbtTld = event.target.tld;
    const soulWallet = event.target.soulWallet;
    const tldAddress = await sbtFactory.tldNamesAddresses(sbtTld);

    const sbtDomainContract = new ethers.Contract(
      tldAddress,
      sbtDoaminAbi,
      signer
    );
    const mint = await sbtDomainContract.mint(name, soulWallet);
    const recipt = await mint.wait();
    const txHash = await recipt.hash;
  };

  //mints the reguler domain to user address.
  const mintDomain = async (event) => {
    event.preventDeafult();

    const name = event.target.name;
    const tld = event.target.tld;
    const tldAddress = await domainFactory.tldNamesAddresses(tld);

    const domainContract = new ethers.Contract(tldAddress, domainAbi, signer);
    const mint = await sbtDomainContract.mint(name, deafultAddress);
    const recipt = await mint.wait();
    const txHash = await recipt.hash;
  };

  return <div></div>;
}
