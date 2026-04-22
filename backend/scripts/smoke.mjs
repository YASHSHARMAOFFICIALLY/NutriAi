const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:4000';
const concurrency = Number(process.env.SMOKE_CONCURRENCY ?? 20);

const endpoints = ['/health', '/ready', '/metrics'];

const hit = async (path) => {
  const started = Date.now();
  const res = await fetch(`${baseUrl}${path}`, { headers: { accept: 'application/json' } });
  const text = await res.text();
  return {
    path,
    status: res.status,
    ok: res.ok,
    latencyMs: Date.now() - started,
    body: text.slice(0, 300),
  };
};

const run = async () => {
  console.log(`Smoke target: ${baseUrl}`);
  const baseline = await Promise.all(endpoints.map(hit));
  for (const item of baseline) {
    console.log(`${item.status} ${item.path} ${item.latencyMs}ms`);
    if (!item.ok && item.path !== '/ready') {
      throw new Error(`${item.path} failed: ${item.body}`);
    }
  }

  const burst = await Promise.all(
    Array.from({ length: concurrency }, (_, index) => hit(index % 2 === 0 ? '/health' : '/metrics')),
  );
  const failures = burst.filter((item) => !item.ok);
  const avgLatency = Math.round(burst.reduce((sum, item) => sum + item.latencyMs, 0) / burst.length);

  console.log(`Burst: ${burst.length} requests, ${failures.length} failures, ${avgLatency}ms avg`);
  if (failures.length > 0) {
    throw new Error(`Smoke burst failed with ${failures.length} failed requests`);
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
