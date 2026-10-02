#!/usr/bin/env python3
"""Job tracker for the portfolio.

Scans public job feeds, scores each posting against tracker/profile.yml,
keeps the result in tracker/data/jobs.json (rendered by tracker/index.html on
GitHub Pages), emails a digest of new matches, and sends applications when
approved from the dashboard (or automatically for sources with auto_send on).

Sub-commands:
  scan      fetch + score + digest (+ auto-send where enabled)
  digest    send the digest for matched jobs not yet digested
  send      send an application for one job   (--id, [--to], [--note])
  status    set a job's status                 (--id --status)
  preview   print the application email        (--id)

Secrets come from the environment: GMAIL_USER, GMAIL_APP_PASSWORD, and
optionally ANTHROPIC_API_KEY for the Claude rerank. --dry-run skips sending.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import smtplib
import sys
import time
import xml.etree.ElementTree as ET
from email.message import EmailMessage
from pathlib import Path

import requests
import yaml

ROOT = Path(__file__).resolve().parent.parent
TRACKER = ROOT / "tracker"
DATA = TRACKER / "data" / "jobs.json"
PROFILE = TRACKER / "profile.yml"
TEMPLATES = TRACKER / "templates"

UA = "Mozilla/5.0 (compatible; portfolio-job-tracker/1.0; +https://github.com/edkluivert/kluivert_portfolio)"
HTTP = requests.Session()
HTTP.headers.update({"User-Agent": UA, "Accept": "application/json, application/rss+xml, text/xml, */*"})
TIMEOUT = 30

STATUSES = ("new", "matched", "sent", "replied", "interview", "offer", "rejected", "ignored")
TERMINAL = ("sent", "replied", "interview", "offer", "rejected")


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso(d: dt.datetime | None) -> str | None:
    return d.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat() if d else None


def parse_date(v) -> dt.datetime | None:
    if v in (None, "", 0):
        return None
    try:
        if isinstance(v, (int, float)):
            return dt.datetime.fromtimestamp(v, tz=dt.timezone.utc)
        s = str(v).strip().replace("Z", "+00:00")
        for fmt in (None, "%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"):
            try:
                d = dt.datetime.fromisoformat(s) if fmt is None else dt.datetime.strptime(s, fmt)
                return d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc)
            except ValueError:
                continue
    except Exception:
        pass
    return None


# --------------------------------------------------------------------------- state

def load_profile() -> dict:
    with PROFILE.open() as f:
        return yaml.safe_load(f)


def load_state() -> dict:
    if DATA.exists():
        with DATA.open() as f:
            return json.load(f)
    return {"updated": None, "jobs": []}


def save_state(state: dict):
    state["updated"] = iso(now())
    state["jobs"].sort(key=lambda j: (-(j.get("score") or 0), j.get("first_seen") or ""))
    DATA.parent.mkdir(parents=True, exist_ok=True)
    with DATA.open("w") as f:
        json.dump(state, f, indent=1, ensure_ascii=False)
        f.write("\n")


# --------------------------------------------------------------------------- text helpers

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"[ \t\r\f\v]+")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
BAD_EMAIL = re.compile(r"(noreply|no-reply|donotreply|privacy|legal|support|press|dmca|abuse|security|billing|info@example|example\.com|sentry|wixpress|\.png$|\.jpg$)", re.I)
GOOD_EMAIL = re.compile(r"(job|career|hr@|talent|recruit|hiring|apply|people|work)", re.I)


def clean_html(s: str | None) -> str:
    if not s:
        return ""
    s = html.unescape(s)
    s = re.sub(r"<(br|/p|/div|/li|/h\d|/tr)[^>]*>", "\n", s, flags=re.I)
    s = TAG_RE.sub(" ", s)
    s = html.unescape(s)
    s = WS_RE.sub(" ", s)
    s = re.sub(r"\n\s*\n+", "\n\n", s)
    return s.strip()


def extract_email(*texts: str) -> str | None:
    found: list[str] = []
    for t in texts:
        if not t:
            continue
        for m in EMAIL_RE.findall(html.unescape(t)):
            m = m.strip(".")
            if BAD_EMAIL.search(m) or m in found:
                continue
            found.append(m)
    if not found:
        return None
    for e in found:
        if GOOD_EMAIL.search(e):
            return e
    return found[0]


def norm_url(u: str) -> str:
    u = (u or "").strip()
    u = re.sub(r"[?#].*$", "", u)
    return u.rstrip("/").lower()


# --------------------------------------------------------------------------- sources

def _job(source, jid, title, company, url, *, location="", posted=None, tags=None, description="", apply_url=None):
    return {
        "id": f"{source}-{re.sub(r'[^A-Za-z0-9]+', '-', str(jid)).strip('-')[:80]}",
        "source": source,
        "title": (title or "").strip(),
        "company": (company or "").strip(),
        "url": (url or "").strip(),
        "apply_url": (apply_url or url or "").strip(),
        "location": (location or "").strip(),
        "posted": iso(parse_date(posted)),
        "tags": sorted({str(t).strip().lower() for t in (tags or []) if str(t).strip()})[:20],
        "description": description or "",
    }


def fetch_remotive(cfg):
    out = []
    for q in cfg.get("searches", []) or [""]:
        r = HTTP.get("https://remotive.com/api/remote-jobs", params={"category": "software-dev", "search": q, "limit": 100}, timeout=TIMEOUT)
        r.raise_for_status()
        for j in r.json().get("jobs", []):
            out.append(_job("remotive", j["id"], j.get("title"), j.get("company_name"), j.get("url"),
                            location=j.get("candidate_required_location", ""), posted=j.get("publication_date"),
                            tags=j.get("tags"), description=j.get("description", "")))
    return out


def fetch_remoteok(cfg):
    out = []
    for tag in cfg.get("tags", []) or [""]:
        r = HTTP.get("https://remoteok.com/api", params={"tag": tag} if tag else None, timeout=TIMEOUT)
        r.raise_for_status()
        for j in r.json():
            if not isinstance(j, dict) or "id" not in j:
                continue
            out.append(_job("remoteok", j["id"], j.get("position"), j.get("company"), j.get("url"),
                            location=j.get("location", ""), posted=j.get("epoch") or j.get("date"),
                            tags=j.get("tags"), description=j.get("description", ""), apply_url=j.get("apply_url")))
    return out


def fetch_himalayas(cfg):
    out = []
    for q in cfg.get("searches", []) or [""]:
        r = HTTP.get("https://himalayas.app/jobs/api", params={"limit": 50, "search": q}, timeout=TIMEOUT)
        r.raise_for_status()
        for j in r.json().get("jobs", []):
            loc = ", ".join(j.get("locationRestrictions") or []) or "Worldwide"
            out.append(_job("himalayas", j.get("guid") or j.get("applicationLink"), j.get("title"), j.get("companyName"),
                            j.get("applicationLink") or j.get("guid"), location=loc, posted=j.get("pubDate"),
                            tags=(j.get("categories") or []) + (j.get("seniority") or []), description=j.get("description", "")))
    return out


def fetch_jobicy(cfg):
    out = []
    for tag in cfg.get("tags", []) or [""]:
        r = HTTP.get("https://jobicy.com/api/v2/remote-jobs", params={"count": 50, "tag": tag}, timeout=TIMEOUT)
        r.raise_for_status()
        for j in r.json().get("jobs", []) or []:
            out.append(_job("jobicy", j["id"], j.get("jobTitle"), j.get("companyName"), j.get("url"),
                            location=j.get("jobGeo", ""), posted=j.get("pubDate"),
                            tags=(j.get("jobIndustry") or []) + (j.get("jobType") or []) + [j.get("jobLevel") or ""],
                            description=j.get("jobDescription") or j.get("jobExcerpt", "")))
    return out


def fetch_arbeitnow(cfg):
    out = []
    for q in cfg.get("searches", []) or [""]:
        r = HTTP.get("https://www.arbeitnow.com/api/job-board-api", params={"search": q}, timeout=TIMEOUT)
        r.raise_for_status()
        for j in r.json().get("data", []):
            if cfg.get("remote_only") and not j.get("remote"):
                continue
            out.append(_job("arbeitnow", j["slug"], j.get("title"), j.get("company_name"),
                            f"https://www.arbeitnow.com/jobs/{j['slug']}" if j.get("slug") else j.get("url"),
                            location=(j.get("location") or "") + (" · Remote" if j.get("remote") else ""),
                            posted=j.get("created_at"), tags=(j.get("tags") or []) + (j.get("job_types") or []),
                            description=j.get("description", ""), apply_url=j.get("url")))
    return out


def fetch_weworkremotely(cfg):
    out = []
    for feed in cfg.get("feeds", []):
        r = HTTP.get(feed, timeout=TIMEOUT)
        r.raise_for_status()
        root = ET.fromstring(r.content)
        for item in root.iter("item"):
            title = item.findtext("title") or ""
            company, _, role = title.partition(":")
            if not role:
                company, role = "", title
            link = item.findtext("link") or ""
            guid = item.findtext("guid") or link
            out.append(_job("wwr", guid.rsplit("/", 1)[-1], role, company, link,
                            location=item.findtext("region") or "", posted=item.findtext("pubDate"),
                            tags=[item.findtext("category") or ""], description=item.findtext("description") or ""))
    return out


def fetch_greenhouse(cfg):
    out = []
    for board in cfg.get("boards", []):
        r = HTTP.get(f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs", params={"content": "true"}, timeout=TIMEOUT)
        if r.status_code == 404:
            log(f"greenhouse: board '{board}' not found")
            continue
        r.raise_for_status()
        for j in r.json().get("jobs", []):
            out.append(_job("greenhouse", f"{board}-{j['id']}", j.get("title"), board, j.get("absolute_url"),
                            location=(j.get("location") or {}).get("name", ""), posted=j.get("updated_at"),
                            tags=[d.get("name", "") for d in j.get("departments", [])], description=j.get("content", "")))
    return out


def fetch_lever(cfg):
    out = []
    for company in cfg.get("companies", []):
        r = HTTP.get(f"https://api.lever.co/v0/postings/{company}", params={"mode": "json"}, timeout=TIMEOUT)
        if r.status_code == 404:
            log(f"lever: company '{company}' not found")
            continue
        r.raise_for_status()
        for j in r.json():
            cats = j.get("categories") or {}
            out.append(_job("lever", f"{company}-{j['id']}", j.get("text"), company, j.get("hostedUrl"),
                            location=cats.get("location", "") + (" · Remote" if cats.get("allLocations") else ""),
                            posted=j.get("createdAt"), tags=[cats.get("team", ""), cats.get("commitment", "")],
                            description=(j.get("descriptionPlain") or j.get("description", "")), apply_url=j.get("applyUrl")))
    return out


FETCHERS = {
    "remotive": fetch_remotive,
    "remoteok": fetch_remoteok,
    "himalayas": fetch_himalayas,
    "jobicy": fetch_jobicy,
    "arbeitnow": fetch_arbeitnow,
    "weworkremotely": fetch_weworkremotely,
    "greenhouse": fetch_greenhouse,
    "lever": fetch_lever,
}


def fetch_all(profile: dict, only: str | None = None) -> list[dict]:
    jobs: list[dict] = []
    for name, cfg in (profile.get("sources") or {}).items():
        if only and name != only:
            continue
        if not (cfg or {}).get("enabled", True):
            continue
        fn = FETCHERS.get(name)
        if not fn:
            log(f"unknown source '{name}', skipping")
            continue
        t0 = time.time()
        try:
            got = fn(cfg or {})
            jobs.extend(got)
            log(f"{name}: {len(got)} jobs in {time.time() - t0:.1f}s")
        except Exception as e:  # one dead feed must not kill the run
            log(f"{name}: FAILED ({type(e).__name__}: {e})")
    return jobs


# --------------------------------------------------------------------------- scoring

_KW_CACHE: dict[str, re.Pattern] = {}


def kw_in(kw: str, text: str) -> bool:
    """Whole-word match so 'bloc' does not hit 'block' and 'unity' does not hit 'community'."""
    k = str(kw).strip().lower()
    if not k:
        return False
    pat = _KW_CACHE.get(k)
    if pat is None:
        pat = _KW_CACHE[k] = re.compile(r"(?<![a-z0-9])" + re.escape(k) + r"(?![a-z0-9])")
    return bool(pat.search(text))


def _hits(text: str, weights: dict) -> tuple[int, list[str]]:
    total, reasons = 0, []
    for kw, w in (weights or {}).items():
        if kw_in(kw, text):
            total += int(w)
            reasons.append(f"{'+' if w >= 0 else ''}{w} {kw}")
    return total, reasons


def score_job(job: dict, profile: dict) -> tuple[int, list[str]]:
    m = profile["matching"]
    title = job["title"].lower()
    body = clean_html(job["description"]).lower()
    loc = job["location"].lower()
    everything = " ".join([title, body, loc, " ".join(job["tags"])])

    for bad in m.get("title_exclude", []) or []:
        if kw_in(bad, title):
            return 0, [f"excluded: '{bad}' in title"]

    score, reasons = 0, []
    s, r = _hits(title, m.get("title")); score += s; reasons += [f"title {x}" for x in r]
    s, r = _hits(body, m.get("body")); score += s; reasons += r
    s, r = _hits(everything, m.get("penalties")); score += s; reasons += r
    s, r = _hits(loc + " " + body[:400], m.get("location_bonus")); score += s; reasons += [f"location {x}" for x in r]
    if loc and not r and not kw_in("remote", loc) and len(loc) < 80:
        score -= 8
        reasons.append(f"-8 location limited to '{job['location'][:40]}'")

    if not any(kw_in(k, everything) for k in ("flutter", "dart", "mobile", "android", "ios", "kotlin", "swift")):
        score -= 20
        reasons.append("-20 no mobile signal anywhere")

    posted = parse_date(job.get("posted"))
    if posted and (now() - posted).days <= 7:
        score += 5
        reasons.append("+5 posted this week")

    return max(0, min(100, score)), reasons


# --------------------------------------------------------------------------- LLM rerank (optional)

LLM_SCHEMA = {
    "type": "object",
    "properties": {
        "fit": {"type": "integer", "minimum": 0, "maximum": 100},
        "verdict": {"type": "string", "enum": ["apply", "maybe", "skip"]},
        "reason": {"type": "string"},
        "location_ok": {"type": "boolean"},
    },
    "required": ["fit", "verdict", "reason", "location_ok"],
    "additionalProperties": False,
}


def llm_rerank(jobs: list[dict], profile: dict) -> int:
    """Asks Claude to judge borderline-and-above jobs. Mutates job['llm']. Returns calls made."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return 0
    try:
        import anthropic
    except ImportError:
        log("anthropic SDK missing; skipping rerank")
        return 0

    m = profile["matching"]
    me = profile["me"]
    todo = [j for j in jobs if j.get("score", 0) >= m.get("llm_from_score", 40) and not j.get("llm")
            and j.get("status") not in TERMINAL]
    todo.sort(key=lambda j: -j["score"])
    todo = todo[: int(m.get("llm_max_per_run", 25))]
    if not todo:
        return 0

    client = anthropic.Anthropic()
    system = (
        "You screen job postings for one candidate and answer only with the JSON schema requested. "
        "Judge fit on the actual requirements: stack, seniority, and whether the candidate's location "
        "(Nigeria, UTC+1, remote) is acceptable for the role. Be strict: a 'Flutter is a plus' mention on a "
        "backend role is a skip. 'apply' means you would send the resume today.\n\n"
        f"Candidate: {me['name']}, {me['headline']}.\n{me['summary']}"
    )
    calls = 0
    for job in todo:
        desc = clean_html(job["description"])[:7000]
        user = (f"Title: {job['title']}\nCompany: {job['company']}\nLocation: {job['location'] or 'unspecified'}\n"
                f"Tags: {', '.join(job['tags'])}\n\nDescription:\n{desc}")
        try:
            resp = client.beta.messages.create(
                model="claude-opus-5-5",
                max_tokens=600,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                system=system,
                messages=[{"role": "user", "content": user}],
                output_config={"effort": "low", "format": {"type": "json_schema", "schema": LLM_SCHEMA}},
            )
            calls += 1
            if resp.stop_reason == "refusal":
                job["llm"] = {"fit": None, "verdict": "skip", "reason": "model declined to assess"}
                continue
            text = next(b.text for b in resp.content if b.type == "text")
            data = json.loads(text)
            job["llm"] = {"fit": int(data["fit"]), "verdict": data["verdict"],
                          "reason": data["reason"][:300], "location_ok": bool(data["location_ok"])}
        except anthropic.RateLimitError:
            log("rerank: rate limited, stopping for this run")
            break
        except anthropic.APIStatusError as e:
            log(f"rerank: API error {e.status_code}: {e.message}")
            break
        except anthropic.APIConnectionError as e:
            log(f"rerank: connection error: {e}")
            break
        except (json.JSONDecodeError, StopIteration, KeyError, ValueError) as e:
            log(f"rerank: bad output for {job['id']}: {e}")
    return calls


