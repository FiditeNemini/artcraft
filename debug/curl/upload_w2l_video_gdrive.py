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


print("===== Upload W2L =====")

cookies = { 'session': session_cookie }

# mario.zip
#download_url = 'https://drive.google.com/file/d/15-tkgblTZpa0ifmvvyr_kgWy2cguTpAe/view?usp=sharing'
# elon_integration_test.jpg
#download_url = 'https://drive.google.com/file/d/1yoBSb6nwFUZVI4CD-nM2BSofGdBjC8Nn/view?usp=sharing'
# bill-integration-test.mp4
# NB: This freezes up my poor laptop:
###download_url = 'https://drive.google.com/file/d/14yO_60lc1FJCYhDGaeiQabgGvYLa86WI/THIS_IS_TOO_BIGview?usp=sharing'
# bill-integration-small.mp4 (small enough to run on my laptop)
download_url = 'https://drive.google.com/file/d/1ysBAdRjlSmfWQPFjGlMJpv_zcGmVw7RC/view?usp=sharing'

payload = {
  'idempotency_token': str(uuid.uuid4()),
  'title': 'this is a new image template',
  'download_url': download_url,
}

r = requests.post(upload_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)

