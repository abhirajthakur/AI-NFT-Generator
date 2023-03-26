import { ethers } from "ethers";
import styles from "@/styles/Home.module.css";

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <nav className={styles.nav}>
      <div>
        <h1>AI NFT Generator</h1>
      </div>

      {account ? (
        <button type="button">
          {account.slice(0, 6)}...{account.slice(-4)}
        </button>
      ) : (
        <button type="button" onClick={connectHandler}>
          Connect Wallet
        </button>
      )}
    </nav>
  );
};

export default Navigation;
