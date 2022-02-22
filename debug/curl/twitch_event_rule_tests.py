#!/usr/bin/env python3

import json
import re
import requests
import uuid
import pprint

login_url = 'http://localhost:12345/login'
create_url = 'http://localhost:12345/twitch/event_rule/create'
list_url = 'http://localhost:12345/twitch/event_rule/list'
update_url = 'http://localhost:12345/twitch/event_rule/{}/update'
delete_url = 'http://localhost:12345/twitch/event_rule/{}/delete'


def delete_rule(token, cookies):
    url = delete_url.format(token)
    r = requests.delete(url, cookies=cookies)
    print("===== Deleted Event Rule Output =====")
    print('Status: {}'.format(r.status_code))
    print(r.content)


# ========== Setup / Login ==========

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

# ========== Delete All Existing ==========

r = requests.get(list_url, cookies=cookies)

print("===== List Event Rule Output =====")
print('Status: {}'.format(r.status_code))
response = json.loads(r.content)

tokens = [rule['token'] for rule in response['twitch_event_rules']]
for token in tokens:
    delete_rule(token, cookies)

# ========== Create (1) ==========

payload = {
    'idempotency_token': str(uuid.uuid4()),
    'event_category': 'bits',
    'event_match_predicate': {
        'bits_spend_threshold': {
            'minimum_bits_spent': 2,
        },
    },
    'event_response': {
        'tts_single_voice': {
            'tts_model_token': 'TM:4c1hycjj3a3t', # "Zephyr" voice (dev)
        }
    },
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

response = json.loads(r.content)
token = response['twitch_event_rule_token']

# ========== Create (2) ==========

payload = {
    'idempotency_token': str(uuid.uuid4()),
    'event_category': 'bits',
    'event_match_predicate': {
        'bits_spend_threshold': {
            'minimum_bits_spent': 1,
        },
    },
    'event_response': {
        'tts_single_voice': {
            'tts_model_token': 'TM:40m3aqtt41y0', # "Wakko" voice (dev)
        }
    },
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

response = json.loads(r.content)
token = response['twitch_event_rule_token']

# ========== Update ==========


payload = {
    'event_match_predicate': {
        'bits_spend_threshold': {
            'minimum_bits_spent': 1,
        },
    },
    'event_response': {
        'tts_single_voice': {
            'tts_model_token': 'TM:40m3aqtt41y0', # "Wakko" voice (dev)
        }
    },
    'user_specified_rule_order': 123,
    'rule_is_disabled': True,
}
url = update_url.format(token)
r = requests.post(url, cookies=cookies, json=payload)

print("===== Edited Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)


# ========== Create (3) ==========

payload = {
    'idempotency_token': str(uuid.uuid4()),
    'event_category': 'channel_points',
    'event_match_predicate': {
        'channel_points_reward_name_exact_match': {
            'reward_name': 'My Reward',
        },
    },
    'event_response': {
        'tts_single_voice': {
            'tts_model_token': 'TM:40m3aqtt41y0', # "Wakko" voice (dev)
        }
    },
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

# ========== Create (4) ==========

payload = {
    'idempotency_token': str(uuid.uuid4()),
    'event_category': 'bits',
    'event_match_predicate': {
        'bits_cheermote_name_exact_match': {
            'cheermote_name': 'Cheer1',
        },
    },
    'event_response': {
        'tts_single_voice': {
            'tts_model_token': 'TM:40m3aqtt41y0', # "Wakko" voice (dev)
        }
    },
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

# ========== Create (5) ==========

payload = {
    'idempotency_token': str(uuid.uuid4()),
    'event_category': 'bits',
    'event_match_predicate': {
        'bits_cheermote_prefix_spend_threshold': {
            'cheermote_prefix': 'Cheer',
            'minimum_bits_spent': 5,
        },
    },
    'event_response': {
        'tts_single_voice': {
            'tts_model_token': 'TM:40m3aqtt41y0', # "Wakko" voice (dev)
        }
    },
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

# ========== Create (6) ==========

payload = {
    'idempotency_token': str(uuid.uuid4()),
    'event_category': 'channel_points',
    'event_match_predicate': {
        'channel_points_reward_name_exact_match': {
            'reward_name': 'My Reward',
        },
    },
    'event_response': {
        'tts_random_voice': {
            'tts_model_tokens': [
                'TM:40m3aqtt41y0', # "Wakko" voice (dev)
                'TM:4c1hycjj3a3t', # "Zephyr" voice (dev)
            ],
        }
    },
    'user_specified_rule_order': 0,
    'rule_is_disabled': False,
}

r = requests.post(create_url, cookies=cookies, json=payload)

print("===== Created Event Rule Output =====")
print('Status: {}'.format(r.status_code))
print(r.content)

# ========== List ==========

r = requests.get(list_url, cookies=cookies)

print("===== List Event Rule Output =====")
print('Status: {}'.format(r.status_code))
response = json.loads(r.content)
pprint.pprint(response)