def final_score(job: dict) -> int:
    base = job.get("score", 0)
    llm = job.get("llm") or {}
    if llm.get("fit") is None:
        return base
    blended = round(0.4 * base + 0.6 * llm["fit"])
    if llm.get("location_ok") is False:
        blended = min(blended, 35)
    if llm.get("verdict") == "skip":
        blended = min(blended, 45)
    return max(0, min(100, blended))


# --------------------------------------------------------------------------- email

def smtp_creds() -> tuple[str, str]:
    user = os.environ.get("GMAIL_USER", "").strip()
    pw = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()
    if not user or not pw:
        raise SystemExit("GMAIL_USER / GMAIL_APP_PASSWORD not set")
    return user, pw


def send_mail(msg: EmailMessage, dry_run: bool):
    if dry_run:
        log(f"[dry-run] would send '{msg['Subject']}' to {msg['To']}")
        return
    user, pw = smtp_creds()
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=60) as s:
        s.ehlo()
        s.starttls()
        s.login(user, pw)
        s.send_message(msg)
    log(f"sent '{msg['Subject']}' to {msg['To']}")


def render(template_name: str, **ctx) -> str:
    text = (TEMPLATES / template_name).read_text()
    return re.sub(r"\{\{\s*(\w+)\s*\}\}", lambda m: str(ctx.get(m.group(1), "")), text)


