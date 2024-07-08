import { fetchKLineData, fetchTradingPairDetails } from "../../api/bitmart";
import {
  SMA,
  RSI,
  BollingerBands,
  Stochastic,
  MACD,
  ADX,
  EMA,
  OBV,
  ATR,
} from "technicalindicators";

// Fonction pour calculer SMA et RSI basée sur des prix donnés
export async function calculateIndicators(prices, highPrices, lowPrices) {
  const smaOutput = SMA.calculate({ period: 5, values: prices });
  const rsiOutput = RSI.calculate({ values: prices, period: 14 });
  // Assurez-vous d'avoir suffisamment de valeurs pour calculer les EMA 50 et 200
  let ema50Output = [];
  let ema200Output = [];

  if (prices.length >= 50) {
    ema50Output = EMA.calculate({ period: 50, values: prices });
  } else {
    console.error("Pas assez de données pour calculer EMA 50.");
  }

  if (prices.length >= 200) {
    ema200Output = EMA.calculate({ period: 200, values: prices });
  } else {
    console.error("Pas assez de données pour calculer EMA 200.");
  }

  // Configuration pour les Bollinger Bands
  const bbInput = {
    period: 20,
    values: prices,
    stdDev: 2,
  };
  const bbOutput = BollingerBands.calculate(bbInput);

  // Configuration pour l'Oscillateur Stochastique
  const stochasticInput = {
    high: highPrices,
    low: lowPrices,
    close: prices,
    period: 14,
    signalPeriod: 3,
  };
  const stochasticOutput = Stochastic.calculate(stochasticInput);

  return {
    sma: smaOutput,
    rsi: rsiOutput,
    bollingerBands: bbOutput,
    stochastic: stochasticOutput,
    ema50: ema50Output, // Return EMA 50
    ema200: ema200Output, // Return EMA 200
  };
}

export async function calculateMACDIndicators(symbol) {
  const ETHhistorical = await fetchKLineData(symbol); // Added symbol to parameter

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
    high: ETHhistorical.highPrices,
    low: ETHhistorical.lowPrices,
    close: ETHhistorical.closingPrices,
    period: 14,
  };
  const obvResult = OBV.calculate({
    close: ETHhistorical.closingPrices,
    volume: ETHhistorical.volumes,
  });

  const atrOutput = ATR.calculate({
    high: ETHhistorical.highPrices,
    low: ETHhistorical.lowPrices,
    close: ETHhistorical.closingPrices,
    period: 14,
  });

  const adxResult = ADX.calculate(adxInput);

  return { macdResult, adxResult, obvResult, atrOutput };
}
