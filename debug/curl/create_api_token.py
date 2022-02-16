#!/usr/bin/env python3

import requests
import re
import uuid

login_url = 'http://localhost:12345/login'
create_api_token_url = 'http://localhost:12345/api_tokens/create'

payload = {
    'username_or_email': 'echelon',
    'password': 'testing',
}

r = requests.post(login_url, json=payload)

print("===== Login =====")
print('Status: {}'.format(r.status_code))
print(r.content)
for k, v in r.headers.items():
    print('  {}: {}'.format(k, v))

raw_set_cookie_header = r.headers['set-cookie']
m = re.match(r'session=([^;\s]+);', raw_set_cookie_header)
session_cookie = m.group(1)

cookies = { 'session': session_cookie }

payload = {
    'idempotency_token': str(uuid.uuid4()),
}

r = requests.post(create_api_token_url, cookies=cookies, json=payload)

print("===== Created API Token =====")
print('Status: {}'.format(r.status_code))
print(r.content)

