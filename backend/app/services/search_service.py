import httpx
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from app.core.config import settings


REGISTRATION_MARKERS = {
    "google": ["google", "googleapis", "accounts.google"],
    "vk": ["vk.com", "vkontakte"],
    "yandex": ["yandex", "passport.yandex"],
    "facebook": ["facebook.com", "fb.com"],
    "email": ["email", "e-mail", "почта", "регистрация"],
    "phone": ["phone", "телефон", "номер"],
}

ANTIBOT_MARKERS = {
    "cloudflare": ["cloudflare", "__cf_bm", "cf-ray"],
    "recaptcha": ["recaptcha", "g-recaptcha", "grecaptcha"],
    "hcaptcha": ["hcaptcha", "h-captcha"],
    "custom": ["captcha", "капча", "антибот"],
}


async def search_sites(query: str, topic: str | None, count: int) -> list[dict]:
    search_query = f'"{query}" отзывы'
    if topic:
        search_query += f" {topic}"

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{settings.SEARXNG_URL}/search",
            params={"q": search_query, "format": "json", "categories": "general", "count": count * 2},
        )
        resp.raise_for_status()
        data = resp.json()

    results = []
    seen_domains = set()
    for r in data.get("results", []):
        url = r.get("url", "")
        domain = urlparse(url).netloc.lower().lstrip("www.")
        if domain and domain not in seen_domains:
            seen_domains.add(domain)
            results.append({"url": url, "domain": domain, "title": r.get("title", ""), "snippet": r.get("content", "")})
        if len(results) >= count:
            break
    return results


async def profile_site(url: str) -> dict:
    reg_methods: list[str] = []
    antibot_type: str | None = None
    has_antibot = False

    try:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (compatible; Otzovik-Bot/1.0; +https://otzovik.systemtool.ru)"},
        ) as client:
            resp = await client.get(url)
            html = resp.text.lower()

        for method, markers in REGISTRATION_MARKERS.items():
            if any(m in html for m in markers):
                reg_methods.append(method)

        for atype, markers in ANTIBOT_MARKERS.items():
            if any(m in html for m in markers):
                has_antibot = True
                antibot_type = atype
                break

        soup = BeautifulSoup(resp.text, "lxml")
        title = soup.title.string.strip() if soup.title else ""
        meta_desc = ""
        meta = soup.find("meta", attrs={"name": "description"})
        if meta and isinstance(meta, object):
            meta_desc = meta.get("content", "")  # type: ignore[union-attr]

    except Exception:
        title = ""
        meta_desc = ""

    return {
        "title": title,
        "description": meta_desc,
        "registration_methods": list(set(reg_methods)),
        "has_antibot": has_antibot,
        "antibot_type": antibot_type,
    }


def calculate_relevance_score(
    reviews_total: int,
    latest_review_days_ago: int | None,
    activity_score: float,
    has_antibot: bool,
) -> float:
    total_norm = min(reviews_total / 100, 1.0)
    freshness = 1.0 if latest_review_days_ago is None else max(0, 1 - latest_review_days_ago / 365)
    ease = 0.5 if has_antibot else 1.0
    return round(0.3 * total_norm + 0.3 * freshness + 0.2 * (activity_score / 100) + 0.2 * ease, 3)
