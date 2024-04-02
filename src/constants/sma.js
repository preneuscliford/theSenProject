import { SMA, RSI } from "technicalindicators";
import { MACD } from "technicalindicators";
import { fetchBtcUsdtDetails, fetchKLineData } from "../../api/bitmart";
import { ADX } from "technicalindicators";

// Fonction pour calculer SMA et RSI basée sur des prix donnés
export async function calculateIndicators(prices) {
  const smaOutput = SMA.calculate({ period: 5, values: prices });
  const rsiOutput = RSI.calculate({ values: prices, period: 14 });

  return {
    sma: smaOutput,
    rsi: rsiOutput,
  };
}

let historicalHighPrices = [];
let historicalLowPrices = [];
let historicalClosePrices = [];
console.log(" Les prix historiques" + historicalClosePrices);

async function getDetails() {
  try {
    const data = await fetchBtcUsdtDetails();

    // console.log(closingPricesETC);
    historicalHighPrices.push(parseFloat(data.data.high_24h));
    historicalLowPrices.push(parseFloat(data.data.low_24h));

    return data.data; // Retourner les données pour utilisation ultérieure
  } catch (error) {
    console.error("Failed to fetch details:", error);
    return null; // Retourner null ou un objet vide en cas d'échec
  }
}

export async function calculateMACDIndicators() {
  await getDetails(); // Assurez-vous que cette fonction met à jour les tableaux historiques

  const ETHhistorical = await fetchKLineData();

  const macdInput = {
    values: ETHhistorical.closingPrices, // Utilisez le tableau de prix de clôture accumulés
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  };
  const macdResult = MACD.calculate(macdInput);

  // Calcul de l'ADX avec les prix hauts, bas et de clôture accumulés
  const adxInput = {
    high: ETHhistorical.highPrices, // Utilisez le tableau de prix hauts accumulés
    low: ETHhistorical.lowPrices, // Utilisez le tableau de prix bas accumulés
    close: ETHhistorical.closingPrices, // Utilisez le même tableau pour les prix de clôture
    period: 14,
  };

  const adxResult = ADX.calculate(adxInput);
  return { macdResult, adxResult };
}

calculateMACDIndicators();
