import React, { useEffect, useState } from "react";
import { getPrice, placeOrder } from "../../api/bitmart";

const SHIB_USDT = "SHIB_USDT";
const profitTarget = 0.3;
const lossLimit = -0.3;

const TradeShiba = () => {
  const [position, setPosition] = useState({
    quantity: 0,
    buyPrice: 0,
    currentPrice: 0,
    profitLoss: 0,
  });

  useEffect(() => {
    const tradeInterval = setInterval(async () => {
      const currentPrice = await getPrice(SHIB_USDT);
      const trend = await determineTrend(SHIB_USDT);

      let newPosition = { ...position, currentPrice };

      // Calculez la profit/loss actuelle
      newPosition.profitLoss =
        (newPosition.currentPrice - newPosition.buyPrice) *
        newPosition.quantity;

      // Logique de vente basée sur le profit/loss
      if (
        newPosition.profitLoss >= profitTarget ||
        newPosition.profitLoss <= lossLimit
      ) {
        await placeOrder(SHIB_USDT, "sell", newPosition.quantity.toString());
        newPosition = {
          quantity: 0,
          buyPrice: 0,
          currentPrice: 0,
          profitLoss: 0,
        };
        // Logique pour racheter en fonction de la tendance
      } else if (trend === "up" || trend === "down") {
        // Assurez-vous d'avoir le capital nécessaire pour racheter
        // newPosition.quantity = calculQuantitéÀAcheter();
        // newPosition.buyPrice = currentPrice;
        // await placeOrder(SHIB_USDT, 'buy', newPosition.quantity.toString());
      }

      setPosition(newPosition);
    }, 60000);

    return () => clearInterval(tradeInterval);
  }, [position]);

  return (
    <div>
      Trading SHIBA...
      {/* Afficher des informations sur la position actuelle si nécessaire */}
    </div>
  );
};

export default TradeShiba;
