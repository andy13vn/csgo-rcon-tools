module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1f9",
          100: "#cce3f3",
          200: "#99c7e6",
          300: "#66abd9",
          400: "#338fcd",
          500: "#0073c0",
          600: "#005c9a",
          700: "#004573",
          800: "#002e4d",
          900: "#001726",
        },
        secondary: {
          50: "#eaecf0",
          100: "#d6dae0",
          200: "#acb5c2",
          300: "#8290a3",
          400: "#596b85",
          500: "#2f4666",
          600: "#263852",
          700: "#1c2a3d",
          800: "#131c29",
          900: "#090e14",
        },
        success: "#2ecc71",
        error: "#e74c3c",
        warning: "#f39c12",
        csgo: "#d35400",
      },
      fontFamily: {
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
