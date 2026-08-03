const allowedOrigins =
    process.env.NODE_ENV === "production"
        ? [process.env.CLIENT_URL]
        : [
            "http://localhost:5173",
            "http://localhost:4173",
        ];
const corsOpts = {
  origin: allowedOrigins,
  credentials: true, 
}

export{
    corsOpts
}