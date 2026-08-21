"""Real OpenTelemetry instrumentation for the agent fleet, using the GenAI
semantic conventions (gen_ai.system, gen_ai.request.model, gen_ai.agent.name)
that are the direct mechanism behind Google's "OpenTelemetry-compliant audit
logs" / Agent Observability requirement.

Exports to the console by default (works today, zero cloud dependency).
Swapping the exporter for an OTLP exporter pointed at Cloud Trace or AWS
X-Ray is a one-line config change once real cloud credentials exist - the
spans themselves, and every call site that creates one, stay identical.
"""

from __future__ import annotations

import functools
from typing import Callable, TypeVar

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

_provider = TracerProvider(resource=Resource.create({"service.name": "sentinel-agent-fleet"}))
_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(_provider)

tracer = trace.get_tracer("sentinel.agents")

F = TypeVar("F", bound=Callable)


def traced_agent(agent_name: str, model: str | None = None) -> Callable[[F], F]:
    """Wraps an agent/tool function in a real OTel span carrying GenAI
    semantic-convention attributes, so every real agent action is traceable
    end to end - not a log line claiming observability exists."""

    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            with tracer.start_as_current_span(f"sentinel.agent.{agent_name}") as span:
                span.set_attribute("gen_ai.agent.name", agent_name)
                span.set_attribute("gen_ai.system", "sentinel")
                if model:
                    span.set_attribute("gen_ai.request.model", model)
                try:
                    result = fn(*args, **kwargs)
                    span.set_attribute("sentinel.status", "ok")
                    return result
                except Exception as exc:
                    span.set_attribute("sentinel.status", "error")
                    span.record_exception(exc)
                    raise

        return wrapper  # type: ignore[return-value]

    return decorator