def dashboard_url(profile: dict) -> str:
    return profile["me"]["portfolio"].rstrip("/") + "/tracker/"


def build_application(job: dict, profile: dict, to: str, note: str | None) -> EmailMessage:
    me = profile["me"]
    body = render("application.txt", name=me["name"], headline=me["headline"], title=job["title"],
                  company=job["company"] or "your team", portfolio=me["portfolio"], linkedin=me.get("linkedin", ""),
                  email=me["email"], summary=me["summary"].strip(), note=(note or "").strip(), url=job["url"])
    body = re.sub(r"\n{3,}", "\n\n", body).strip() + "\n"
    msg = EmailMessage()
    msg["Subject"] = profile["email"]["application_subject"].format(title=job["title"], company=job["company"], name=me["name"])
    msg["From"] = f'{me["name"]} <{os.environ.get("GMAIL_USER", me["email"])}>'
    msg["To"] = to
    msg["Reply-To"] = me["email"]
    msg.set_content(body)
    pdf = ROOT / me["resume"]
    if pdf.exists():
        msg.add_attachment(pdf.read_bytes(), maintype="application", subtype="pdf", filename=pdf.name)
    else:
        log(f"WARNING: resume not found at {pdf}")
    return msg


def build_digest(matches: list[dict], profile: dict) -> EmailMessage:
    me = profile["me"]
    dash = dashboard_url(profile)
    rows = []
    for j in matches:
        llm = j.get("llm") or {}
        why = html.escape(llm.get("reason") or "; ".join(j.get("reasons", [])[:4]))
        rows.append(
            f'<tr><td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">'
            f'<div style="font-weight:600"><a href="{html.escape(j["url"])}" style="color:#2451f5;text-decoration:none">{html.escape(j["title"])}</a></div>'
            f'<div style="color:#6b7280;font-size:13px">{html.escape(j["company"])} · {html.escape(j["location"] or "remote")} · {j["source"]}</div>'
            f'<div style="color:#374151;font-size:13px;margin-top:4px">{why}</div></td>'
            f'<td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700">{j["final"]}</td>'
            f'<td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;white-space:nowrap">'
            f'<a href="{dash}?job={j["id"]}" style="background:#2451f5;color:#fff;padding:6px 10px;border-radius:8px;text-decoration:none;font-size:13px">'
            f'{"Send" if j.get("has_email") else "Review"}</a></td></tr>')
    plain = "\n".join(f"- {j['title']} @ {j['company']} ({j['final']}) {j['url']}" for j in matches)
    htmlbody = (
        f'<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;color:#111827">'
        f'<h2 style="font-weight:700">{len(matches)} new match{"es" if len(matches) != 1 else ""}</h2>'
        f'<p style="color:#6b7280">Approve or dismiss each one on the <a href="{dash}" style="color:#2451f5">tracker dashboard</a>. '
        f'"Send" means the posting lists an application email; "Review" means you apply through their form.</p>'
        f'<table style="border-collapse:collapse;width:100%"><tr><th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">Job</th>'
        f'<th style="padding:8px;font-size:12px;color:#6b7280">Score</th><th></th></tr>{"".join(rows)}</table>'
        f'<p style="color:#9ca3af;font-size:12px;margin-top:24px">Sent by the job tracker in your portfolio repo.</p></div>')
    msg = EmailMessage()
    msg["Subject"] = profile["email"]["digest_subject"].format(count=len(matches))
    msg["From"] = f'Job tracker <{os.environ.get("GMAIL_USER", me["email"])}>'
    msg["To"] = profile["email"].get("digest_to") or me["email"]
    msg.set_content(f"{len(matches)} new matches:\n\n{plain}\n\nDashboard: {dash}\n")
    msg.add_alternative(htmlbody, subtype="html")
    return msg


