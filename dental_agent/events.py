"""Event bus for broadcasting real-time slot changes via SSE."""

import asyncio
import json
import logging
from datetime import datetime
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

# Global set of subscriber queues
_subscribers: set[asyncio.Queue] = set()


def broadcast_event(event_type: str, data: dict) -> None:
    """
    Broadcast an event to all connected SSE subscribers.
    Called from synchronous tool code — safely enqueues to async subscribers.
    """
    payload = {
        "type": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    message = json.dumps(payload)
    dead_queues: list[asyncio.Queue] = []

    for q in _subscribers:
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            dead_queues.append(q)
        except Exception:
            dead_queues.append(q)

    for q in dead_queues:
        _subscribers.discard(q)

    if _subscribers:
        logger.debug("Broadcast %s to %d subscribers", event_type, len(_subscribers))


async def subscribe() -> AsyncGenerator[str, None]:
    """
    Yield SSE-formatted messages as they arrive.
    Used by the /api/slots/stream endpoint.
    """
    queue: asyncio.Queue = asyncio.Queue(maxsize=64)
    _subscribers.add(queue)
    try:
        while True:
            message = await queue.get()
            yield f"data: {message}\n\n"
    except asyncio.CancelledError:
        pass
    finally:
        _subscribers.discard(queue)


def subscriber_count() -> int:
    """Return the number of active SSE subscribers."""
    return len(_subscribers)
