---
title: 'opencollective-py: Manage OpenCollective from your terminal or Claude Code'
description: 'A Python client, CLI, and MCP server for the OpenCollective API.'
pubDate: 'Jan 23 2026'
heroImage: './opencollective-py.png'
---

<div style="display: flex; justify-content: center; margin: 1.5rem 0 2rem;">
  <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #0c2d66 0%, #1a4a8a 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 30px rgba(12, 45, 102, 0.3);">
    <svg width="56" height="56" viewBox="0 0 288 288" fill="white"><path opacity="0.7" d="M188 21.351l-31.03 31.084c-11.025-6.104-23.702-9.579-37.19-9.579-42.526 0-77.002 34.54-77.002 77.144 0 42.604 34.476 77.144 77.003 77.144 13.487 0 26.164-3.475 37.19-9.58L188 218.65C168.64 232.11 145.131 240 119.78 240 53.629 240 0 186.274 0 120S53.628 0 119.78 0c25.351 0 48.86 7.89 68.22 21.351z"/><path d="M218.826 51C232.176 70.298 240 93.731 240 119s-7.824 48.704-21.174 68L188 156.073c6.054-10.99 9.5-23.63 9.5-37.073 0-13.444-3.446-26.08-9.5-37.07L218.826 51z"/></svg>
  </div>
</div>

<div style="display: flex; justify-content: center;">
<a href="/opencollective-py" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #0c2d66; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 1.5rem;">
  <svg width="20" height="20" viewBox="0 0 288 288" fill="currentColor"><path opacity="0.7" d="M188 21.351l-31.03 31.084c-11.025-6.104-23.702-9.579-37.19-9.579-42.526 0-77.002 34.54-77.002 77.144 0 42.604 34.476 77.144 77.003 77.144 13.487 0 26.164-3.475 37.19-9.58L188 218.65C168.64 232.11 145.131 240 119.78 240 53.629 240 0 186.274 0 120S53.628 0 119.78 0c25.351 0 48.86 7.89 68.22 21.351z"/><path d="M218.826 51C232.176 70.298 240 93.731 240 119s-7.824 48.704-21.174 68L188 156.073c6.054-10.99 9.5-23.63 9.5-37.073 0-13.444-3.446-26.08-9.5-37.07L218.826 51z"/></svg>
  Visit project page →
</a>
</div>

I manage [PolicyEngine's OpenCollective](https://opencollective.com/policyengine). We use OpenCollective because it gives anyone full visibility into our finances—every expense, donation, and transaction is public. It also handles crowdfunding, recurring donations, and community updates, and the [platform itself is open source](https://github.com/opencollective/opencollective).

But submitting expenses, reviewing pending ones, approving reimbursements—it all meant clicking through a web UI.

So I built [opencollective-py](https://github.com/MaxGhenis/opencollective-py)—a Python client that handles OpenCollective operations programmatically. It includes a CLI for quick terminal commands and an MCP server so Claude Code can manage expenses directly.

## What it does

**Submit expenses**—reimbursements (with receipts) or invoices (for services):

```bash
oc reimbursement "Conference registration" 500.00 receipt.pdf -c policyengine
oc invoice "Consulting - January" 2000.00 -c policyengine
```

**List and filter expenses**:

```bash
oc expenses -c policyengine --pending
oc expenses -c policyengine --status approved
```

**Approve or reject** (for collective admins):

```bash
oc approve exp-abc123
oc reject exp-def456
```

**Get account info**:

```bash
oc me
```

## Python client

```python
from opencollective import OpenCollectiveClient

client = OpenCollectiveClient(access_token="...")

# Submit expenses
client.submit_reimbursement("policyengine", "Travel", 50000, "receipt.pdf")
client.submit_invoice("policyengine", "Consulting", 200000)

# Manage expenses
expenses = client.list_expenses("policyengine", status="PENDING")
client.approve_expense("exp-abc123")
client.reject_expense("exp-def456")
```

## MCP server for Claude Code

Add to your Claude Code config:

```json
{
  "mcpServers": {
    "opencollective": {
      "command": "python",
      "args": ["-m", "opencollective.mcp_server"]
    }
  }
}
```

Then manage expenses in natural language: "Show me pending expenses for PolicyEngine" or "Submit my AWS receipt as a $150 reimbursement."

## HTML receipt conversion

Many email receipts are HTML. OpenCollective only accepts images and PDFs. The package automatically converts HTML to PDF:

```bash
oc reimbursement "AWS bill" 150.00 aws-receipt.html -c policyengine
```

## Get it

```bash
pip install opencollective

# With PDF conversion
pip install "opencollective[pdf]"
```

Then authenticate:

```bash
oc auth
```

[Project page](/opencollective-py) ・ [PyPI](https://pypi.org/project/opencollective/) ・ [GitHub](https://github.com/MaxGhenis/opencollective-py)

*This is an unofficial community project, not affiliated with OpenCollective.*