# --------------------------------------------------------------------------- commands

def public_view(job: dict) -> dict:
    """What gets committed. Contact emails and descriptions stay out of the public file."""
    keep = ("id", "source", "title", "company", "url", "apply_url", "location", "posted", "tags", "score", "final",
            "reasons", "llm", "has_email", "status", "first_seen", "last_seen", "sent_at", "sent_to_domain",
            "digested", "note")
    return {k: job[k] for k in keep if k in job}


def cmd_scan(args):
    profile = load_profile()
    m = profile["matching"]
    state = load_state()
    existing = {j["id"]: j for j in state["jobs"]}
    seen_urls = {norm_url(j["url"]): j["id"] for j in state["jobs"] if j.get("url")}

    fetched = fetch_all(profile, args.source)
    log(f"fetched {len(fetched)} postings")
    cutoff = now() - dt.timedelta(days=int(m.get("max_age_days", 21)))
    ts = iso(now())
    touched: list[dict] = []
    new_count = 0

    for raw in fetched:
        posted = parse_date(raw.get("posted"))
        if posted and posted < cutoff:
            continue
        jid = raw["id"]
        dup = seen_urls.get(norm_url(raw["url"]))
        if dup and dup != jid:
            jid = dup  # same posting seen via another source earlier
        job = existing.get(jid)
        score, reasons = score_job(raw, profile)
        if job is None:
            job = {**public_view(raw), "id": jid, "status": "new", "first_seen": ts, "digested": False}
            existing[jid] = job
            state["jobs"].append(job)
            new_count += 1
        job.update({k: raw[k] for k in ("title", "company", "url", "apply_url", "location", "posted", "tags") if raw.get(k)})
        job["description"] = raw["description"]  # transient, not saved
        job["score"], job["reasons"] = score, reasons
        job["has_email"] = bool(extract_email(raw["description"], raw.get("apply_url", "")))
        job["last_seen"] = ts
        if raw["url"]:
            seen_urls[norm_url(raw["url"])] = jid
        touched.append(job)

    calls = 0 if args.no_llm else llm_rerank(touched, profile)
    if calls:
        log(f"rerank: {calls} Claude calls")

    threshold = int(m.get("min_score", 55))
    for job in touched:
        job["final"] = final_score(job)
        if job["status"] == "new" and job["final"] >= threshold:
            job["status"] = "matched"
        elif job["status"] == "matched" and job["final"] < threshold:
            job["status"] = "new"

    # prune stale unmatched jobs
    keep_days = int(m.get("keep_unmatched_days", 30))
    prune_before = now() - dt.timedelta(days=keep_days)
    before = len(state["jobs"])
    state["jobs"] = [j for j in state["jobs"] if j.get("status") in TERMINAL or j.get("status") == "ignored"
                     or (parse_date(j.get("last_seen")) or now()) >= prune_before]
    log(f"new {new_count}, pruned {before - len(state['jobs'])}, total {len(state['jobs'])}")

    sent = auto_send(touched, profile, args.dry_run)
    digest_count = send_digest(state, profile, args.dry_run) if not args.no_digest else 0

    for j in state["jobs"]:
        j.pop("description", None)
    state["jobs"] = [public_view(j) for j in state["jobs"]]
    save_state(state)
    print(json.dumps({"fetched": len(fetched), "new": new_count, "matched": sum(1 for j in state["jobs"] if j["status"] == "matched"),
                      "auto_sent": sent, "digested": digest_count, "llm_calls": calls}))


