import {ethers} from "ethers";
import {config} from "../constants/index";
import {useState} from "react";
import domainResolverAbi from "../constants/domainResolver.json";
import sbtResolverAbi from "../constants/sbtResolver.json";
import dotenv from "dotenv";
dotenv.config();

export default function ProfileDetails(tld) {

  const [deafultAddress, setDeafultAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [defaultDomain, setDeafultDomain] = useState(null);
  const [domainUri, setDomainUri]  = useState(null);
  const [domainData, setDomainData] = useState(null);

  const connectwalletHandler = () => {
    if (window.Ethereum) {
        provider.send("eth_requestAccounts", []).then(async () => {
            await accountChangedHandler(provider.getSigner());
        })
    } else {
        setErrorMessage("Please Install Metamask!!!");
    }
  }

  // gets the default account, signer and balance
  const accountChangedHandler = async (newAccount) => {
    const address = await newAccount.getAddress();
    setSigner(newAccount);
    setDeafultAddress(address);
    const balance = await newAccount.getBalance()
    setUserBalance(ethers.utils.formatEther(balance));
    await getuserBalance(address)
  }

  //gets users eth balance
  const getuserBalance = async (address) => {
    const balance = await provider.getBalance(address, "latest")
  }

  const domainResolver = new ethers.Contract(config.domainResolverAddress, domainResolverAbi, signer);
  const sbtResolver = new ethers.Contract(config.sbtResolverAddress, sbtResolverAbi, signer);

  const getProfileDetails = async (event) => {
    event.preventDeafult();
  //deafult domain
    const defaultDomain = await domainResolver.getDefaultDomain(deafultAddress, tld);
    setDeafultDomain(defaultDomain);
  //this is where the image is gotten from
    const domainUri = await domainResolver.getDomainTokenUri(defaultDomain, tld);
    const domainImage = window.atob(domainUri.substring(29));
    const result = JSON.parse(domainImage);
    setDomainUri(result.image);

    //this returns a stringified version of the data stored on the domain
    const domainData = await domainResolver.getDomainData(defaultDomain, tldl);
    setDomainData(domainData);
  }

  //edit domains
    return (
      <div >
        
      </div>
    )
  }