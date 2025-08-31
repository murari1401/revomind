from datetime import datetime, timedelta
from typing import Dict, List

class RateLimiter:
    def __init__(self, max_requests: int = 50, time_window: int = 3600):
        self.max_requests = max_requests
        self.time_window = time_window  # in seconds
        self.requests: Dict[str, List[datetime]] = {}

    def can_make_request(self, user_id: str) -> bool:
        now = datetime.now()
        if user_id not in self.requests:
            self.requests[user_id] = []

        # Remove old requests outside the time window
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if now - req_time < timedelta(seconds=self.time_window)
        ]

        # Check if under rate limit
        if len(self.requests[user_id]) < self.max_requests:
            self.requests[user_id].append(now)
            return True
        return False

OPENROUTER_API_KEYS = [
    "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",
    "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"
]

# Initialize rate limiter - 50 requests per hour per user
rate_limiter = RateLimiter(max_requests=50, time_window=3600)