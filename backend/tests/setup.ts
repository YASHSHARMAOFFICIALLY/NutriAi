process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://nutriai:nutriai@localhost:5432/nutriai?schema=public';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET ??= 'test_access_secret_value_1234567890';
process.env.JWT_REFRESH_SECRET ??= 'test_refresh_secret_value_1234567890';
process.env.JWT_ACCESS_TTL ??= '15m';
process.env.JWT_REFRESH_TTL ??= '30d';
