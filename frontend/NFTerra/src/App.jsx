import { useState, useCallback } from "react";
import WalletConnect from "./components/WalletConnect";
import { getContract, getReadOnlyContract } from "./blockchain/contract";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [level, setLevel] = useState(null);
  const [tokenId, setTokenId] = useState("0");
  const [status, setStatus] = useState("");
  const [minting, setMinting] = useState(false);
  const [levelingUp, setLevelingUp] = useState(false);

  // Fetch level for a given token
  const fetchLevel = useCallback(async (id) => {
    try {
      const contract = await getReadOnlyContract();
      const lvl = await contract.levels(id);
      setLevel(lvl.toString());
    } catch {
      setLevel(null);
    }
  }, []);

  // Mint a new NFT
  async function handleMint() {
    setMinting(true);
    setStatus("");
    try {
      const contract = await getContract();
      const tx = await contract.mintNFT("ipfs://example-metadata");
      setStatus("Minting… waiting for confirmation");
      await tx.wait();

      // Read new token counter to know what was minted
      const counter = await contract.tokenCounter();
      const mintedId = (Number(counter) - 1).toString();
      setTokenId(mintedId);
      setStatus(`NFT #${mintedId} minted successfully!`);
      await fetchLevel(mintedId);
    } catch (err) {
      console.error(err);
      setStatus("Minting failed: " + (err.reason || err.message));
    } finally {
      setMinting(false);
    }
  }

  // Level up the current token
  async function handleLevelUp() {
    setLevelingUp(true);
    setStatus("");
    try {
      const contract = await getContract();
      const tx = await contract.levelUp(tokenId);
      setStatus("Leveling up… waiting for confirmation");
      await tx.wait();
      await fetchLevel(tokenId);
      setStatus(`NFT #${tokenId} leveled up!`);
    } catch (err) {
      console.error(err);
      setStatus("Level up failed: " + (err.reason || err.message));
    } finally {
      setLevelingUp(false);
    }
  }

  // Check level on demand
  async function handleCheckLevel() {
    setStatus("");
    await fetchLevel(tokenId);
  }

  const walletConnected = !!account;

  return (
    <div className="app">
      <h1 className="title">NFTerra Dynamic NFT</h1>

      <WalletConnect account={account} onConnect={setAccount} />

      {walletConnected && (
        <div className="card">
          {/* Token ID selector */}
          <div className="token-select">
            <label htmlFor="tokenId">Token ID</label>
            <input
              id="tokenId"
              type="number"
              min="0"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={handleCheckLevel}>
              Check Level
            </button>
          </div>

          {/* Actions */}
          <div className="actions">
            <button className="btn btn-mint" onClick={handleMint} disabled={minting}>
              {minting ? "Minting…" : "Mint NFT"}
            </button>

            <button className="btn btn-level" onClick={handleLevelUp} disabled={levelingUp}>
              {levelingUp ? "Leveling Up…" : "Level Up NFT"}
            </button>
          </div>

          {/* Level display */}
          {level !== null && (
            <div className="level-display">
              <span className="level-label">NFT #{tokenId} Level</span>
              <span className="level-value">{level}</span>
            </div>
          )}
        </div>
      )}

      {/* Status bar */}
      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default App;