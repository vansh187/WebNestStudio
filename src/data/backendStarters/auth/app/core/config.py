"""Settings in one place. In a real deployment these come from environment variables
(os.environ["SECRET_KEY"]) and the secret is never committed to the code."""

SECRET_KEY = "playground-only-secret-change-me-in-production-0123456789"
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30
BCRYPT_ROUNDS = 8  # higher is slower and safer; 12 is a common production value
