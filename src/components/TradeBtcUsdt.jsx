import React, { useEffect, useState } from "react";
import { getPrice, placeOrder } from "../../api/bitmart";

const TradeBtcUsdt = () => {
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const amountInUSDT = 10; // Le montant fixe en USDT que vous souhaitez dépenser pour acheter du BTC

  useEffect(() => {
    const fetchBtcPrice = async () => {
      setLoading(true);
      const price = await getPrice("BTC_USDT"); // Assurez-vous que getPrice retourne le prix actuel pour "BTC_USDT"
      setBtcPrice(price);
      setLoading(false);
    };

    fetchBtcPrice();
  }, []);

  useEffect(() => {
    if (btcPrice) {
      const quantityToBuy = amountInUSDT / btcPrice; // Calcul de la quantité de BTC à acheter
      console.log(
        `Quantité de BTC à acheter pour 10 USDT au prix de ${btcPrice} USDT/BTC: ${quantityToBuy}`
      );
      setLoading(true);
      placeOrder("BTC_USDT", "sell", quantityToBuy.toString())
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors de la passation de l'ordre :", error);
          setLoading(false);
        });
    }
  }, [btcPrice]); // Cette opération se déclenche une fois que btcPrice est défini

  if (loading) return <div>Placing order...</div>;

  return <div>Your order is being processed</div>;
};
export default TradeBtcUsdt;