def auto_send(jobs: list[dict], profile: dict, dry_run: bool) -> int:
    cfg = profile.get("email", {})
    flags = cfg.get("auto_send") or {}
    cap = int(cfg.get("auto_send_max_per_run", 3))
    threshold = int(profile["matching"].get("min_score", 55))
    sent = 0
    for job in sorted(jobs, key=lambda j: -j.get("final", 0)):
        if sent >= cap:
            break
        if not flags.get(job["source"]) or job["status"] != "matched" or job.get("final", 0) < threshold:
            continue
        to = extract_email(job.get("description", ""), job.get("apply_url", ""))
        if not to:
            continue
        try:
            do_send(job, profile, to, None, dry_run)
            sent += 1
        except Exception as e:
            log(f"auto-send failed for {job['id']}: {e}")
    return sent


def send_digest(state: dict, profile: dict, dry_run: bool) -> int:
    threshold = int(profile["matching"].get("min_score", 55))
    matches = [j for j in state["jobs"] if j.get("status") == "matched" and not j.get("digested")
               and j.get("final", 0) >= threshold]
    if not matches:
        log("digest: nothing new")
        return 0
    matches.sort(key=lambda j: -j["final"])
    send_mail(build_digest(matches, profile), dry_run)
    if not dry_run:
        for j in matches:
            j["digested"] = True
    return len(matches)


