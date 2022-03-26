#!/usr/bin/env python3

import requests
import re
import uuid
import socket

# There are some things here that will cause my laptop to freeze!
hostname = socket.gethostname()

def print_response(response):
  print('\tStatus: {}'.format(response.status_code))
  for k, v in response.headers.items():
    print('\t header - {}: {}'.format(k, v))
  print('\tbody: {}', response.json())

# ==================== CREATE ACCOUNTS ====================

def create_user_account(username, password, email):
  print('Create account: {}'.format(username))
  signup_url = 'http://localhost:12345/create_account'
  payload = {
    'username': username,
    'password': password,
    'password_confirmation': password,
    'email_address': email,
  }
  r = requests.post(signup_url, json=payload)
  print_response(r)

create_user_account('echelon', 'testing', 'echelon@gmail.com')
create_user_account('brandon', 'testing', 'brandon@storyteller.company')
create_user_account('nanashi', 'nanashi', 'somebody@somewhere.com')
create_user_account('other', 'testing', 'ryu@storyteller.company')
create_user_account('raptor9', 'testing', 'raptor9@storyteller.company')
create_user_account('ryu', 'testing', 'ryu@storyteller.company')

# ==================== LOGIN ====================

def login(username, password):
  print('Login: {}'.format(username))
  login_url = 'http://localhost:12345/login'
  payload = {
    'username_or_email': username,
    'password': password,
  }
  r = requests.post(login_url, json=payload)
  print_response(r)
  raw_set_cookie_header = r.headers['set-cookie']
  m = re.match(r'session=([^;\s]+);', raw_set_cookie_header)
  session_cookie = m.group(1)
  return session_cookie

session_echelon = login('echelon', 'testing')
session_nanashi = login('nanashi', 'nanashi')
session_brandon = login('brandon', 'testing')
session_other = login('other', 'testing')

# ==================== UPLOAD W2L TEMPLATES ====================

def upload_w2l_template(content_url, title, session_cookie):
  print('Upload W2L template')
  upload_url = 'http://localhost:12345/w2l/upload'
  cookies = { 'session': session_cookie }
  payload = {
    'idempotency_token': str(uuid.uuid4()),
    'title': title,
    'download_url': content_url,
  }
  r = requests.post(upload_url, cookies=cookies, json=payload)
  print_response(r)


upload_w2l_template('https://drive.google.com/file/d/1yoBSb6nwFUZVI4CD-nM2BSofGdBjC8Nn/view?usp=sharing', 'Mr. Musk', session_nanashi)
upload_w2l_template('https://drive.google.com/file/d/1ysBAdRjlSmfWQPFjGlMJpv_zcGmVw7RC/view?usp=sharing', 'short bill clinton clip', session_brandon)
upload_w2l_template('https://i.imgur.com/NneE7Eq.jpg', 'itsa me mario!', session_echelon)
upload_w2l_template('https://i.imgur.com/W1EYiPU.jpg', 'Creepy Sonic does a gasp', session_echelon)
upload_w2l_template('https://i.imgur.com/8U3IdUa.png', 'Creepy Sonic actually talks', session_echelon)
upload_w2l_template('https://i.imgur.com/lKaQ4Er.jpg', 'hasta la vista', session_brandon)
upload_w2l_template('https://i.imgur.com/uoGuTJo.jpeg', 'what do you mean vern?', session_brandon)
upload_w2l_template('https://i.imgur.com/v8k9yau.jpeg', 'Miyamoto-san', session_brandon)


if hostname == 'halide':
  upload_w2l_template('https://www.youtube.com/watch?v=a7mS9ZdU6k4', 'Steve Jobs talks', session_echelon)
  upload_w2l_template('https://www.youtube.com/watch?v=6fg8SxgEUYI', 'Paul Graham lectures', session_echelon)

# ==================== UPLOAD TTS MODELS ====================

def upload_tts_model(content_url, title, session_cookie):
  print('Upload TTS model')
  upload_url = 'http://localhost:12345/tts/upload'
  cookies = { 'session': session_cookie }
  payload = {
    'idempotency_token': str(uuid.uuid4()),
    'title': title,
    'download_url': content_url,
  }
  r = requests.post(upload_url, cookies=cookies, json=payload)
  print_response(r)


# From others' Google Drives
#upload_tts_model('https://drive.google.com/file/d/1grwDGbAsPwCMVfye071TZ6PLUub1KGyR/view?usp=sharing', 'Jorgen', session_nanashi)
#upload_tts_model('https://drive.google.com/file/d/1w3oBk5vzyHurqYwP95UEQv-_NeMNu6pt/view?usp=sharing', 'Noire', session_echelon)

# Copied into Storyteller Google Drive
upload_tts_model('https://drive.google.com/file/d/1d8KPwYqbRsGiYx1c4TCW4xCtcRLdIU1s/view?usp=sharing', 'Zephyr', session_echelon)
upload_tts_model('https://drive.google.com/file/d/1yhoamPz1NOMy403gu2v8sIx5hPj3LQWs/view?usp=sharing', 'Wakko Warner', session_other)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1I6KGQZFMMB2ZvCzWEqy9xTgGl0L5cmfP/view?usp=sharing', 'Turret-192', session_echelon)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1T_hvgGcNOfofhNmDWUqpVtYDdSXQrWdE/view?usp=sharing', 'technoblade-324', session_brandon)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1NKyRiex3K1J0QyIv2np17D_H0rE98HyK/view?usp=sharing', 'Noire', session_other)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1VDHDOpsUR8C-MD07vEsnUf1Lpcf8hXg4/view?usp=sharing', 'MatPat80', session_other)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1atFn4vm7mjkufXNK9TZS6J8WzISrAn3-/view?usp=sharing', 'King Julien-70', session_other)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1-rlJpi2jAsagn-UCStcCc_ITNycXgn2F/view?usp=sharing', 'Jorgen', session_other)
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1togTNOEKnaarqWWrbZLSwIbZIZ8IT_qw/view?usp=sharing', 'edsheeransinging', session_nanashi)
# TEMP COMMENT DUE TO RATE LIMIT 
# TEMP COMMENT DUE TO RATE LIMIT upload_tts_model('https://drive.google.com/file/d/1OAiu0cZDyUJMemyLc0Btqw7zEQgiN81D/view?usp=sharing', 'Wakko Warner v2 ST21', session_nanashi)

upload_tts_model('https://drive.google.com/file/d/1vRVI2gQ5tAs8SLQPrR_M1J77L05gGBOp/view?usp=sharing', 'Testing voice', session_nanashi)

#upload_tts_model('', '', session_other)

