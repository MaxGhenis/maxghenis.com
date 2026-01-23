---
title: 'opencollective-py: Submit expenses from your terminal or Claude Code'
description: 'A Python client, CLI, and MCP server for the OpenCollective API—built because I got tired of clicking through their web UI.'
pubDate: 'Jan 23 2026'
---

I manage expenses for [PolicyEngine](https://opencollective.com/policyengine) on OpenCollective. Every reimbursement meant: open browser, navigate to the collective, click "Submit Expense", fill out the form, upload a receipt, select payout method, submit.

So I built [opencollective-py](https://github.com/MaxGhenis/opencollective-py)—a Python client that handles all of this programmatically. It includes a CLI for quick terminal commands and an MCP server so Claude Code can submit expenses directly.

## The workflow I wanted

Instead of clicking through a web UI, I wanted to say:

> "Submit my NASI membership receipt as a $325 reimbursement to PolicyEngine"

And have it just work—find the receipt in my email, upload it, create the expense, done.

## What it does

**Python client** for programmatic access:

```python
from opencollective import OpenCollectiveClient

client = OpenCollectiveClient(access_token="...")

# Submit a reimbursement with receipt
expense = client.submit_reimbursement(
    collective_slug="policyengine",
    description="NASI Membership Dues 2026",
    amount_cents=32500,
    receipt_file="receipt.pdf",
    tags=["membership"]
)
```

**CLI** for quick terminal commands:

```bash
# Submit reimbursement
oc reimbursement "Conference registration" 500.00 receipt.pdf -c policyengine

# List pending expenses
oc expenses -c policyengine --pending

# Approve an expense
oc approve exp-abc123
```

**MCP server** for Claude Code integration:

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

Then just ask Claude to submit expenses in natural language.

## Reimbursement vs invoice

The package enforces the right patterns:

| Type | Use when... | Receipt required? |
|------|-------------|-------------------|
| **Reimbursement** | You paid out-of-pocket | Yes |
| **Invoice** | You're billing for services | No |

`submit_reimbursement()` requires a receipt file. `submit_invoice()` doesn't. The CLI and MCP tools follow the same pattern.

## Auto-converts HTML receipts to PDF

Many email receipts are HTML. OpenCollective only accepts images and PDFs. The package automatically converts HTML receipts to PDF using WeasyPrint:

```bash
# This just works—HTML gets converted to PDF before upload
oc reimbursement "AWS bill" 150.00 aws-receipt.html -c policyengine
```

## Get it

```bash
# Basic install
pip install git+https://github.com/MaxGhenis/opencollective-py.git

# With PDF conversion
pip install "opencollective[pdf] @ git+https://github.com/MaxGhenis/opencollective-py.git"
```

Then authenticate:

```bash
oc auth
```

Source and docs on [GitHub](https://github.com/MaxGhenis/opencollective-py).

---

*Built with Claude Code in a single session while submitting an actual expense.*
