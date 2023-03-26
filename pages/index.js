import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { ethers } from "ethers";
import { NFTStorage, File } from "nft.storage";
import { Buffer } from "buffer";
import axios from "axios";
import { abi, nftAddress } from "@/constants";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [nft, setNft] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(null);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    if (network != 5) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }], // chainId must be in HEX with 0x in front
      });
    }

    const nft = new ethers.Contract(nftAddress, abi, provider);
    setNft(nft);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(e.target.value);

    const imageData = await generateImage(e);

    const url = await uploadImageToIPFS(imageData); // returns the tokenURI
    await mintNFT(url);

    console.log("Success!");
  };

  const generateImage = async (e) => {
    e.preventDefault();
    console.log("Generating Image....");

    const URL =
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";

    const response = await axios({
      url: URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY}`,
      },
      data: JSON.stringify({
        inputs: description,
        options: {
          wait_for_model: true,
        },
      }),
      responseType: "arraybuffer",
    });

    console.log(response);

    const type = response.headers["content-type"];
    const data = response.data;

    const base64data = Buffer.from(data).toString("base64");
    const image = `data:${type};base64,` + base64data;
    setImage(image);

    return data;
  };

  const uploadImageToIPFS = async (imageData) => {
    console.log("Uploading Image....");

    // Create instance of NFT.Storage
    const nftstorage = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
    });

    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    });

    // Save the URL
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;
    setUrl(url);

    return url;
  };

  const mintNFT = async (tokenURI) => {
    console.log("Waiting for mint....");

    const signer = await provider.getSigner();
    const tx = await nft.connect(signer).mint(tokenURI, {
      value: ethers.utils.parseEther("1"),
    });
    await tx.wait();
  };

  useEffect(() => {
    loadBlockchainData();
    ethereum.on("accountsChanged", async (accounts) => {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  }, [account]);

  return (
    <>
      <Head>
        <title>AI NFT Generator</title>
        <meta
          name="description"
          content="This site can create and mint a NFT of AI generated image associated with the prompt entered by the user"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <Navigation account={account} setAccount={setAccount} />
        <div className={styles.form}>
          <form>
            <input
              type="text"
              placeholder="Create a name...."
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Create a description...."
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
            <div>
              <input type="submit" value="Create" onClick={generateImage} />
              <input type="submit" value="Mint" onClick={submitHandler} />
            </div>
          </form>

          <div className={styles.image}>
            {image && (
              <Image
                src={image}
                alt="AI generated image"
                width={450}
                height={450}
              />
            )}

            {url && (
              <p>
                View &nbsp;
                <a href={url} target="_blank">
                  Metadata
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
