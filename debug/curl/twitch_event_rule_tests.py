#!/usr/bin/env python3

import json
import re
import requests
import uuid

login_url = 'http://localhost:12345/login'
create_url = 'http://localhost:12345/twitch/event_rule/create'
list_url = 'http://localhost:12345/twitch/event_rule/list'
update_url = 'http://localhost:12345/twitch/event_rule/update/{}'
delete_url = 'http://localhost:12345/twitch/event_rule/delete/{}'

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
    'event_category': 'channel_points',
    'event_match_predicate': 'TODO testing this',
    'event_response': 'TODO testing this',
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

response = json.loads(r.content)
token = response['twitch_event_rule_token']

payload = {
    'event_match_predicate': 'Updated',
    'event_response': 'Updated 2',
    'user_specified_rule_order': 123,
    'rule_is_disabled': True,
}
url = update_url.format(token)
r = requests.post(url, cookies=cookies, json=payload)

print("===== Edited Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

r = requests.get(list_url, cookies=cookies)

print("===== List Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

url = delete_url.format(token)
r = requests.delete(url, cookies=cookies)

print("===== Deleted Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

