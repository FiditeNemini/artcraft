#!/usr/bin/env python3

import requests
import re
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


def upload(url):
  print("===== Upload W2L =====")

  cookies = { 'session': session_cookie }

  payload = {
    'idempotency_token': str(uuid.uuid4()),
    'title': 'this is a new image template',
    'download_url': url,
  }

  r = requests.post(upload_url, cookies=cookies, json=payload)

  print('Status: {}'.format(r.status_code))
  print(r.content)


upload('https://i.imgur.com/W1EYiPU.jpg')

upload('https://i.imgur.com/NneE7Eq.jpg')

upload('https://i.imgur.com/v8k9yau.jpeg')

upload('https://drive.google.com/file/d/1yoBSb6nwFUZVI4CD-nM2BSofGdBjC8Nn/view?usp=sharing')

upload('https://drive.google.com/file/d/1ysBAdRjlSmfWQPFjGlMJpv_zcGmVw7RC/view?usp=sharing')

upload('https://i.imgur.com/lKaQ4Er.jpg')

upload('https://i.imgur.com/uoGuTJo.jpeg')

