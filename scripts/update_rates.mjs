// scripts/update_rates.mjs
// 生成 rates.json（以“每 10000 JPY = ? RMB(CNY)”的形式输出）
import fs from "node:fs/promises";

const API = "https://api.frankfurter.dev/v1/latest?base=JPY&symbols=CNY"; // :contentReference[oaicite:1]{index=1}

async function main() {
  const resp = await fetch(API, { headers: { "accept": "application/json" } });
  if (!resp.ok) throw new Error(`Frankfurter fetch failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();

  const rateCnyPerJpy = Number(data?.rates?.CNY);
  if (!Number.isFinite(rateCnyPerJpy)) throw new Error("Invalid rate (CNY) from API");

  const per10k = rateCnyPerJpy * 10000;

  const out = {
    source: "Frankfurter (ECB reference, daily updated)",
    fetched_at_utc: new Date().toISOString(),
    date: data.date,
    base: "JPY",
    quote: "CNY",
    cny_per_jpy: rateCnyPerJpy,
    jpy_per_10000_to_cny: per10k,
    // 这里先给两路同值（公开参考价无法区分 Alipay/Wechat 五星/会员价）
    alipay_jpy_per_10k_rmb: per10k,
    wechat_jpy_per_10k_rmb: per10k
  };

  await fs.writeFile("rates.json", JSON.stringify(out, null, 2), "utf-8");
  console.log("Wrote rates.json:", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
