import axios from "axios";
import { ethers } from "ethers";
import { config } from "../constants/index";
import sbtFactroyAbi from "../constants/sbtFactoryAbi";
import sbtDomainAbi from "../constants/sbtDomainAbi";
import randomNumberGenAbi from "../constants/randomNumberGenAbi";
import { useState, useEffect } from "react";

export default function GetProof(tld) {
  const [deafultAddress, setDeafultAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [nullifier, setNullifier] = useState(null);
  const [proof, setProof] = useState(null);

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

  const getZkProof = async (event) => {
    event.preventDeafult();

    const domainName = event.target.domainName.value;
    const sbtFactory = new ethers.Contract(
      config.sbtFactoryAddress,
      sbtFactroyAbi,
      signer
    );

    //const sbtAddress = await sbtFactory.tldNamesAddress(tld);
    //const sbtDomain = new ethers.Contract(sbtAddress, sbtDomainAbi, signer);

    const requestRandomTx = await sbtFactory
      .requestRandomNumber(3)
      .then((res) => {
        requestRandomTx.wait(2);
        setRequestId(res);
        console.log(requestRandomTx.transactionHash);
      })
      .catch((err) => {
        console.log(err);
      });

    // User can call this function once
    const { 0: randNumbers, 1: nullifier } = await sbtFactory.getRandNumber(
      requestId,
      domainName,
      tld
    );

    setNullifier(nullifier);
    const body = circuitInput(randNumbers);
    const response = await axios.post(
      `https://localhost:5000/zk/generateProof`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const message = response.message;
    const result = { nullifier: nullifier, proof: response.proof };
    setProof(JSON.stringify(result));
  };

  // simple calculation to get proof Input: TODO: update zk circuit
  const circuitInput = (randNums) => {
    let proofInput = [];
    const num = randNumbers[1] + randNumbers[2] + randNumbers[3];
    const sqr = num * num;
    proofInput.push(num, sqr);
    return { input: proofInput };
  };

  return <div></div>;
}
