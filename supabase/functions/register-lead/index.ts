import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const phone = String(body.phone ?? "").replace(/[^\d+]/g, "");
    const card = String(body.card ?? "");
    const area = String(body.area ?? "");
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const accuracy_m = Number(body.accuracy_m);

    if (!/^(\+?62|0)8\d{7,12}$/.test(phone)) return json({ ok: false, message: "Format nomor tidak valid." }, 400);
    if (!["Telkomsel", "by.U", "Indosat / IM3", "Tri (3)", "Smartfren", "XL", "Axis", "Live.On"].includes(card)) return json({ ok: false, message: "Jenis kartu tidak valid." }, 400);
    if (!area.trim() || area.length > 150) return json({ ok: false, message: "Nama kota tidak valid." }, 400);
    if (body.location_consent !== true) return json({ ok: false, message: "Persetujuan lokasi wajib." }, 400);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
        !Number.isFinite(accuracy_m) || accuracy_m <= 0 || accuracy_m >= 100000) {
      return json({ ok: false, message: "Data lokasi tidak valid." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { error } = await admin.from("registrations").insert({
      phone, card, area, latitude, longitude, accuracy_m,
      location_consent: true,
    });

    if (error?.code === "23505") return json({ ok: false, code: "DUPLICATE", message: "Nomor ini sudah terdaftar." }, 409);
    if (error) {
      console.error("Insert failed:", error.message);
      return json({ ok: false, message: "Pendaftaran gagal disimpan. Coba lagi nanti." }, 500);
    }
    return json({ ok: true });
  } catch (_e) {
    return json({ ok: false, message: "Permintaan tidak dapat diproses." }, 400);
  }
});
