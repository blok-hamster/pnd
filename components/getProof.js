import { useState, useEffect, useContext } from "react";
import { DomainContext } from "../context/context";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import sbtDomainAbi from "../constants/sbtDomainAbi.json";
import sbtFactoryAbi from "../constants/sbtFactoryAbi.json";
import { config } from "../constants";

const tld = ".picardy";

const GetProof = () => {
  const { address } = useAccount();
  const userDomainName = useContext(DomainContext);
  const [requestId, setRequestId] = useState("");
  const [nullifier, setNullifier] = useState("");
  const [proof, setProof] = useState("");
  const [sbtTld, setSbtTld] = useState("");
  const [fulfilled, setFulfilled] = useState(false);
  const [proofMessage, setProofMessage] = useState("");

  const domainName = userDomainName.mintedName;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const sbtFactory = new ethers.Contract(
    config.sbtFactoryAddress,
    sbtFactoryAbi,
    signer
  );

  //This is used to request for a random number
  const requestRandomNumber = async (e) => {
    e.preventDefault();

    const requestRandomTx = await sbtFactory.requestRandomNumber(3);
    const requestRecipt = await requestRandomTx.wait();
    const event = await requestRecipt.events.find(
      (event) => event.event === "RequestSent"
    );
    const requestId = event.args.requestId;
    setRequestId(requestId);
  };

  // simple calculation to get proof Input: TODO: update zk circuit
  const circuitInput = (randNums) => {
    let proofInput = [];
    const num = randNums[0] + randNums[1] + randNums[2];
    const sqr = num * num;
    proofInput.push(num, sqr);
    return { input: proofInput };
  };

  const confirmRandomNumber = async (e) => {
    e.preventDefault();
    if (!checkFulfilled(requestId)) {
      console.log("not fulfilled");
    } else {
      const confirm = await sbtFactory.confirmRandNumber(
        requestId,
        domainName,
        tld
      );
      const confirmRecipt = await confirm.wait();
    }
  };

  const getProof = async (e) => {
    e.preventDefault();
    const { 0: randomNumbers, 1: nullifier } = await sbtFactory.randDetails(
      requestId,
      domainName,
      tld
    );
    setNullifier(nullifier);
    const body = circuitInput(randomNumbers);
    const response = await axios.post(
      "http://localhost:8080/zk/generateProof",
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

  //this checks that the random request Has been fulfilled
  const checkFulfilled = async (e) => {
    e.preventDefault();
    setFulfilled[await sbtFactory.checkFulfilled(requestId)];
  };

  return (
    <div>
      <h1>Hello Get</h1>
    </div>
  );
};

export default GetProof;
