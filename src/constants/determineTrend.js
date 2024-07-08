import axios from "axios";
import { fetchKLineData } from "../../api/bitmart";
import { calculateIndicators, calculateMACDIndicators } from "./sma";

async function fetchFearAndGreedIndex() {
  try {
    const response = await axios.get("https://api.alternative.me/fng/");

    return response.data.data[0]; // Supposons que nous voulons le dernier indice disponible
  } catch (error) {
    console.error("Failed to fetch Fear and Greed Index:", error);
    return { value: "50", value_classification: "Neutral" }; // Retourne une valeur neutre par défaut
  }
}

export async function determineTrend(symbol) {
  const fearAndGreedIndex = await fetchFearAndGreedIndex();

  const { macdResult, adxResult, obvResult, atrOutput } =
    await calculateMACDIndicators(symbol);
  const historicalPrices = await fetchKLineData(symbol);

  if (historicalPrices.closingPrices.length < 20) {
    console.error("Pas assez de données pour calculer la tendance.");
    return "data-insufficient";
  }

  const closingPrices = historicalPrices.closingPrices.map((price) =>
    parseFloat(price)
  );
  const highPrices = historicalPrices.highPrices;
  const lowPrices = historicalPrices.lowPrices;

  const { sma, rsi, stochastic } = await calculateIndicators(
    closingPrices,
    highPrices,
    lowPrices
  );

  const latestMacdHistogram =
    macdResult.length > 0 ? macdResult[macdResult.length - 1].histogram : null;
  const latestAdx =
    adxResult.length > 0 ? adxResult[adxResult.length - 1].adx : null;
  const latestPrice = closingPrices[closingPrices.length - 1]; // Ajout pour utiliser le prix actuel
  const latestObv = obvResult[obvResult.length - 1];
  const latestAtr = atrOutput[atrOutput.length - 1];
  // Bollinger Bands and Stochastic values

  console.log(symbol + `: OBV: ${latestObv}, ATR: ${latestAtr} `);

  const stochasticK = stochastic[stochastic.length - 1].k;
  const stochasticD = stochastic[stochastic.length - 1].d;

  console.log(
    `Indice de peur et de cupidité: ${fearAndGreedIndex.value_classification} (${fearAndGreedIndex.value})`
  );

  if (latestPrice) {
    console.log("une potentielle condition de surachat est détectée.");
  } else if (latestPrice) {
    console.log(
      "Le prix est inférieur à la bande de Bollinger inférieure, ce qui indique une potentielle survente est détectée."
    );
  }
  const latestMacd = macdResult[macdResult.length - 1];
  const latestRsi = rsi[rsi.length - 1];

  const ema50 = sma[49]; // L'index 49 représente le dernier point EMA 50
  const ema200 = sma[199];

  // Conditions d'entrée en position longue
  const longEntryCondition =
    ema50 > ema200 &&
    latestAdx.MACD > latestAdx.signal &&
    latestRsi > 30 &&
    latestRsi < 70 &&
    latestObv > obvResult[obvResult.length - 2]; // OBV montre une augmentation

  // Conditions de sortie de position longue
  const longExitCondition =
    ema50 < ema200 ||
    latestAdx.MACD < latestAdx.signal ||
    latestRsi > 70 ||
    latestObv < obvResult[obvResult.length - 2]; // OBV montre une diminution

  // Conditions d'entrée en position courte
  const shortEntryCondition =
    ema50 < ema200 &&
    latestAdx.MACD < latestAdx.signal &&
    latestRsi > 70 &&
    latestObv < obvResult[obvResult.length - 2]; // OBV montre une diminution

  // Conditions de sortie de position courte
  const shortExitCondition =
    ema50 > ema200 ||
    latestAdx.MACD > latestAdx.signal ||
    latestRsi < 30 ||
    latestObv > obvResult[obvResult.length - 2];

  // Decision making based on RSI, MACD, ADX combined with Bollinger Bands and Stochastic

  if (longEntryCondition) {
    console.log(
      "Conditions remplies pour entrer en position longue  sur le " + symbol
    );
    return "long";
  } else if (longExitCondition) {
    console.log(
      "Conditions remplies pour sortir de position longue  sur le " + symbol
    );
    return "exit-long";
  } else if (shortEntryCondition) {
    console.log(
      "Conditions remplies pour entrer en position courte sur le " + symbol
    );
    return "short";
  } else if (shortExitCondition) {
    console.log(
      "Conditions remplies pour sortir de position courte sur le " + symbol
    );
    return "exit-short";
  } else if (
    latestPrice > sma[sma.length - 1] &&
    latestMacdHistogram > 0 &&
    latestObv > 0
  ) {
    console.log(
      "Forts signaux haussiers provenant du prix, du MACD et de l’OBV... sur le " +
        symbol
    );
    return "up";
  } else if (
    latestPrice < sma[sma.length - 1] &&
    latestMacdHistogram < 0 &&
    latestObv < 0
  ) {
    console.log(
      "Forts signaux baissiers du prix, du MACD et de l’OBV... sur le " + symbol
    );
    return "down";
  } else if (
    latestRsi > 70 ||
    (latestAdx > 25 && stochasticK > 80 && latestAtr > averageAtr)
  ) {
    console.log("Conditions de surachat avec une forte volatilité.");
    return "down";
  } else if (
    latestRsi < 30 ||
    (latestAdx > 25 && stochasticK < 20 && latestAtr > averageAtr)
  ) {
    console.log("Conditions de survente avec une forte volatilité.");
    return "up";
  } else {
    console.log("La tendance est neutre ou indéfinie.");
    return "neutral";
  }
}
