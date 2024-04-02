import axios from "axios";
import CryptoJS from "crypto-js";

const BASE_URL = "https://api-cloud.bitmart.com";

const API_KEY = import.meta.env.VITE_BITMART_API_KEY;
const API_SECRET = import.meta.env.VITE_BITMART_API_SECRET;
const API_MEMO = import.meta.env.VITE_BITMART_API_MEMO; // Utilisé si nécessaire

const getTimestamp = () => Date.now();

const generateSignature = (timestamp, body = "") => {
  // Assurez-vous que cette chaîne correspond aux attentes de BitMart pour la signature
  const message = `${timestamp}#${API_MEMO}#${body}`;
  const signature = CryptoJS.HmacSHA256(message, API_SECRET).toString(
    CryptoJS.enc.Hex
  );
  return signature;
};

export const fetchAccountBalance = async () => {
  const timestamp = getTimestamp();
  const body = ""; // Body est vide pour une requête GET
  const signature = generateSignature(timestamp, body); // Génère la signature avec le timestamp et le body

  const headers = getHeaders(API_KEY, timestamp, signature); // Utilisez la fonction getHeaders pour préparer les en-têtes

  try {
    if (BASE_URL) {
      const response = await axios.get(`${BASE_URL}/account/v1/wallet`, {
        headers,
      });
      return response?.data;
    }
  } catch (error) {
    console.error("Error getting your AccountBalance:", error);
    throw error;
  }
};

// Correction: Assurez-vous que la fonction getHeaders est définie correctement
const getHeaders = (apiKey, timestamp, signature) => ({
  "Content-Type": "application/json",
  "X-BM-KEY": apiKey,
  "X-BM-TIMESTAMP": timestamp,
  "X-BM-SIGN": signature,
});

export const fetchBtcUsdtDetails = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/spot/v1/ticker_detail?symbol=ETH_USDT`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching trading pairs list:", error);
    throw error;
  }
};
export const fetchShibUsdtDetails = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/spot/v1/ticker_detail?symbol=SHIB_USDT`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching trading pairs list:", error);
    throw error;
  }
};

export const getPrice = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/spot/v1/ticker_detail?symbol=ETH_USDT`
    );
    const price = response.data.data.last_price; // Assurez-vous que ce chemin correspond à la structure de réponse de l'API

    return parseFloat(price);
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
};

export const fetchKLineData = async () => {
  const symbol = "PENDLE_USDT";
  const from = Math.floor(Date.now() / 1000) - 3600; // Il y a une heure
  const to = Math.floor(Date.now() / 1000); // Maintenant
  const interval = "5m"; // 5 e

  try {
    const response = await axios.get(
      `https://api-cloud.bitmart.com/spot/v1/symbols/kline`,
      {
        params: {
          symbol,
          from,
          to,
          interval,
        },
      }
    );
    const closingPrices = response?.data.data.klines.map((kline) =>
      parseFloat(kline.close)
    );

    const highPrices = response?.data.data.klines.map((kline) =>
      parseFloat(kline.high)
    );

    const lowPrices = response?.data.data.klines.map((kline) =>
      parseFloat(kline.low)
    );

    return { highPrices, lowPrices, closingPrices };
  } catch (error) {
    console.error("Error fetching K-Line data:", error);
  }
};

export const placeOrder = async ({
  symbol,
  side,
  type,
  size,
  price,
  tpPrice, // Take Profit Price
  slPrice, // Stop Loss Price
}) => {
  const path = "/contract/private/submit-plan-order";
  const timestamp = Date.now().toString();
  const body = JSON.stringify({
    symbol,
    side,
    size,
    type,
    price,
    tp_price: tpPrice, // Assurez-vous que ce champ correspond à la documentation de l'API
    sl_price: slPrice, // Assurez-vous que ce champ correspond à la documentation de l'API
  });

  const signature = generateSignature(timestamp, body);
  const headers = getHeaders(API_KEY, timestamp, signature);

  try {
    const response = await axios.post(`${BASE_URL}${path}`, body, {
      headers,
    });
    console.log("Order with TP/SL submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting order with TP/SL:", error);
    throw error;
  }
};

export async function determineTrend(
  symbol,
  shortTermPeriod = 5,
  longTermPeriod = 10
) {
  const historicalPrices = await fetchKLineData(symbol);
  if (historicalPrices.length < longTermPeriod) {
    console.error("Pas assez de données pour calculer la tendance.");
    return "data-insufficient";
  }
  const shortTermSMA = calculateSMA(historicalPrices.slice(-shortTermPeriod));
  const longTermSMA = calculateSMA(historicalPrices.slice(-longTermPeriod));
  if (shortTermSMA > longTermSMA) return "up";
  else if (shortTermSMA < longTermSMA) return "down";
  else return "neutral";
}

function calculateSMA(prices) {
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return sum / prices.length;
}

export const fetchCurrencies = async () => {
  const headers = getHeaders(API_KEY, API_SECRET, API_MEMO);

  try {
    const response = await axios.get(`${BASE_URL}/account/v1/wallet`, {
      headers,
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error; // ou gérer l'erreur comme vous le souhaitez
  }
};

// Exemple d'utilisation
(async () => {
  try {
    const currencies = await fetchCurrencies();
    // console.log(currencies);
  } catch (error) {
    console.error(error);
  }
})();

export const fetchCurrentPosition = async () => {
  const headers = getHeaders(API_KEY, API_SECRET, API_MEMO);
  try {
    const response = await axios.get(`${BASE_URL}/contract/private/position`, {
      headers,
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching current position:", error);
    throw error;
  }
};

export const submitOrder = async ({
  symbol,
  side,
  size,
  orderType = "market",
  price = null,
  tpPrice = null,
  slPrice = null,
}) => {
  const path = "/contract/private/submit-order";
  const timestamp = Date.now().toString();
  const bodyObj = {
    symbol,
    side,
    size,
    type: orderType,
  };

  // Ajouter le prix si c'est un ordre limit
  if (orderType === "limit" && price) {
    bodyObj.price = price;
  }

  // Ajouter TP et SL si spécifiés
  if (tpPrice) {
    bodyObj.tp_price = tpPrice;
  }
  if (slPrice) {
    bodyObj.sl_price = slPrice;
  }

  const body = JSON.stringify(bodyObj);
  const signature = generateSignature(timestamp, body);

  try {
    const response = await axios.post(`${BASE_URL}${path}`, body, {
      headers: getHeaders(API_KEY, timestamp, signature),
    });
    console.log("Order submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  const path = "/contract/private/cancel-order";
  const timestamp = Date.now().toString();
  const body = JSON.stringify({
    order_id: orderId, // Assurez-vous de passer l'ID de la commande que vous souhaitez annuler
  });

  const signature = generateSignature(API_KEY, API_SECRET, timestamp, body);

  try {
    const response = await axios.post(`${BASE_URL}${path}`, body, {
      headers: getHeaders(API_KEY, timestamp, signature),
    });
    console.log("Order cancelled successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
