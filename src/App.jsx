import { useEffect, useState } from "react";

import "./App.css";
import { fetchKLineData, fetchTradingPairDetails } from "../api/bitmart";

import CryptoToTrend from "./components/CryptoToTrend";

function App() {
  const [btcDetails, setbtcDetails] = useState([]);
  const [accountBalance, setAccountBalance] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchTradingPairDetails("ETH_USDT");
      setbtcDetails(data?.data);
    }, 3000); // Récupère les données toutes les 5 secondes

    return () => clearInterval(interval);
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
      const data = await fetchKLineData("ETH_USDT");
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
      </div>
    </>
  );
}

export default App;
