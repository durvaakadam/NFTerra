import { useState } from "react";

export default function WalletConnect({ account, onConnect }) {
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this dApp.");
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      onConnect(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  }

  if (account) {
    return (
      <div className="wallet-info">
        <span className="wallet-dot" />
        Connected: {account.slice(0, 6)}...{account.slice(-4)}
      </div>
    );
  }

  return (
    <button className="btn btn-connect" onClick={handleConnect} disabled={connecting}>
      {connecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
