#!/usr/bin/env python3
"""
Append today's representative Maharashtra modal price (median across markets)
for each tracked crop to public/prices-history.json — builds a free price
time-series over time for the Crop Report trend charts.

Source: data.gov.in Agmarknet mandi resource (free). Uses DATA_GOV_KEY secret,
falling back to the shared demo key.
"""
import datetime
import json
import os
import statistics
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "prices-history.json"
KEY = os.environ.get("DATA_GOV_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
RES = "9ef84268-d588-465a-a308-a864a43d0070"
CROPS = ["Onion", "Tomato", "Potato", "Soyabean", "Cotton", "Wheat", "Maize",
         "Bengal Gram(Gram)(Whole)"]
MAX_POINTS = 180


def load():
    if OUT.exists():
        try: return json.loads(OUT.read_text(encoding="utf-8"))
        except Exception: pass
    return {}


def main():
    hist = load()
    today = datetime.date.today().isoformat()
    for c in CROPS:
        try:
            r = requests.get(f"https://api.data.gov.in/resource/{RES}", params={
                "api-key": KEY, "format": "json", "limit": 200,
                "filters[state.keyword]": "Maharashtra", "filters[commodity]": c,
            }, timeout=30)
            modals = [int(float(x["modal_price"])) for x in r.json().get("records", []) if x.get("modal_price")]
            if not modals:
                continue
            p = int(statistics.median(modals))
            arr = hist.setdefault(c, [])
            if arr and arr[-1].get("d") == today:
                arr[-1]["p"] = p
            else:
                arr.append({"d": today, "p": p})
            hist[c] = arr[-MAX_POINTS:]
        except Exception as e:
            print("failed", c, e, file=sys.stderr)
    OUT.write_text(json.dumps(hist, ensure_ascii=False, indent=1), encoding="utf-8")
    print("logged", today, "crops:", len(hist))


if __name__ == "__main__":
    main()
