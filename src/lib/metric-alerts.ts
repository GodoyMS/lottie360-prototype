/** CPA por encima de este umbral se considera en alerta */
export const CPA_ALERT_THRESHOLD = 35

/** ROAS por debajo de este umbral se considera en alerta */
export const ROAS_ALERT_THRESHOLD = 6

export function isCpaAlert(cpa: number): boolean {
  return cpa > CPA_ALERT_THRESHOLD
}

export function isRoasAlert(roas: number): boolean {
  return roas < ROAS_ALERT_THRESHOLD
}
