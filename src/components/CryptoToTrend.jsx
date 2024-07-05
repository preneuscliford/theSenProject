import React, { useEffect, useState } from "react";
import { fetchTradingPairDetails } from "../../api/bitmart";
import { determineTrend } from "../constants/determineTrend";

const CryptoToTrend = () => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentFluctuation, setCurrentFluctuation] = useState(0);
  const [buyPrice, setBuyPrice] = useState(null);
  const [currencies, setCurrencies] = useState(null);
  const [buyFluctuation, setBuyFluctuation] = useState(null); // Stocker la fluctuation au moment de l'achat
  const [quantity, setQuantity] = useState(0);
  const investmentAmount = 100; // Exemple d'investissement fixe
  const profitThreshold = 5; // Seuil de profit de 5%
  const lossThreshold = -3; // Seuil de perte de 3%
  const [profitLossPercentage, setProfitLossPercentage] = useState(0);

  const [shortPosition, setShortPosition] = useState("");
  const [longPosition, setLongPosition] = useState("");
  const [neutral, setNeutral] = useState("");
  const [signal, setSignal] = useState("");
  const [pair, setPair] = useState("");

  // Pourcentage de gain ou de perte

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchTradingPairDetails("XRP_USDT");
      if (data && data.data && data.data.last_price) {
        setCurrentPrice(data.data.last_price);
        setCurrentFluctuation(data.data.fluctuation); // Mise à jour de la fluctuation actuelle
      }
    }, 30000); // Récupère les données toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTradingPosition = async () => {
      // Déterminer la tendance actuelle pour le symbole souhaité
      const trend = await determineTrend("ETH_USDT");

      // Logique basée sur la tendance identifiée
      if (trend === "up") {
        console.log("Tendance à la hausse, placer un ordre d'achat");
        // Implémentez votre logique d'achat ici
      } else if (trend === "down") {
        console.log("Tendance à la baisse, envisager de vendre");
        // Implémentez votre logique de vente ici
      } else {
        console.log("Tendance neutre, aucune action entreprise");
        // Gérez le cas neutre ici
      }
    };

    updateTradingPosition();
  }, [currentPrice, investmentAmount, profitThreshold, lossThreshold]);

  return (
    <div>
      <p>Trading simulation in progress...</p>
      <p>Last Price: {currentPrice}</p>
      <p>Current Fluctuation: {currentFluctuation}</p>
      {buyPrice !== null && (
        <>
          <p>Buy Price: {buyPrice}</p>
          <p>Buy Fluctuation: {buyFluctuation}</p>
          <p>Profit/Loss Percentage: {profitLossPercentage.toFixed(2)}%</p>
        </>
      )}
    </div>
  );
};

export default CryptoToTrend;
