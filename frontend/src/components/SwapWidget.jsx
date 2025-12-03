import React, { useEffect, useState } from "react";
import { sdk } from "../api/chainflip";

export default function SwapWidget() {
  const [chains, setChains] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await sdk.getChains();
        console.log("Chains:", result);
        setChains(result);
      } catch (err) {
        console.error(err);
        setError(err.toString());
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Chainflip Swap Test</h2>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h3>Available Chains:</h3>

      <ul>
        {chains.map((c) => (
          <li key={c.chainId}>
            {c.name} ({c.chainId})
          </li>
        ))}
      </ul>
    </div>
  );
}
