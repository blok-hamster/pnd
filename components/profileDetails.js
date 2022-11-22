import { ethers } from "ethers";
import { config } from "../constants/index";
import { useState } from "react";
import domainResolverAbi from "../constants/domainResolver.json";
import sbtResolverAbi from "../constants/sbtResolver.json";
import dotenv from "dotenv";
dotenv.config();

export default function ProfileDetails() {
  const [deafultAddress, setDeafultAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [sbtDomains, setSbtDomains] = useState([]);
  const [domains, setDeafultDomains] = useState([]);

  const isBrowser = typeof window !== "undefined";

  const connectwalletHandler = () => {
    if (isBrowser) {
      if (window.Ethereum) {
        provider.send("eth_requestAccounts", []).then(async () => {
          await accountChangedHandler(provider.getSigner());
        });
      } else {
        setErrorMessage("Please Install Metamask!!!");
      }
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

  const domainResolver = new ethers.Contract(
    config.domainResolverAddress,
    domainResolverAbi,
    signer
  );
  const sbtResolver = new ethers.Contract(
    config.sbtResolverAddress,
    sbtResolverAbi,
    signer
  );

  // gets all domains and their uri
  const getDomainProfileDetails = async (event) => {
    event.preventDeafult();

    // Returns an array of domain names an address has
    const defaultDomain = await domainResolver.getDefaultDomains(
      deafultAddress
    );
    const defaultDomainArr = defaultDomain.split(" ");
    const domainDetails = await getDeafultDomains(defaultDomainArr);

    const domainUriArr = await getDomainUri(domainDetails);
    setDeafultDomains(domainUriArr);
  };

  // gets all sbt domains and their uri
  const getSbtProfileDetails = async (event) => {
    event.preventDeafult();

    // Returns an array of SBT domain names an address has
    const deafultSbtDomains = await sbtResolver.getDefaultDomains(
      deafultAddress
    );
    const defaultSbtDomainsArr = deafultSbtDomains.split(" ");
    const sbtDomainDetails = await getDeafultDomains(defaultSbtDomainsArr);
    //setSbtDomains(sbtDomainDetails);

    const domainUriArr = await getSbtDomainUri(sbtDomainDetails);
    setSbtDomains(domainUriArr);
  };

  // converts the array of string to an array of objects containing the domain name and tld
  const getDeafultDomains = async (deafultDomains) => {
    let domainDetailsArr = [];
    for (i = 0; i < deafultDomains.length; i++) {
      let domainDetails = {
        domainName: "",
        tld: "",
      };
      const domain = deafultDomains[i];
      const splitArr = domain.split(".");
      const domainName = splitArr[0];
      const tld = "." + splitArr[1];

      domainDetails.domainName = domainName;
      domainDetails.tld = tld;
      domainDetailsArr.push(domainDetails);
    }

    return domainDetailsArr;
  };

  //this function get the images of all domains
  const getDomainUri = async (domainDetailsArr) => {
    let domainDetails = [];
    for (i = 0; i < domainDetailsArr.length; i++) {
      let newDomainDetails = {
        domainName: "",
        tld: "",
        image: "",
      };
      const domainDetail = domainDetailsArr[i];

      //this is where the image is gotten from
      const domainUri = await domainResolver.getDomainTokenUri(
        domainDetail.domainName,
        domainDetail.tld
      );
      const domainImage = window.atob(domainUri.substring(29));
      const result = JSON.parse(domainImage);

      newDomainDetails.domainName = domainDetail.domainName;
      newDomainDetails.tld = domainDetail.tld;
      newDomainDetails.image = result.image;

      domainDetails.push(newDomainDetails);
    }

    return domainDetails;
  };

  //this function get the images of all domains
  const getSbtDomainUri = async (domainDetailsArr) => {
    let domainUris = [];
    for (i = 0; i < domainDetailsArr.length; i++) {
      const domainDetails = domainDetailsArr[i];

      //this is where the image is gotten from
      const domainUri = await sbtResolver.getDomainTokenUri(
        domainDetails.domainName,
        domainDetails.tld
      );
      const domainImage = window.atob(domainUri.substring(29));
      const result = JSON.parse(domainImage);
      domainUris.push(result.image);
    }

    return domainUris;
  };

  //edit domains
  return <div></div>;
}
