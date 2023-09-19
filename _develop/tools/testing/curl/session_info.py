#!/usr/bin/env python3

import requests
import re

login_url = 'http://localhost:12345/login'
session_info_url = 'http://localhost:12345/session'


r = requests.get(session_info_url)

print("===== Session Info (logged out) =====")
print(r.content)

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

cookies = { 'session': session_cookie }

r = requests.get(session_info_url, cookies=cookies)

print("===== Session Info (logged in) =====")
print(r.content)

