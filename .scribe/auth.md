# Authenticating requests

To authenticate requests, include a **`X-XSRF-TOKEN`** header with the value **`"{XSRF_TOKEN}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

TeamFlow uses session-based authentication with CSRF protection. First, make a GET request to `/sanctum/csrf-cookie` to obtain a CSRF token, then include it in the `X-XSRF-TOKEN` header for all subsequent requests.
