export function earningsTier(totalUsd: number) {
  if (totalUsd < 1000) return "$0-$1k"
  if (totalUsd < 5000) return "$1k-$5k"
  if (totalUsd < 10000) return "$5k-$10k"
  if (totalUsd < 50000) return "$10k-$50k"
  if (totalUsd < 100000) return "$50k-$100k"
  return "$100k+"
}

export function formatCurrency(usd: number) {
  return `$${usd.toLocaleString("en-US")}`
}
