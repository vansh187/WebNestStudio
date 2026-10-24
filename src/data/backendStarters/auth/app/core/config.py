"""Settings in one place. Secrets come from environment variables, never from the code:
add SECRET_KEY=<a long random value> to a .env file in the project root and Run loads it.
The fallback below only keeps the playground working before you do."""
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "playground-only-secret-change-me-in-production-0123456789")
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30
BCRYPT_ROUNDS = 8  # higher is slower and safer; 12 is a common production value
