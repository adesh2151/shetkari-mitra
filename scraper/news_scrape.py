#!/usr/bin/env python3
"""
Refresh public/news.json with the latest agri news + Government Resolutions (GRs).
Runs inside the news.yml GitHub Action on a schedule. All sources are FREE.

  GRs / schemes -> krishi.maharashtra.gov.in  (scraped, Marathi)
  news          -> agrowon.esakal.com         (scraped, Marathi)

Optionally posts newly-seen GRs to a Telegram channel (free) when
TELEGRAM_TOKEN + TELEGRAM_CHAT_ID secrets are set.
"""
import hashlib
import json
import os
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "news.json"
HEADERS = {"User-Agent": "ShetkariMitraBot/1.0 (+farmer-info)"}
TIMEOUT = 30
MAX_GR = 12
MAX_NEWS = 12


def sid(prefix, text):
    return prefix + "-" + hashlib.md5(text.encode("utf-8")).hexdigest()[:10]


# Keep only farmer-relevant GRs; drop the department's internal / HR notices.
GR_ALLOW = ("योजना", "अनुदान", "विमा", "बियाणे", "खत", "कीटकनाशक", "पीक", "हमीभाव",
            "कर्ज", "सिंचन", "अवजारे", "शेतकरी", "कांदा", "कापूस", "सोयाबीन", "फळ",
            "भाजी", "ऊस", "यांत्रिक", "scheme", "subsidy")
GR_BLOCK = ("बदल्या", "बदली", "कर्मचारी", "सेवाप्रवेश", "कर्तव्य", "जबाबदार", "परीक्षा",
            "जाहिरात", "पदोन्नती", "भरती", "ज्येष्ठता", "निवृत्ती", "पडताळणी", "रजा",
            "वेतन", "सर्वसाधारण माहिती", "कायदे व नियम", "कल्याण")


def scrape_grs():
    url = "https://krishi.maharashtra.gov.in/"
    out = []
    try:
        html = requests.get(url, headers=HEADERS, timeout=TIMEOUT).text
        soup = BeautifulSoup(html, "html.parser")
        seen = set()
        for a in soup.find_all("a", href=True):
            title = a.get_text(strip=True)
            href = a["href"]
            low = (title + href).lower()
            if len(title) < 12 or title in seen:
                continue
            if any(b in title for b in GR_BLOCK):
                continue
            if not any(a2 in title or a2 in low for a2 in GR_ALLOW):
                continue
            seen.add(title)
            out.append({
                "id": sid("gr", title),
                "category": "gr",
                "title": title,
                "source": "कृषी विभाग, महाराष्ट्र",
                "isNew": True,
                "link": requests.compat.urljoin(url, href),
            })
            if len(out) >= MAX_GR:
                break
    except Exception as e:
        print("GR scrape failed:", e, file=sys.stderr)
    return out


def scrape_news():
    url = "https://agrowon.esakal.com/"
    out = []
    try:
        html = requests.get(url, headers=HEADERS, timeout=TIMEOUT).text
        soup = BeautifulSoup(html, "html.parser")
        seen = set()
        for a in soup.find_all("a", href=True):
            title = a.get_text(strip=True)
            if 20 <= len(title) <= 140 and title not in seen:
                seen.add(title)
                out.append({
                    "id": sid("news", title),
                    "category": "news",
                    "title": title,
                    "source": "अ‍ॅग्रोवन",
                    "link": requests.compat.urljoin(url, a["href"]),
                })
            if len(out) >= MAX_NEWS:
                break
    except Exception as e:
        print("news scrape failed:", e, file=sys.stderr)
    return out


def load_prev():
    if OUT.exists():
        try:
            return json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def notify(new_items):
    token = os.environ.get("TELEGRAM_TOKEN")
    chat = os.environ.get("TELEGRAM_CHAT_ID")
    if not (token and chat):
        return
    for it in new_items:
        icon = "📜" if it["category"] == "gr" else "📰"
        msg = f"{icon} {it['title']}\n{it.get('link', '')}"
        try:
            requests.post(f"https://api.telegram.org/bot{token}/sendMessage",
                          data={"chat_id": chat, "text": msg}, timeout=TIMEOUT)
        except Exception as e:
            print("telegram failed:", e, file=sys.stderr)


def main():
    prev = load_prev()
    prev_ids = {i.get("id") for i in prev}

    items = scrape_grs() + scrape_news()
    if not items:                      # site down / layout changed → keep old data
        print("nothing scraped; keeping existing news.json")
        return

    # mark which are genuinely new since last run
    for it in items:
        it["isNew"] = it["id"] not in prev_ids

    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(items)} items")

    notify([i for i in items if i["isNew"]])


if __name__ == "__main__":
    main()
