import { fetchKLineData } from "../../api/bitmart";
import { calculateIndicators, calculateMACDIndicators } from "./sma";

export async function determineTrend(symbol) {
  const { macdResult, adxResult } = await calculateMACDIndicators();

  // Assurez-vous que symbol est correctement passé à fetchKLineData
  const historicalPrices = await fetchKLineData(symbol);

  // Vérifier que vous avez assez de données pour les calculs
  if (historicalPrices.closingPrices.length < 14) {
    console.error("Pas assez de données pour calculer la tendance.");
    return "data-insufficient";
  }

  const closingPrices = historicalPrices.closingPrices.map((price) =>
    parseFloat(price)
  );
  const { sma, rsi } = await calculateIndicators(closingPrices);

  // Analyse combinée avec MACD, ADX, SMA, et RSI
  const latestMacdHistogram =
    macdResult.length > 0 ? macdResult[macdResult.length - 1].histogram : null;
  const latestAdx =
    adxResult.length > 0 ? adxResult[adxResult.length - 1].adx : null;

  // Exemples de logique pour intégrer MACD et ADX dans l'évaluation de la tendance
  if (rsi[rsi.length - 1] > 70 || (latestMacdHistogram < 0 && latestAdx > 25)) {
    console.log(
      "Considéré comme suracheté ou forte tendance à la baisse détectée."
    );
    return "down";
  } else if (
    rsi[rsi.length - 1] < 30 ||
    (latestMacdHistogram > 0 && latestAdx > 25)
  ) {
    console.log(
      "Considéré comme survendu ou forte tendance à la hausse détectée."
    );
    return "up";
  } else if (
    closingPrices[closingPrices.length - 1] > sma[sma.length - 1] &&
    latestMacdHistogram > 0
  ) {
    console.log(
      "Le prix est au-dessus du SMA et MACD positif, tendance haussière."
    );
    return "up";
  } else if (
    closingPrices[closingPrices.length - 1] < sma[sma.length - 1] &&
    latestMacdHistogram < 0
  ) {
    console.log(
      "Le prix est en dessous du SMA et MACD négatif, tendance baissière."
    );
    return "down";
  } else {
    console.log("Tendance neutre ou indéfinie.");
    return "neutral";
  }
}
