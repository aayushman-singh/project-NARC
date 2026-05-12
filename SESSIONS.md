# Telegram Session Files

The Telegram scraper uses [Telethon](https://docs.telethon.dev/), which stores per-phone authentication in `.session` files (SQLite). One file per Telegram account you log in as.

## How they get generated

Run the Telegram login flow once with your credentials:

```bash
python scraper/telegram_login.py --phone +YOUR_NUMBER
```

Telethon prompts for the SMS code, then writes `session_+YOUR_NUMBER.session` to the repo root.

## File naming

| File | Purpose |
| --- | --- |
| `session_+<phone>.session` | Bound to a real phone-number account |
| `session_name.session` | Bound to a username/session label, not a phone |

## Never commit these files

`.session` files contain **live Telegram auth keys**. Anyone with the file can:

- Read your DMs
- Send messages as you
- See group memberships and contacts
- Stay logged in until the session is revoked

The `.gitignore` already excludes `*.session` — keep it that way.

## If a session leaks

1. Open Telegram app → **Settings → Privacy and Security → Active Sessions**
2. Tap **Terminate All Other Sessions**
3. Delete the leaked file from local disk
4. If the file was pushed to a remote repo, purge it from git history with [`git-filter-repo`](https://github.com/newren/git-filter-repo):
   ```bash
   pip install git-filter-repo
   git filter-repo --invert-paths --path session_+YOUR_NUMBER.session --force
   git push --force origin main
   ```

## For learners using this repo

You will not find a working `.session` file checked in. That's intentional — they're per-user secrets. Generate your own via the login flow above before running the Telegram scraper.
