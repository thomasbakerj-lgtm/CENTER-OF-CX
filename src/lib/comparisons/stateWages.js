// src/lib/comparisons/stateWages.js
//
// Median wage of customer service representatives (SOC 43-4051) by state: US Bureau of Labor Statistics, Occupational
// Employment and Wage Statistics, May 2025, read on O*NET OnLine's local wages page (which republishes the BLS figures,
// "Bureau of Labor Statistics 2025 wage data") for each state on 28 Sep 2026. Every row matched TB's benchmark library
// (28 Sep) to the cent. Rows: [postal code, name, median hourly USD, median annual USD]. Display only: no tool reads a
// state wage into its arithmetic or its grade.

export const STATE_WAGE_SOURCE = {
  publisher: "US Bureau of Labor Statistics", host: "O*NET OnLine",
  title: "Occupational Employment and Wage Statistics, May 2025, Customer Service Representatives (43-4051), by state",
  period: "May 2025", checked: "2026-09-28",
  url: (st) => (st ? `https://www.onetonline.org/link/localwages/43-4051.00?st=${st}` : "https://www.onetonline.org/link/localwages/43-4051.00"),
};

/* The national median, the same figure as the registry's market.wage.agent (comparisons.test.mjs checks they agree). */
export const NATIONAL_WAGE = { hourly: 21.53, annual: 44770 };

export const STATE_WAGES = [
  ["AL", "Alabama", 18.46, 38400],
  ["AK", "Alaska", 21.71, 45150],
  ["AZ", "Arizona", 21.97, 45690],
  ["AR", "Arkansas", 18.19, 37840],
  ["CA", "California", 23.83, 49560],
  ["CO", "Colorado", 22.86, 47540],
  ["CT", "Connecticut", 23.12, 48090],
  ["DE", "Delaware", 23.17, 48190],
  ["DC", "District of Columbia", 23.20, 48250],
  ["FL", "Florida", 19.44, 40440],
  ["GA", "Georgia", 19.06, 39630],
  ["HI", "Hawaii", 21.95, 45650],
  ["ID", "Idaho", 20.77, 43200],
  ["IL", "Illinois", 22.18, 46130],
  ["IN", "Indiana", 20.74, 43140],
  ["IA", "Iowa", 22.16, 46090],
  ["KS", "Kansas", 19.39, 40320],
  ["KY", "Kentucky", 18.61, 38700],
  ["LA", "Louisiana", 17.95, 37330],
  ["ME", "Maine", 22.67, 47160],
  ["MD", "Maryland", 20.59, 42830],
  ["MA", "Massachusetts", 23.61, 49120],
  ["MI", "Michigan", 21.13, 43950],
  ["MN", "Minnesota", 23.46, 48800],
  ["MS", "Mississippi", 17.49, 36380],
  ["MO", "Missouri", 21.24, 44190],
  ["MT", "Montana", 21.77, 45290],
  ["NE", "Nebraska", 21.13, 43940],
  ["NV", "Nevada", 19.50, 40560],
  ["NH", "New Hampshire", 22.74, 47300],
  ["NJ", "New Jersey", 22.95, 47740],
  ["NM", "New Mexico", 18.77, 39030],
  ["NY", "New York", 23.08, 48000],
  ["NC", "North Carolina", 19.35, 40240],
  ["ND", "North Dakota", 21.48, 44670],
  ["OH", "Ohio", 21.93, 45610],
  ["OK", "Oklahoma", 18.58, 38650],
  ["OR", "Oregon", 22.81, 47450],
  ["PA", "Pennsylvania", 21.46, 44630],
  ["RI", "Rhode Island", 22.86, 47550],
  ["SC", "South Carolina", 18.69, 38860],
  ["SD", "South Dakota", 19.54, 40650],
  ["TN", "Tennessee", 20.59, 42830],
  ["TX", "Texas", 19.44, 40420],
  ["UT", "Utah", 20.74, 43140],
  ["VT", "Vermont", 22.84, 47500],
  ["VA", "Virginia", 20.54, 42730],
  ["WA", "Washington", 24.20, 50330],
  ["WV", "West Virginia", 18.48, 38430],
  ["WI", "Wisconsin", 22.58, 46970],
  ["WY", "Wyoming", 20.35, 42340],
];
