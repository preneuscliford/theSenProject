import { useEffect, useState } from "react";

import "./App.css";
import {
  fetchAccountBalance,
  fetchBtcUsdtDetails,
  fetchCurrentPosition,
  fetchKLineData,
  placeOrder,
} from "../api/bitmart";
import TradeBtcUsdt from "./components/TradeBtcUsdt";
import CryptoToTrend from "./components/CryptoToTrend";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [btcDetails, setbtcDetails] = useState([]);
  const [accountBalance, setAccountBalance] = useState(null);
  const [kLineData, setKLineData] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchBtcUsdtDetails();
      setbtcDetails(data?.data);
    }, 3000); // Récupère les données toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadAccountBalance = async () => {
      const interval = setInterval(async () => {
        const data = await fetchAccountBalance();
        setKLineData(data?.data);
      }, 3000); // Récupère les données toutes les 5 secondes

      return () => clearInterval(interval);
    };

    loadAccountBalance();
  }, []);

  // useEffect(() => {
  //   const getPosition = async () => {
  //     const interval = setInterval(async () => {
  //       const data = await fetchCurrentPosition();
  //       setPosition(
  //         "vous avez " + data?.data.length + " position(s) ouverte(s)"
  //       );
  //     }, 3000); // Récupère les données toutes les 5 secondes

  //     return () => clearInterval(interval);
  //   };

  //   getPosition();
  // }, []);

  // console.log(position);

  useEffect(() => {
    const loadAccountBalance = async () => {
      const data = await fetchKLineData();
      setAccountBalance(data);
    };

    loadAccountBalance();
  }, []);

  return (
    <>
      <div>My Bot is running locally</div>

      <div>
        <div>
          <CryptoToTrend />
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
        <h2>BTC_USDT Trading Pair Details</h2>
        <h2>BTC_USDT Trading Pair Details</h2>
        <p>Last Price: {btcDetails.last_price}</p>
        <p>24h High: {btcDetails.high_24h}</p>
        <p>24h Low: {btcDetails.low_24h}</p>
        {/* <p>24h Volume (Base): {btcDetails.base_volume_24h}</p>
        <p>24h Volume (Quote): {btcDetails.quote_volume_24h}</p> */}
        <p>Fluctuation (24h): {btcDetails.fluctuation}</p>

        {/* Ajoutez d'autres détails que vous souhaitez afficher */}
      </div>
    </>
  );
}

export default App;
