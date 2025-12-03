import express from "express";
import dotenv from "dotenv";
import { SwapSDK, Chains, Assets } from "@chainflip/sdk/swap";

dotenv.config();

const app = express();
app.use(express.json());

app.set('json replacer', (_, value) =>
  typeof value === 'bigint' ? value.toString() : value
);

const swapSDK = new SwapSDK({
  network: 'mainnet',
  enabledFeatures: { dca: true },
  broker: { url: 'http://broker:9944' },
});

// --- Get quotes ---
app.get("/quote", async (req, res) => {
  try {
    const amount = req.query.amount;
    console.log("Amount:", amount);
    const { quotes } = await swapSDK.getQuoteV2({
      srcChain: Chains.Bitcoin,
      srcAsset: Assets.BTC,
      destChain: Chains.Ethereum,
      destAsset: Assets.USDT,
      amount: amount,
    });
    const quote = quotes.find((quote) => quote.type === "REGULAR");
    res.json(quote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Create swap ---
app.post("/swap", async (req, res) => {
  try {
    const quote = req.body.quote;
    const swapDepositAddressRequest = {
      quote,
      destAddress: req.body.destAddress,
      fillOrKillParams: {
        refundAddress: req.body.refundAddress, // address to which assets are refunded
        retryDurationMinutes: quote.recommendedRetryDurationMinutes + 30, // use recommended retry duration from quote
        slippageTolerancePercent: quote.recommendedSlippageTolerancePercent + 0.5, // use recommended slippage tolerance from quote
        livePriceSlippageTolerancePercent:
          quote.recommendedLivePriceSlippageTolerancePercent + 0.5, // use recommended live price slippage tolerance from quote
      },
      brokerCommissionBps: 10, // 100 basis point = 1%, 10 bps = 0.1%
    };
    const swap = await swapSDK.requestDepositAddressV2(swapDepositAddressRequest);
    console.log(swap);
    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Fetch swap status ---
app.get("/swap/:id(*)", async (req, res) => {
  try {
    const id = req.params.id ? decodeURIComponent(req.params.id) : req.query.id;
    console.log("Lookup swap id:", id);
    if (!id) {
      return res.status(400).json({ error: "Missing swap id" });
    }
    const status = await swapSDK.getStatusV2({id});
    if (!status) {
      return res.status(404).json({ error: "Swap not found" });
    }
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
