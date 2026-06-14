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
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
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
