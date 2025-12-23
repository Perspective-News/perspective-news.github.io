document.addEventListener("DOMContentLoaded", () => {
  /* ================================
     REGION CONFIG
  ================================ */

  const REGIONS = {
    "south-asia": {
      optionLabel: "South Asia Edition",
      zones: [
        { city: "Delhi", tz: "Asia/Kolkata" },
        { city: "Karachi", tz: "Asia/Karachi" },
        { city: "Dhaka", tz: "Asia/Dhaka" },
        { city: "Colombo", tz: "Asia/Colombo" },
        { city: "Kathmandu", tz: "Asia/Kathmandu" }
      ]
    },

    "southeast-asia": {
      optionLabel: "Southeast Asia Edition",
      zones: [
        { city: "Bangkok", tz: "Asia/Bangkok" },
        { city: "Jakarta", tz: "Asia/Jakarta" },
        { city: "Singapore", tz: "Asia/Singapore" },
        { city: "Manila", tz: "Asia/Manila" }
      ]
    },

    "east-asia": {
      optionLabel: "East Asia Edition",