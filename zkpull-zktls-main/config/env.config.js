import dotenv from "dotenv";
dotenv.config();

const config = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  reclaim: {
    id: process.env.RECLAIM_ID,
    secret: process.env.RECLAIM_SECRET,
  },
  oneshot: {
    apiKey: process.env.ONESHOT_API_KEY,
    apiSecret: process.env.ONESHOT_API_SECRET,
    businessId: process.env.ONESHOT_BUSINESS_ID,
    webhookPublicKey: process.env.ONESHOT_WEBHOOK_PUBLIC_KEY,
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
  },
  venice: {
    apiKey: process.env.VENICE_API_KEY,
  },
};

// Validate required environment variables
const validateConfig = () => {
  const warnings = [];
  
  if (!config.github.clientId || !config.github.clientSecret) {
    warnings.push("Missing GitHub credentials");
  }

  if (!config.reclaim.id || !config.reclaim.secret) {
    warnings.push("Missing Reclaim credentials");
  }

  if (!config.oneshot.apiKey || !config.oneshot.apiSecret) {
    warnings.push("Missing 1Shot API credentials");
  }

  if (!config.venice.apiKey) {
    warnings.push("Missing Venice AI API key — AI features disabled");
  
  if (warnings.length > 0) {
    console.warn("Configuration warnings:", warnings.join(", "));
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      console.error("Configuration errors in development mode");
    }
  }
};

validateConfig();

export default config;
