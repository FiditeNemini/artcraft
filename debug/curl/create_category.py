#!/usr/bin/env python3

import re
import requests
import uuid

login_url = 'http://localhost:12345/login'
category_create_url = 'http://localhost:12345/category/create'

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

# NB: May not be set due to cookie domain:
#r.cookies['session']

raw_set_cookie_header = r.headers['set-cookie']
m = re.match(r'session=([^;\s]+);', raw_set_cookie_header)
session_cookie = m.group(1)


print("===== Create Category =====")

cookies = { 'session': session_cookie }

payload = {
  'idempotency_token': str(uuid.uuid4()),
  'name': 'First Category',
  'model_type': 'tts', # tts or w2l
  'can_directly_have_models': False,
  'can_have_subcategories': True,
}

r = requests.post(category_create_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)

