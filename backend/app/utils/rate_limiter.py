import time
from collections import deque

class RateLimiter:
    def __init__(self, max_calls=20, period=60):
        self.max_calls = max_calls
        self.period = period
        self.calls = deque()

    def allow(self):
        now = time.time()
        while self.calls and now - self.calls[0] > self.period:
            self.calls.popleft()

        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False
