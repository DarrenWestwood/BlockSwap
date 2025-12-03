import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import "./App.css";

function Home() {
  const [amount, setAmount] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [refundAddress, setRefundAddress] = useState("");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapResult, setSwapResult] = useState(null);
  const navigate = useNavigate();

  // ------------------------------
  // Fetch quote when amount changes
  // ------------------------------
  useEffect(() => {
    let isMounted = true;

    const delayDebounce = setTimeout(() => {
      async function fetchQuote() {
        if (!amount || Number(amount) <= 0) {
          if (isMounted) setQuote(null);
          return;
        }

        setLoading(true);

        try {
          // const res = await fetch("/api/quote?fromAsset=BTC&toAsset=USDT&amount=" + amount);
          const res = await fetch(`/api/quote?amount=${encodeURIComponent((amount*1e8).toString())}`);
          const json = await res.json();
          if (isMounted) setQuote(json);
        } catch (err) {
          console.error("Quote error", err);
          if (isMounted) setQuote(null);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      fetchQuote();
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [amount]);

  // ------------------------------
  // Create Swap
  // ------------------------------
  async function createSwap() {
    const body = {
      quote,
      destAddress,
      refundAddress
    };

    const res = await fetch("/api/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    setSwapResult(json);
    if (json && json.depositChannelId) {
      redirectToSwap(json.depositChannelId);
    }
  }

  async function redirectToSwap(depositChannelId) {
    navigate('/swap/'+depositChannelId+'?amount='+quote.amount); // Redirect to swap page
  }

  const handleAmountChange = (event) => {
      let inputValue = event.target.value;
      const decimalRegex = /^\d*(?:\.\d{0,8})?$/;

      if (decimalRegex.test(inputValue)) {
        // Limit to 8 decimal places for BTC
        const parts = inputValue.split('.');
        if (parts.length > 1 && parts[1].length > 8) {
          inputValue = `${parts[0]}.${parts[1].substring(0, 8)}`;
        }
        setAmount(inputValue);
      }
  };

  return (
    <div className="container">

      <h1>BlockSwap</h1>
      <h3>BTC → USDT</h3>

      <div className="card">
        {/* Deposit input */}
        <div className="label-wrapper">
          <label>Deposit</label>
        </div>
        <div class="amount-wrapper">
          <input
            type="text"
            inputmode="decimal"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
          ></input>
          <div class="btc-text">BTC</div>
        </div>

        {/* Receive output */}
        <div className="label-wrapper" style={{ marginTop: '10px' }}>
          <label>Receive</label>
        </div>
        <div class="amount-wrapper">
          {loading && (
            <input
              type="text"
              placeholder="Loading quote..."
              readOnly={true}
            ></input>
          )}
          {!loading && !quote && (
            <input
              type="text"
              placeholder="0"
              readOnly={true}
            ></input>
          )}
          {!loading && quote && (
            <input
              type="text"
              value={quote.egressAmount/1e6}
              readOnly={true}
            ></input>
          )}
          <div class="usdt-text">USDT</div>
        </div>

      </div>
      <div className="card">
        {/* Refund and Destination Address inputs */}
        <div class="wrapper">
          <div class="icon">
            <svg fill="currentColor" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
              width="30px" height="30px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
            <g>
              <path d="M66.237,47.445c3.667-1.869,5.959-5.162,5.421-10.644c-0.723-7.494-7.193-10.003-15.36-10.715l-0.004-9.058
                c0.002-0.029,0.017-0.054,0.017-0.084c0-0.691-0.56-1.25-1.251-1.251h0h0h-3.812h0h0h-0.001v0c-0.69,0.001-1.249,0.56-1.249,1.25
                l0,0h-0.029l0.005,8.872c-1.664,0-3.364,0.033-5.052,0.068l-0.003-8.83c0.003-0.038,0.022-0.071,0.022-0.11
                c0-0.691-0.56-1.25-1.251-1.251h0h0h-3.812h0h0h-0.001v0c-0.69,0.001-1.249,0.56-1.249,1.25c0,0.001,0.001,0.002,0.001,0.003
                h-0.031l0.002,9.143c-1.37,0.028-2.715,0.057-4.027,0.057l-0.001-0.033h-8.726v0.013c-0.691,0-1.251,0.56-1.251,1.251v4.226
                c0,0.691,0.56,1.251,1.251,1.251c0.002,0,0.003-0.001,0.005-0.001v0.019c0,0,4.672-0.091,4.594-0.008
                c2.562,0.001,3.397,1.488,3.64,2.771l0.005,11.843l0.001,0.045l0.005,16.587c-0.112,0.806-0.586,2.093-2.376,2.096
                c0.081,0.071-4.599-0.001-4.599-0.001l-0.001,0.006c-0.008,0-0.014-0.005-0.022-0.005c-0.601,0-1.079,0.432-1.2,0.997l-0.051-0.003
                l-1.152,5.169l0.027,0.005c-0.005,0.046-0.027,0.086-0.027,0.134c0,0.664,0.522,1.195,1.176,1.236l-0.003,0.019l8.233-0.003
                c1.532,0,3.04,0.025,4.52,0.034l0.007,9.262h0.003c0,0.69,0.56,1.25,1.251,1.25l0,0l0,0h3.812l0,0l0,0h0.001
                c0.69-0.001,1.249-0.561,1.249-1.251l0,0h0.002l-0.004-9.149c1.735,0.035,3.414,0.048,5.054,0.044l0.002,9.106h0.003
                c0.001,0.69,0.56,1.25,1.25,1.25l0,0l0,0h3.812l0,0l0,0h0.001c0.69-0.001,1.249-0.561,1.249-1.251c0,0,0-0.001,0-0.001l0.008,0
                l-0.002-9.247c10.635-0.615,18.079-3.297,18.999-13.286C76.06,52.479,72.275,48.891,66.237,47.445z M45.072,33.32
                c3.571-0.002,14.789-1.142,14.793,6.312c0.001,7.148-11.218,6.318-14.789,6.32L45.072,33.32z M45.083,66.255L45.08,52.326
                c4.288,0,17.733-1.238,17.736,6.955C62.822,67.137,49.371,66.248,45.083,66.255z"/>
            </g>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Refund address"
            value={refundAddress}
            onChange={(e) => setRefundAddress(e.target.value)}
          ></input>
        </div>

        <div class="wrapper">
          <div class="icon">
            <svg fill="currentColor" style={{ marginLeft: '4px' }} width="23px" height="30px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Ethereum icon</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>
          </div>
          <input
            type="text"
            placeholder="Destination Addresss"
            value={destAddress}
            onChange={(e) => setDestAddress(e.target.value)}
          ></input>
        </div>

        {/* Swap button */}
        <button
          disabled={!quote || !amount || !refundAddress || !destAddress}
          onClick={createSwap}
        >
          Swap
        </button>
      </div>

      {/* Display swap error */}
      {swapResult && swapResult.error && (
        <div className="card">
          <div className="label-wrapper">
            <label>Swap Error</label>
          </div>
          <div className="amount-wrapper">
            <div className="deposit-address">{swapResult.error}</div>
          </div>
        </div>
      )}

      <p>Powered by <a href="https://chainflip.io/" target="_blank">Chainflip</a></p>
    </div>
  );
}

function Swap() {
  const { id } = useParams();
  const [swapStatus, setSwapStatus] = useState(null);
  const [swapEgressAmount, setSwapEgressAmount] = useState(null);

  const queryString = window.location.search; // Get the query string (e.g., ?product=45&category=electronics)
  const params = new URLSearchParams(queryString);
  const amount = params.get('amount'); // Get the value of the 'amount' parameter

  useEffect(() => {
    let intervalId;
    if (id) {
      intervalId = pollStatus();
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  async function pollStatus() {
    const pollInterval = 10000;
    let intervalId;

    async function getStatus() {
      try {
        const res = await fetch(`/api/swap/${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const json = await res.json();
        setSwapStatus(json);
        if (json && json.swapEgress && json.swapEgress.amount) {
          setSwapEgressAmount(json.swapEgress.amount);
        }else{
          fetchQuote();
        }
        // stop polling when state Completed or Failed
        if (json && (json.state === 'COMPLETED' || json.state === 'FAILED')) {
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }

    // initial call and start interval
    getStatus();
    intervalId = setInterval(getStatus, pollInterval);
    return intervalId;
  }

  async function fetchQuote() {
      if (!amount || Number(amount) <= 0) {
        return;
      }

      try {
        const res = await fetch(`/api/quote?amount=${encodeURIComponent((amount).toString())}`);
        const json = await res.json();
        setSwapEgressAmount(json.egressAmount);
      } catch (err) {
        console.error("Quote error", err);
        setSwapEgressAmount(null);
      }
    }

  return (
    <div className="container">

      <h1>BlockSwap</h1>
      <h3>BTC → USDT</h3>

      <div className="card" style={{ opacity: (swapStatus && (swapStatus.state === 'WAITING' || swapStatus.state === 'RECEIVING' || swapStatus.state === 'SWAPPING')) ? 1 : 0.5 }}>
        {/* Deposit input */}
        <div className="label-wrapper">
          <label>Send</label>
        </div>
        <div class="amount-wrapper">
          <input
            type="text"
            placeholder="0"
            value={amount ? amount/1e8 : ''}
            readOnly={true}
          ></input>
          <div class="btc-text">BTC</div>
        </div>

        {/* Display deposit address (if present) */}
        <div className="label-wrapper" style={{ marginTop: '10px' }}>
          <label>Address</label>
        </div>
        <div class="wrapper">
          <div class="icon">
            <svg fill="currentColor" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
              width="30px" height="30px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
            <g>
              <path d="M66.237,47.445c3.667-1.869,5.959-5.162,5.421-10.644c-0.723-7.494-7.193-10.003-15.36-10.715l-0.004-9.058
                c0.002-0.029,0.017-0.054,0.017-0.084c0-0.691-0.56-1.25-1.251-1.251h0h0h-3.812h0h0h-0.001v0c-0.69,0.001-1.249,0.56-1.249,1.25
                l0,0h-0.029l0.005,8.872c-1.664,0-3.364,0.033-5.052,0.068l-0.003-8.83c0.003-0.038,0.022-0.071,0.022-0.11
                c0-0.691-0.56-1.25-1.251-1.251h0h0h-3.812h0h0h-0.001v0c-0.69,0.001-1.249,0.56-1.249,1.25c0,0.001,0.001,0.002,0.001,0.003
                h-0.031l0.002,9.143c-1.37,0.028-2.715,0.057-4.027,0.057l-0.001-0.033h-8.726v0.013c-0.691,0-1.251,0.56-1.251,1.251v4.226
                c0,0.691,0.56,1.251,1.251,1.251c0.002,0,0.003-0.001,0.005-0.001v0.019c0,0,4.672-0.091,4.594-0.008
                c2.562,0.001,3.397,1.488,3.64,2.771l0.005,11.843l0.001,0.045l0.005,16.587c-0.112,0.806-0.586,2.093-2.376,2.096
                c0.081,0.071-4.599-0.001-4.599-0.001l-0.001,0.006c-0.008,0-0.014-0.005-0.022-0.005c-0.601,0-1.079,0.432-1.2,0.997l-0.051-0.003
                l-1.152,5.169l0.027,0.005c-0.005,0.046-0.027,0.086-0.027,0.134c0,0.664,0.522,1.195,1.176,1.236l-0.003,0.019l8.233-0.003
                c1.532,0,3.04,0.025,4.52,0.034l0.007,9.262h0.003c0,0.69,0.56,1.25,1.251,1.25l0,0l0,0h3.812l0,0l0,0h0.001
                c0.69-0.001,1.249-0.561,1.249-1.251l0,0h0.002l-0.004-9.149c1.735,0.035,3.414,0.048,5.054,0.044l0.002,9.106h0.003
                c0.001,0.69,0.56,1.25,1.25,1.25l0,0l0,0h3.812l0,0l0,0h0.001c0.69-0.001,1.249-0.561,1.249-1.251c0,0,0-0.001,0-0.001l0.008,0
                l-0.002-9.247c10.635-0.615,18.079-3.297,18.999-13.286C76.06,52.479,72.275,48.891,66.237,47.445z M45.072,33.32
                c3.571-0.002,14.789-1.142,14.793,6.312c0.001,7.148-11.218,6.318-14.789,6.32L45.072,33.32z M45.083,66.255L45.08,52.326
                c4.288,0,17.733-1.238,17.736,6.955C62.822,67.137,49.371,66.248,45.083,66.255z"/>
            </g>
            </svg>
          </div>
          <input
            type="text"
            value={swapStatus ? swapStatus.depositChannel.depositAddress : ''}
          ></input>
        </div>
        <div className="deposit-address">{swapStatus 
          && (swapStatus.state == 'WAITING'
          || swapStatus.state == 'RECEIVING'
          || swapStatus.state == 'SWAPPING')
            ? swapStatus.state 
            : ''}
        </div>

        {/* <div className="amount-wrapper">
          <div className="deposit-address">{swapStatus ? swapStatus.depositChannel.depositAddress : ''}</div>
        </div> */}

      </div>

      {/* Receive output */}
      <div className="card" style={{ opacity: (swapStatus && (swapStatus.state === 'SENDING' || swapStatus.state === 'SENT' || swapStatus.state === 'COMPLETED')) ? 1 : 0.5 }}>
        <div className="label-wrapper">
          <label>Receive</label>
        </div>
        <div class="amount-wrapper" style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="0"
            value={swapEgressAmount ? (swapEgressAmount/1e6) : ''}
            readOnly={true}
          ></input>
          <div class="usdt-text">USDT</div>
        </div>
        <div className="label-wrapper" style={{ marginTop: '10px' }}>
          <label>Address</label>
        </div>
        <div class="wrapper">
          <div class="icon">
            <svg fill="currentColor" style={{ marginLeft: '4px' }} width="23px" height="30px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Ethereum icon</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>
          </div>
          <input
            type="text"
            placeholder="Destination Addresss"
            value={swapStatus ? swapStatus.destAddress : ''}
          ></input>
        </div>
        <div className="deposit-address">{swapStatus 
          && (swapStatus.state == 'SENDING'
          || swapStatus.state == 'SENT'
          || swapStatus.state == 'COMPLETED')
            ? swapStatus.state 
            : ''}
        </div>
      </div>

      <p>Powered by <a href="https://chainflip.io/" target="_blank">Chainflip</a></p>
    </div>
  );
}
export default function App() {
  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/swap/:id" element={<Swap />} />
      </Routes>
    </>
  );
}
