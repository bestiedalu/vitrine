// Guarda quais posts da página /posts já foram postados.
// Precisa de um KV do Cloudflare ligado ao projeto com o nome POSTADOS.
const CHAVE = "postados";
const json = (dados, status = 200) => new Response(JSON.stringify(dados), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

export async function onRequestGet({ env }) {
  if (!env.POSTADOS) return json({ erro: "sem KV" }, 503);
  return json(JSON.parse(await env.POSTADOS.get(CHAVE) || "{}"));
}

export async function onRequestPost({ env, request }) {
  if (!env.POSTADOS) return json({ erro: "sem KV" }, 503);
  let corpo; try { corpo = await request.json(); } catch { return json({ erro: "json inválido" }, 400); }
  const id = String(corpo.id || "");
  if (!/^[a-z0-9-]{1,60}$/.test(id)) return json({ erro: "id inválido" }, 400);
  const atual = JSON.parse(await env.POSTADOS.get(CHAVE) || "{}");
  if (corpo.data && /^\d{4}-\d{2}-\d{2}$/.test(corpo.data)) atual[id] = corpo.data; else delete atual[id];
  await env.POSTADOS.put(CHAVE, JSON.stringify(atual));
  return json(atual);
}
