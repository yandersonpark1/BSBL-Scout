"""
Async retry helper with exponential backoff + jitter.

Used to guard the analysis pipeline against *transient* failures (e.g. a
threadpool hiccup or a fleeting resource error) while never retrying
deterministic client errors such as :class:`CsvValidationError` — retrying a
malformed file would only waste time and return the same failure.
"""
from __future__ import annotations

import asyncio
import random
from typing import Awaitable, Callable, TypeVar

T = TypeVar("T")


async def retry_async(
    operation: Callable[[], Awaitable[T]],
    *,
    attempts: int = 3,
    base_delay: float = 0.2,
    max_delay: float = 2.0,
    retry_on: tuple[type[BaseException], ...] = (Exception,),
    do_not_retry: tuple[type[BaseException], ...] = (),
) -> T:
    """
    Run ``operation`` (an async thunk), retrying on transient errors.

    Args:
        operation: Zero-arg coroutine function to execute.
        attempts: Total tries (>= 1).
        base_delay: Initial backoff in seconds; doubles each retry.
        max_delay: Upper bound on any single backoff.
        retry_on: Exception types that are considered transient and retried.
        do_not_retry: Exception types that must fail fast (checked first), e.g.
            validation errors.

    Returns:
        The result of ``operation``.

    Raises:
        The last exception if every attempt fails, or any ``do_not_retry`` error
        immediately.
    """
    last_exc: BaseException | None = None
    for attempt in range(1, max(1, attempts) + 1):
        try:
            return await operation()
        except do_not_retry:
            raise
        except retry_on as exc:
            last_exc = exc
            if attempt >= attempts:
                break
            delay = min(max_delay, base_delay * (2 ** (attempt - 1)))
            delay += random.uniform(0, base_delay)  # jitter to avoid lockstep
            await asyncio.sleep(delay)

    assert last_exc is not None  # unreachable: loop only breaks after a failure
    raise last_exc
