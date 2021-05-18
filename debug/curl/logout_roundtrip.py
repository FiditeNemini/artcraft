#!/usr/bin/env python3

import requests
import re

login_url = 'http://localhost:12345/login'
logout_url = 'http://localhost:12345/logout'

payload = {
  'username_or_email': 'echelon',
  'password': 'testing',
}

r = requests.post(login_url, json=payload)

print('Login status: {}'.format(r.status_code))

print("==============")
print(r)

print("==============")
print(r.headers)

# May not be set due to cookie domain:
#r.cookies['session']

raw_set_cookie_header = r.headers['set-cookie']
m = re.match(r'session=([^;\s]+);', raw_set_cookie_header)
session_cookie = m.group(1)

cookies = { 'session': session_cookie }

r = requests.post(logout_url, cookies=cookies)

print('Logout status: {}'.format(r.status_code))

