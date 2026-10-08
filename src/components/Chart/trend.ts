export type Trend = 'up' | 'down'

/** Direction from the first to the last value (up when equal). */
export const trendOf = (values: number[]): Trend => (values[values.length - 1] >= values[0] ? 'up' : 'down')
