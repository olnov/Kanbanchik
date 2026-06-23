const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://frontend:3000', 'app://-'];

const DEFAULT_CORS_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

type CorsEnv = {
  CORS_METHODS?: string;
  CORS_ORIGINS?: string;
};

function parseCsv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getCorsConfig(env: CorsEnv = process.env) {
  const origin = parseCsv(env.CORS_ORIGINS);
  const methods = parseCsv(env.CORS_METHODS);

  return {
    origin: origin.length > 0 ? origin : DEFAULT_CORS_ORIGINS,
    methods: methods.length > 0 ? methods : DEFAULT_CORS_METHODS,
    allowedHeaders: ['Content-Type'],
    credentials: true,
  };
}
