---
title: 'google-ads-mcp-rw: The first Google Ads MCP with write support'
description: 'An MCP server that lets you create campaigns, ad groups, keywords, and ads—not just read metrics.'
pubDate: 'Jan 24 2026'
projectUrl: '/google-ads-mcp-rw'
---

Every Google Ads MCP server I could find was read-only. You could query campaign performance and pull metrics, but creating campaigns? Adding keywords? Adjusting bids? You had to switch to the Google Ads UI.

So I built [google-ads-mcp-rw](https://github.com/MaxGhenis/google-ads-mcp-rw)—the first Google Ads MCP with full write capabilities.

## The problem with read-only

Google has an [official Google Ads MCP](https://github.com/nicholasgriffintn/google-ads-mcp), but it only supports GAQL queries. Great for pulling reports, useless for campaign management.

Other community MCPs follow the same pattern—query tools only. This makes sense for safety reasons: accidental writes to Google Ads can cost real money. But it also means you can't use Claude to actually *manage* your ads.

## Full campaign management in natural language

google-ads-mcp-rw includes 12 tools that cover the core campaign management workflow:

**Read operations:**
- `list_accounts` — See all accessible Google Ads accounts
- `execute_query` — Run any GAQL query for campaigns, ad groups, keywords, metrics

**Write operations:**
- `create_campaign` — Create search campaigns (paused by default)
- `create_ad_group` — Add ad groups to campaigns
- `add_keywords` — Add keywords with BROAD, PHRASE, or EXACT match types
- `add_negative_keywords` — Block unwanted search terms at campaign or ad group level
- `create_responsive_search_ad` — Build RSAs with multiple headlines and descriptions
- `pause_campaign` / `enable_campaign` — Toggle campaign status
- `pause_ad_group` / `enable_ad_group` — Toggle ad group status
- `update_ad_group_bid` — Adjust CPC bids

## Safety first

Write operations are dangerous. Accidental campaign creation could waste budget. So I built in multiple safety layers:

1. **Dry run mode** — Every write operation supports `dry_run=True` to validate without executing
2. **Paused by default** — New campaigns are created in PAUSED status; you must explicitly enable them
3. **Clear feedback** — All operations return detailed success/error messages

Example dry run:

```
Create a test campaign called "Q1 Promo" with $10/day budget, but use dry_run mode first
```

Claude will validate the campaign structure without creating anything.

## Example workflows

**Create a complete campaign structure:**

```
Create a new search campaign called "Widget Sale" with a $20/day budget,
add an ad group "Product Keywords" with keywords "buy widgets", "widget sale",
"best widgets", then create a responsive search ad with headlines:
"Buy Widgets Now", "50% Off Widgets", "Free Shipping"
and descriptions: "Shop our selection of widgets. Free shipping over $50.",
"Premium quality widgets at the best prices. Order today!"
Final URL: https://example.com/widgets
```

Claude creates the campaign (paused), ad group, keywords, and RSA in one conversation.

**Query and optimize:**

```
Show me all ad groups in campaign 19638300165 with CTR below 1%,
then pause the underperformers
```

**Add negative keywords:**

```
Add negative keywords "free", "cheap", "diy", "tutorial" to campaign 19638300165
```

## Installation

```bash
pip install google-ads-mcp
```

Or with uv (recommended):

```bash
uv pip install google-ads-mcp
```

## Configuration

1. Get your Google Ads API credentials from the [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Create `google-ads.yaml`:

```yaml
developer_token: YOUR_DEVELOPER_TOKEN
client_id: YOUR_CLIENT_ID.apps.googleusercontent.com
client_secret: YOUR_CLIENT_SECRET
refresh_token: YOUR_REFRESH_TOKEN
login_customer_id: "1234567890"  # MCC ID if using multiple accounts
use_proto_plus: true
```

3. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "uv",
      "args": ["run", "--with", "google-ads-mcp", "google-ads-mcp"],
      "env": {
        "GOOGLE_ADS_CONFIG_PATH": "/path/to/your/google-ads.yaml"
      }
    }
  }
}
```

Works with Claude Desktop, Claude Code, Cursor, or any MCP client.

## Get it

```bash
pip install google-ads-mcp
```

[Project page](/google-ads-mcp-rw) ・ [PyPI](https://pypi.org/project/google-ads-mcp/) ・ [GitHub](https://github.com/MaxGhenis/google-ads-mcp-rw)
