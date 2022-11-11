import { ethers } from "ethers";
import { config } from "../constants/index";
import sbtDomainABi from "../constance/sbtDomainAbi.json";
import domainAbi from "../constance/picardyDomainAbi.json";
import { useState, useEffect } from "react";
import dotenv from "dotenv";
dotenv.config();

export default function EditDomainDetails() {
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

  const data = () => {
    return {
      fields: [],
      tldContract: null,
    };
  };

  //Data should be an object, and would be stringified to parse tothe contract
  //Data contains the data stored in the domain contract
  const editData = async (event) => {
    event.preventDeafult();

    const data = event.target.data;
    const domainName = event.target.domainName;

    // Stringify data to send to contract
    const dataStr = JSON.stringify(data);
    const tldAddress = await domainFactory.tldNamesAddresses(tld);
    const domainContract = new ethers.Contract(tldAddress, domainAbi, signer);
    const edit = await domainContract.editData(domainName, dataStr);
  };

  return <div></div>;
}
