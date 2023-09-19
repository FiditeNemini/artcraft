#!/usr/bin/env python3

import re
import requests
import uuid

login_url = 'http://localhost:12345/login'
upload_url = 'http://localhost:12345/w2l/upload'

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


print("===== Upload W2L =====")

cookies = { 'session': session_cookie }

payload = {
  'idempotency_token': str(uuid.uuid4()),
  'title': 'this is a new text to W2L template',
  'download_url': 'https://video.com',
}

r = requests.post(upload_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)

