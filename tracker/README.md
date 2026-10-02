# Job tracker

A scheduled GitHub Action scans public job feeds, scores each posting against
`profile.yml`, emails a digest of new matches, and sends an application (résumé
attached, portfolio linked) when you approve one on the dashboard at
`/tracker/` on the Pages site. Nothing is sent without a click unless you turn
`auto_send` on for a source.

No Claude credential is needed. Keyword scoring runs on its own. Adding an
`ANTHROPIC_API_KEY` secret switches on an optional second pass where Claude
reads each borderline-and-above posting and judges fit, which mostly removes
false positives like "Flutter is a plus" on a backend role.

## Files

| Path | What |
|---|---|
| `tracker/profile.yml` | Who you are, keyword weights, sources, email settings. Edit this to tune matching. |
| `tracker/tracker.py` | The scanner: fetch, score, digest, send, status. |
| `tracker/templates/application.txt` | The application email. `{{note}}` is the per-job note you type on the dashboard. |
| `tracker/data/jobs.json` | Tracker state, committed by the workflow. Public, so it holds no contact emails or notes beyond what you type. |
| `tracker/index.html` | Dashboard served by GitHub Pages. |
| `.github/workflows/job-tracker.yml` | Schedule, manual run, and the dispatch handlers the dashboard calls. |

## One-time setup

1. **Gmail app password.** In your Google account, turn on 2-step verification,
   then create an app password (Security → App passwords). Add two repository
   secrets (Settings → Secrets and variables → Actions):
   `GMAIL_USER` = `edkluivert@gmail.com`, `GMAIL_APP_PASSWORD` = the 16-character password.
2. **Optional Claude rerank.** Add `ANTHROPIC_API_KEY` as a third secret. Cost is
   a few cents per scan at the default cap of 25 postings.
3. **Dashboard token.** Create a fine-grained personal access token
   (GitHub → Settings → Developer settings → Fine-grained tokens) scoped to this
   repository with **Contents: Read and write**. Open the dashboard, press
   *Token*, paste it. It stays in that browser's local storage only.
4. **First run.** Actions → Job tracker → Run workflow, command `scan`,
   tick *dry run* the first time to see the result without sending anything.
   The run commits `tracker/data/jobs.json`, and Pages publishes it a minute later.

The schedule is 07:00 and 15:00 Lagos time. GitHub pauses scheduled workflows
in repositories with no commits for 60 days. The tracker's own commits count, so
this only matters if the feeds return nothing new for two months.

## Daily flow

- The digest email lists new matches with their score and a *Send* or *Review*
  button that opens the dashboard on that job.
- *Send application* on the dashboard asks for an optional note, shows the email,
  and triggers the workflow. Where the posting lists an application email the
  tracker finds it again at send time. Otherwise you type the recipient.
  Postings that only have a web form get an *Apply on their site* link instead.
- After a send, use the status menu on the card to record replied, interview,
  offer or rejected. *Ignore* hides a match you do not want.

## Tuning

Weights live in `profile.yml`. A job's keyword score is the sum of title words,
description words, penalties and location bonuses, clamped to 0–100. Matching
is whole-word. `min_score` is the digest bar. With the Claude rerank on, the
final score is 40% keywords and 60% Claude's fit, capped low when Claude flags
the location as unworkable or says skip.

Add company career pages under `greenhouse.boards` and `lever.companies` using
the slug from `boards.greenhouse.io/<slug>` or `jobs.lever.co/<slug>`.

## Run it locally

```sh
python3 -m venv .venv && .venv/bin/pip install -r tracker/requirements.txt
.venv/bin/python tracker/tracker.py --dry-run scan --no-llm     # fetch + score, no email
.venv/bin/python tracker/tracker.py preview --id <job id>        # print the application email
GMAIL_USER=… GMAIL_APP_PASSWORD=… .venv/bin/python tracker/tracker.py send --id <job id> --to you@example.com
```