def do_send(job: dict, profile: dict, to: str, note: str | None, dry_run: bool):
    msg = build_application(job, profile, to, note)
    send_mail(msg, dry_run)
    if not dry_run:
        job["status"] = "sent"
        job["sent_at"] = iso(now())
        job["sent_to_domain"] = to.split("@", 1)[-1]
        job["digested"] = True


def find_job(state: dict, jid: str) -> dict:
    for j in state["jobs"]:
        if j["id"] == jid:
            return j
    raise SystemExit(f"job '{jid}' not in tracker")


def resolve_recipient(job: dict, profile: dict, override: str | None) -> str:
    if override:
        if not EMAIL_RE.fullmatch(override.strip()):
            raise SystemExit(f"'{override}' is not an email address")
        return override.strip()
    # Contact emails are not stored; re-read the posting from its source.
    for raw in fetch_all(profile, job["source"]):
        if raw["id"] == job["id"] or norm_url(raw["url"]) == norm_url(job["url"]):
            to = extract_email(raw["description"], raw.get("apply_url", ""))
            if to:
                return to
            break
    raise SystemExit("no application email found in the posting; pass --to or apply through their form")


def cmd_send(args):
    profile = load_profile()
    state = load_state()
    job = find_job(state, args.id)
    if job["status"] in TERMINAL and not args.force:
        raise SystemExit(f"job already '{job['status']}'; use --force to resend")
    to = resolve_recipient(job, profile, args.to)
    do_send(job, profile, to, args.note, args.dry_run)
    if args.note:
        job["note"] = args.note[:2000]
    save_state(state)
    print(json.dumps({"id": job["id"], "status": job["status"], "to_domain": to.split("@")[-1]}))


