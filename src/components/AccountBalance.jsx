import axios from "axios";
import CryptoJS from "crypto-js";

const BASE_URL = "https://api-cloud.bitmart.com";
const API_KEY = import.meta.env.VITE_BITMART_API_KEY;
const API_SECRET = import.meta.env.VITE_BITMART_API_SECRET;
const API_MEMO = import.meta.env.VITE_BITMART_API_MEMO;

const getTimestamp = () => Date.now();

const generateSignature = (timestamp, body = "") => {
  const message = `${timestamp}#${API_MEMO}#${body}`;
  const signature = CryptoJS.HmacSHA256(message, API_SECRET).toString(
    CryptoJS.enc.Hex
  );
  return signature;
};

const getHeaders = (apiKey, timestamp, signature) => ({
  "Content-Type": "application/json",
  "X-BM-KEY": apiKey,
  "X-BM-TIMESTAMP": timestamp,
  "X-BM-SIGN": signature,
});

export const fetchAccountBalance = async () => {
  const timestamp = getTimestamp();
  const signature = generateSignature(timestamp);
  const headers = getHeaders(API_KEY, timestamp, signature);

  try {
    const response = await axios.get(`${BASE_URL}/account/v1/wallet`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting your AccountBalance:", error);
    throw error;
  }
};
