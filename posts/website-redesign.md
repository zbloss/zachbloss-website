---
title: "Redesigning my website with local AI Agents"
date: "2026-05-09"
slug: "website-redesign"
excerpt: 'AI Agents running on "slim" hardware.'
body: "md"
---

# What can be accomplished with Tiny Agents?

My website needed a redesign. I didn't want to do it by hand.

So I filed a GitHub Issue from my phone, went about my day, and came home to a pull request ready for review. The entire thing - planning, coding, testing, and opening the PR - ran on my home machine while I was away. No cloud. No subscription. No rate limits.

Here's how it works.

## Before the agents: designing with AI

Before any agent touched code, I used [Claude Code](https://claude.ai/code) and [Matt Pocock's skills](https://github.com/mattpocock/skills) - specifically `/grill-with-docs` - to work through the design and land on a `CONTEXT.md` the agents could actually use.

Agents are only as good as the plan they're given.

> I do sense the irony in talking about using Claude Code during my blog post about using local AI agents. One day I'll have a big enough machine to run an intelligent-enough reasoning model to replace my Claude Code usage!

## The pipeline

I use a tool called [Sandcastle](https://github.com/mattpocock/sandcastle) to orchestrate a team of AI agents. Every hour a cron job checks for GitHub Issues labeled `sandcastle`. When one is found, it kicks off the following sequence - each agent running in its own isolated Docker container via [Pi Coding Agent](https://pi.dev/), with its own git worktree:

1. **Planner** - reads the issue, writes a plan, and defines the tests that must pass for the work to be considered done
2. **Implementer** - receives the plan, writes the code, and commits to the worktree
3. **Reviewer** - checks the commits against the plan and runs the tests; if they fail, it tries to fix the code (not the tests)
4. **Merger** - merges the worktree into a new branch and opens a pull request

All four agents talk to a single local inference server running on my machine.

For this redesign, the pipeline handled 10 separate issues - everything from the terminal shell foundation to an in-browser ML embedding model for intent resolution.

You can spot the agent's work in the git history - every commit from the pipeline is prefixed with `RALPH:`, a nod to the [ralph-loop](https://www.aihero.dev/getting-started-with-ralph).

## The hardware

```
GPU:   NVIDIA RTX 4070 (12GB VRAM)
RAM:   32GB
Model: unsloth/Qwen3.6-35B-A3B-GGUF:Q4_K_M
CMD:   llama-server -hf unsloth/Qwen3.6-35B-A3B-GGUF:Q4_K_M --ctx-size 131000
```

Average time from issue filed to PR open: **~1 hour**.

Cloud inference gets that down to 5–10 minutes. But cloud costs money, has rate limits, and sends your code to someone else's server. My GPU is already paid for and sitting on my desk.

## You don't need the biggest hardware

My setup runs a 35B-A3B parameter model. If you have a GPU at home - even a modest one - there's likely a model small enough to run on it that can still do meaningful agentic work.

To check whether a model fits your hardware before downloading it:

```bash
uvx hf-mem --model-id <model_id>
```

[hf-mem](https://github.com/alvarobartt/hf-mem) estimates how much memory a model needs. Start there, pick the biggest model your hardware can fit, and experiment. I'd love to live in a world where small models run efficiently on consumer-grade hardware - and we're closer than most people think.

## Thanks

A huge shoutout to [Matt Pocock's skills repo](https://github.com/mattpocock/skills) and [Sandcastle](https://github.com/mattpocock/sandcastle). Both were essential to making this work.

---

Thanks for reading!
