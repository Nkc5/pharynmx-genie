export default () => ({
  nodeEnv: process.env.NODE_ENV,
  clerkPem: process.env.CLERK_PEM_PUBLIC_KEY,
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  domain: process.env.DOMAIN,
  razorKeyId: process.env.RAZOR_KEY_ID,
  razorSecretKey: process.env.RAZOR_SECRET_KEY,
  azureKey: process.env.AZURE_KEY,
  azureRegion: process.env.AZURE_REGION,
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  azureStorageName: process.env.AZURE_STORAGE_NAME,
  image: process.env.IMAGE,
  videoRetalkingEndpoint: process.env.VIDEO_RETALKING,
  comfyEndpoint: process.env.COMFY,
  bgEndpoint: process.env.BACKGROUND,
  runpodApiKey: process.env.RUNPOD_API_KEY,
  openaiKey: process.env.OPENAI_API_KEY
  // port: parseInt(process.env.PORT, 10) || 3000,
  // database: {
  //   host: process.env.DATABASE_HOST,
  //   port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  // }
});
