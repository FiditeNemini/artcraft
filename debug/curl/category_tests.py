#!/usr/bin/env python3

import json
import re
import requests
import uuid

login_url = 'http://localhost:12345/login'
category_create_url = 'http://localhost:12345/category/create'
category_delete_url_format = 'http://localhost:12345/category/{}/delete'
category_edit_url_format = 'http://localhost:12345/category/{}/edit'
tts_model_list_url = 'http://localhost:12345/tts/list'
tts_category_assignment_url = 'http://localhost:12345/category/assign/tts'

payload = {
  'username_or_email': 'echelon',
  'password': 'testing',
}

r = requests.post(login_url, json=payload)

print("===== [1] Login =====")
print('Status: {}'.format(r.status_code))
print(r.content)
for k, v in r.headers.items():
  print('  {}: {}'.format(k, v))

# NB: May not be set due to cookie domain:
#r.cookies['session']

raw_set_cookie_header = r.headers['set-cookie']
m = re.match(r'session=([^;\s]+);', raw_set_cookie_header)
session_cookie = m.group(1)


print("===== [2] Create Category =====")

cookies = { 'session': session_cookie }

payload = {
  'idempotency_token': str(uuid.uuid4()),
  'name': 'First Category',
  'model_type': 'tts', # tts or w2l
  'can_directly_have_models': False,
  'can_have_subcategories': True,
  'is_mod_approved': True,
}

r = requests.post(category_create_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))

d = json.loads(r.content)
category_token = d['token']

print(f'created category token: #{category_token}')


print("===== [3] (Soft) Delete Category =====")

category_delete_url = category_delete_url_format.format(category_token)

cookies = { 'session': session_cookie }

payload = {
  'set_delete': True,
}

r = requests.post(category_delete_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)


print("===== [4] Undelete Category =====")

cookies = { 'session': session_cookie }

payload = {
  'set_delete': False,
}

r = requests.post(category_delete_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)


print("===== [5] Edit Category =====")

category_edit_url = category_edit_url_format.format(category_token)

cookies = { 'session': session_cookie }

payload = {
  'name': 'Edited Name',
  'dropdown_name': 'Edited Dropdown Name',
  'can_directly_have_models': True,
  'can_have_subcategories': True,
  'can_only_mods_apply': False,
  'is_mod_approved': True,
  'maybe_mod_comments': 'mod comment',
}

r = requests.post(category_edit_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)


print("===== [6] List TTS Models =====")

r = requests.get(tts_model_list_url, cookies=cookies)

print('Status: {}'.format(r.status_code))

d = json.loads(r.content)

tts_model_token = d['models'][0]['model_token']

print('TTS model token: {}'.format(tts_model_token))


print("===== [7] Create Category Assignment to TTS Model =====")

payload = {
  'category_token': category_token,
  'tts_model_token': tts_model_token,
  'assign': True,
}

r = requests.post(tts_category_assignment_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)


print("===== [8] Delete Category Assignment to TTS Model =====")

payload = {
  'category_token': category_token,
  'tts_model_token': tts_model_token,
  'assign': False,
}

r = requests.post(tts_category_assignment_url, cookies=cookies, json=payload)

print('Status: {}'.format(r.status_code))
print(r.content)

