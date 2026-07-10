// Wraps the Australia Post Postcode Search API. Falls back to a small mock
// dataset when AUSPOST_API_KEY is unset, so local dev works without keys.
// https://developers.auspost.com.au/apis/pac/reference

export type PostcodeMatch = {
  suburb: string;
  state: string;
  postcode: string;
};

const MOCK_POSTCODES: Record<string, { suburb: string; state: string }> = {
  "2000": { suburb: "Sydney", state: "NSW" },
  "2150": { suburb: "Parramatta", state: "NSW" },
  "2170": { suburb: "Liverpool", state: "NSW" },
  "2560": { suburb: "Campbelltown", state: "NSW" },
  "2145": { suburb: "Westmead", state: "NSW" },
  "3000": { suburb: "Melbourne", state: "VIC" },
  "3175": { suburb: "Dandenong", state: "VIC" },
  "4000": { suburb: "Brisbane City", state: "QLD" },
  "5000": { suburb: "Adelaide", state: "SA" },
  "6000": { suburb: "Perth", state: "WA" },
  "7000": { suburb: "Hobart", state: "TAS" },
  "0800": { suburb: "Darwin City", state: "NT" },
  "2600": { suburb: "Canberra", state: "ACT" },
};

export async function lookupPostcode(postcode: string): Promise<PostcodeMatch[]> {
  if (!/^\d{4}$/.test(postcode)) return [];

  const apiKey = process.env.AUSPOST_API_KEY;
  if (!apiKey) {
    const hit = MOCK_POSTCODES[postcode];
    return hit ? [{ ...hit, postcode }] : [];
  }

  const res = await fetch(
    `https://digitalapi.auspost.com.au/postcode/search.json?q=${postcode}`,
    { headers: { "AUTH-KEY": apiKey } }
  );
  if (!res.ok) return [];

  const data = (await res.json()) as {
    localities?: { locality: { location: string; state: string; postcode: number } | { location: string; state: string; postcode: number }[] };
  };
  const localities = data.localities?.locality;
  if (!localities) return [];
  const list = Array.isArray(localities) ? localities : [localities];
  return list.map((l) => ({ suburb: l.location, state: l.state, postcode: String(l.postcode) }));
}
