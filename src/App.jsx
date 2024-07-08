import { useEffect, useState } from "react";

import "./App.css";
import { fetchKLineData, fetchTradingPairDetails } from "../api/bitmart";

import CryptoToTrend from "./components/CryptoToTrend";

function App() {
  const [btcDetails, setbtcDetails] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accountBalance, setAccountBalance] = useState(null);
  const tradingPairs = ["XRP_USDT", "BCH", "LTC", "BNB_USDT", "SOL_USDT"];

  const pair = tradingPairs[currentIndex];

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchTradingPairDetails(pair);
      setbtcDetails(data?.data);
    }, 3000); // Récupère les données toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tradingPairs.length);
    }, 10000); // Change l'index toutes les 10 secondes

    return () => clearInterval(interval);
  }, [tradingPairs.length]);

  useEffect(() => {
    const loadAccountBalance = async () => {
      const data = await fetchKLineData(pair);
      setAccountBalance(data);
    };

    loadAccountBalance();
  }, []);

  return (
    <>
      <div>My Bot is running locally</div>

      <div>
        <div>
          <CryptoToTrend pair={pair} />
          <div>
            <h2>Wallet Balance</h2>
            {accountBalance?.wallet?.map((wallet, index) => {
              return (
                <div key={index}>
                  <h4>
                    {wallet?.available} <span>{wallet?.currency}</span>{" "}
                  </h4>
                </div>
              );
            })}
            <div></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
