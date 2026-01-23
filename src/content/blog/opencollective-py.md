---
title: 'opencollective-py: Manage OpenCollective from your terminal or Claude Code'
description: 'A Python client, CLI, and MCP server for the OpenCollective API.'
pubDate: 'Jan 23 2026'
heroImage: './opencollective-py-hero.png'
projectUrl: '/opencollective-py'
---

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