def cmd_preview(args):
    profile = load_profile()
    job = find_job(load_state(), args.id)
    msg = build_application(job, profile, args.to or "hiring@example.com", args.note)
    print(f"Subject: {msg['Subject']}\nTo: {msg['To']}\n")
    print(msg.get_body(preferencelist=("plain",)).get_content())


def cmd_status(args):
    state = load_state()
    job = find_job(state, args.id)
    if args.status not in STATUSES:
        raise SystemExit(f"status must be one of {STATUSES}")
    job["status"] = args.status
    if args.note is not None:
        job["note"] = args.note[:2000]
    save_state(state)
    print(json.dumps({"id": job["id"], "status": job["status"]}))


def cmd_digest(args):
    profile = load_profile()
    state = load_state()
    n = send_digest(state, profile, args.dry_run)
    save_state(state)
    print(json.dumps({"digested": n}))


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--dry-run", action="store_true", help="never send email")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("scan"); s.set_defaults(fn=cmd_scan)
    s.add_argument("--source", help="only this source")
    s.add_argument("--no-llm", action="store_true")
    s.add_argument("--no-digest", action="store_true")

    s = sub.add_parser("digest"); s.set_defaults(fn=cmd_digest)

    s = sub.add_parser("send"); s.set_defaults(fn=cmd_send)
    s.add_argument("--id", required=True); s.add_argument("--to"); s.add_argument("--note")
    s.add_argument("--force", action="store_true")

    s = sub.add_parser("preview"); s.set_defaults(fn=cmd_preview)
    s.add_argument("--id", required=True); s.add_argument("--to"); s.add_argument("--note")

    s = sub.add_parser("status"); s.set_defaults(fn=cmd_status)
    s.add_argument("--id", required=True); s.add_argument("--status", required=True); s.add_argument("--note")

    args = p.parse_args(argv)
    args.fn(args)


if __name__ == "__main__":
    main()
