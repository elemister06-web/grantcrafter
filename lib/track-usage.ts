const PRICING = {
  input: 3.00,
  output: 15.00,
  cacheRead: 0.30,
  cacheWrite: 3.75,
};

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  [key: string]: unknown;
}

export function calcCost(usage: AnthropicUsage): number {
  return (
    (usage.input_tokens / 1_000_000) * PRICING.input +
    (usage.output_tokens / 1_000_000) * PRICING.output +
    ((usage.cache_creation_input_tokens || 0) / 1_000_000) * PRICING.cacheWrite +
    ((usage.cache_read_input_tokens || 0) / 1_000_000) * PRICING.cacheRead
  );
}

export async function trackUsage(
  tool: string,
  usage: AnthropicUsage,
  model = "claude-sonnet-4-6"
): Promise<void> {
  try {
    const cost = calcCost(usage);

    // Use Supabase Management API to insert into CGP's database (shared usage table)
    await fetch("https://api.supabase.com/v1/projects/ycsumuofezgezlihtjjj/database/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUPABASE_MGMT_TOKEN!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `INSERT INTO api_usage (site, tool, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, model)
                VALUES ('grantcrafter', '${tool.replace(/'/g, "''")}', ${usage.input_tokens}, ${usage.output_tokens}, ${usage.cache_read_input_tokens || 0}, ${usage.cache_creation_input_tokens || 0}, ${Math.round(cost * 1_000_000) / 1_000_000}, '${model}')`,
      }),
    });
  } catch (err) {
    console.error("Usage tracking failed:", err);
  }
}
