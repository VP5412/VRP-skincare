import requests

r = requests.post(
    "http://127.0.0.1:8000/api/auth/register",
    json={
        "email": "test@vrpskin.com",
        "password": "test123456",
        "username": "Test User",
        "budget": "1000"
    }
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")
