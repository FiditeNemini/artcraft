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

create_user_account('brandon', 'testing', 'brandon@storyteller.company')
create_user_account('echelon', 'testing', 'echelon@gmail.com')
create_user_account('nanashi', 'nanashi', 'somebody@somewhere.com')
create_user_account('ryu', 'testing', 'ryu@storyteller.company')
create_user_account('raptor9', 'testing', 'raptor9@storyteller.company')

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
upload_w2l_template('https://i.imgur.com/lKaQ4Er.jpg', 'hasta la vista', session_brandon)
upload_w2l_template('https://i.imgur.com/uoGuTJo.jpeg', 'what do you mean vern?', session_brandon)
upload_w2l_template('https://i.imgur.com/v8k9yau.jpeg', 'Miyamoto-san', session_brandon)


if hostname == 'halide':
  upload_w2l_template('https://www.youtube.com/watch?v=a7mS9ZdU6k4', 'Steve Jobs talks', session_echelon)

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


upload_tts_model('https://drive.google.com/file/d/1grwDGbAsPwCMVfye071TZ6PLUub1KGyR/view?usp=sharing', 'Jorgen', session_nanashi)
upload_tts_model('https://drive.google.com/file/d/1w3oBk5vzyHurqYwP95UEQv-_NeMNu6pt/view?usp=sharing', 'Noire', session_echelon)

