import axios from "axios";
import { ethers } from "ethers";
import { config } from "../constants/index";
import sbtFactoryAbi from "../constants/sbtFactoryAbi";
import sbtDomainAbi from "../constants/sbtDomainAbi";
import { useState, useEffect } from "react";

export default function VerifyProof(tld) {
  const [provider, setProvider] = useState(null);
  const [sbtFactory, setSbtFactory] = useState(null);
  const [sbtTlds, setSbtTlds] = useState(null);
  const [verified, setVerified] = useState(null);

  useEffect(async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_MUMBAI_ENDPOINT
    );
    setProvider(provider);

    const newSbtFactory = new ethers.Contract(
      config.sbtFactoryAddress,
      sbtFactoryAbi,
      provider
    );
    setSbtFactory(newSbtFactory);

    await newSbtFactory.getTldsArray().then((res) => {
      setSbtTlds(res);
    });
  }, []);

  const verifyZkProof = async (event) => {
    event.preventDeafult();

    const proof = event.target.proof.value;
    const data = JSON.parse(proof);

    const sbtAddress = await sbtFactory.tldNamesAddress(tld);
    const sbtDomain = new ethers.Contract(sbtAddress, sbtDomainAbi, provider);
    const checkNullifier = await sbtDomain.nullifierExixt(data.nullifier);

    if (checkNullifier) {
      response = await axios.post(
        `https://localhost:8080/zk/verifyProof`,
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
}
