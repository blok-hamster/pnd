import axios from "axios";
import { config } from "../constants/index";
import sbtFactroyAbi from "../constants/sbtFactoryAbi";
import sbtDomainAbi from "../constants/sbtDomainAbi";
import { useState, useEffect } from "react";

export default function VerifyProof(tld) {
  const [deafultAddress, setDeafultAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [verified, setVerified] = useState(null);

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

  const verifyZkProof = async (event) => {
    event.preventDeafult();

    const proof = event.target.proof.value;
    const data = JSON.parse(proof);

    const sbtFactory = new ethers.Contract(
      config.sbtFactoryAddress,
      sbtFactroyAbi,
      signer
    );

    const sbtAddress = await sbtFactory.tldNamesAddress(tld);
    const sbtDomain = new ethers.Contract(sbtAddress, sbtDomainAbi, signer);
    const checkNullifier = await sbtDomain.nullifierExixt(data.nullifier);

    if (checkNullifier) {
      response = await axios.post(
        `https://localhost:5000/zk/verifyProof`,
        data.proof,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.verified == 1) {
        setVerified(true);
      } else {
        setVerified(false);
      }
    } else {
      setVerified(false);
    }
  };

  return <div></div>;
}
