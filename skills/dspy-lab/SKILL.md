---
name: dspy-lab
description: Offline LM lab behind one venv — DSPy compiles prompts, LlamaIndex answers over local docs, LangGraph runs stateful graphs, PydanticAI enforces typed tool calls. Use when the user wants prompt optimization, RAG over local files, a stateful agent graph, typed extraction, or says "dspy", "optimize the prompt", "RAG", "LangGraph".
whenToUse: "Drive ~/.dsh/dspy-lab/ from any preset: declare the optimizer budget first, pick the framework with one explicit log line, and leave evidence in runs/*.json. Never edit compiled/ in place."
metadata:
  category: research
  scope: local-lab
  home: ~/.dsh/dspy-lab/
---

# dspy-lab

Offline LM lab: DSPy compiles prompts, LlamaIndex answers over local docs, LangGraph runs stateful workflows, PydanticAI enforces typed tool calls. Portable — usable from ANY preset. Home: `~/.dsh/dspy-lab/`.

## Setup (once)

```bash
~/.dsh/dspy-lab/.venv/bin/python -c "import dspy, llama_index.core, langgraph, pydantic_ai"
bash ~/.dsh/dspy-lab/check.sh   # after every DSH update or pip change
```

One fleet key in env (`OPENROUTER*_API_KEY`, `CLINE*_API_KEY`, `KIRAAI*_API_KEY`). Venv inherits agent env, so present keys just work. Budget rule is law: every optimizer run declares budget FIRST.

## Recipes

### 1. DSPy — compile a program (task model cheap, reflection strong)

```python
import dspy, sys; sys.path.insert(0, "~/.dsh/dspy-lab")
from lm_config import configure_dspy, get_lm
configure_dspy()

class QA(dspy.Signature):
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()

def metric(gold, pred, trace=None) -> float:
    return 1.0 if gold.answer.lower() in (pred.answer or "").lower() else 0.0

train = [dspy.Example(question="...", answer="...").with_inputs("question")]
prog = dspy.BootstrapFewShot(metric=metric, max_bootstrapped_demos=4).compile(
    dspy.Predict(QA), trainset=train)
prog.save("~/.dsh/dspy-lab/compiled/my_prog.json")
```

Ladder: `BootstrapFewShot` → `MIPROv2` → `dspy.GEPA`. GEPA needs feedback metric returning `dspy.Prediction(score, feedback)` — `feedback` reaches the reflection prompt verbatim:

```python
tele = dspy.GEPA(metric=gepa_metric, auto="light",
                 reflection_lm=get_lm("reflection"), max_metric_calls=400)
compiled = tele.compile(prog, trainset=train)
```

GEPA: `auto` light/medium/heavy ≈ 6/12/18 candidates; reflection serial (threads don't help); `track_stats=True` keeps lineage in `compiled.detailed_results`. Reflection often costs MORE than eval — budget accordingly. Budget is exactly ONE of `auto` / `max_full_evals` / `max_metric_calls` (two raises); `auto="light"` is the default, bare `max_metric_calls=N` only for a hard dollar cap instead.

### 2. LlamaIndex — RAG over local docs

```bash
~/.dsh/dspy-lab/.venv/bin/python ~/.dsh/dspy-lab/programs/rag_demo.py "question"
```

Drop `.md` in `~/.dsh/dspy-lab/datasets/rag_docs/`. Index lives in project workspace, not `~/.dsh`. Default vector store first; Chroma/Qdrant only with written reason.

### 3. LangGraph — stateful graph (branch + loop + fan-out)

```bash
~/.dsh/dspy-lab/.venv/bin/python ~/.dsh/dspy-lab/programs/graph_demo.py
```

Use when: persistent state, checkpoint/resume, human-in-loop, retries. Don't use when DSH `tool-workflow` covers it — say why in the log.

### 4. PydanticAI — typed agent, validated output

```bash
~/.dsh/dspy-lab/.venv/bin/python ~/.dsh/dspy-lab/programs/typed_demo.py
```

For extraction + shape-guaranteed tool calls. Validate inputs too — `ValidationError` is the guard, demo it.

### 5. Combined — retriever grounds, DSPy reasons

```bash
~/.dsh/dspy-lab/.venv/bin/python ~/.dsh/dspy-lab/programs/combo_demo.py "question"
```

Pattern: LlamaIndex `retrieve()` → context string → `dspy.Predict(GroundedQA)`. Compiled DSPy program can be a LangGraph node; retriever can be a PydanticAI/DSPy-ReAct tool.

## Conduct (outranks finishing)

1. **Budget first.** `auto="light"` + `max_metric_calls` default 400. Task/eval cheap model, reflection strong.
2. **Evidence only.** Every number traces to `runs/*.json` (config, metric before/after, calls, seconds). No run → say so, no estimates.
3. **Framework choice explicit.** One log line: why this framework, not DSH native (`tool-workflow`, subagents).
4. **Never edit `compiled/` in place.** New compile → new file. Completed runs append-only.
