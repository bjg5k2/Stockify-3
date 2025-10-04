// The initial amount of credits a new user starts with.
export const STARTING_CREDITS = 10000;

// The rate at which the simulation updates, in milliseconds.
// e.g., 5000ms = 5 seconds
export const SIMULATION_TICK_RATE_MS = 5000;

// How many "days" pass in the simulation per tick.
export const DAYS_PER_TICK = 1;

// The minimum daily follower growth rate for an artist (before popularity influence).
export const FOLLOWER_GROWTH_RATE_MIN = 0.0001; // 0.01%

// The maximum daily follower growth rate for an artist (before popularity influence).
export const FOLLOWER_GROWTH_RATE_MAX = 0.001; // 0.1%

// How much an artist's Spotify popularity score (0-100) influences their growth rate.
export const POPULARITY_INFLUENCE = 0.0005; // 0.05% at 100 popularity
