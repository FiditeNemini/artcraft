#!/usr/bin/env python

# FIXME: Needs packages 'toml' and 'mysql-connector-python'. Put in requirements.txt.

import time
import toml
import mysql.connector

DB_SECRETS_FILE = 'db_secrets.toml'

# TODO: Share db-related setup when more scripts are added.

def read_database_secrets(secrets_file = DB_SECRETS_FILE):
    secrets = None
    with open(secrets_file, "r") as f:
        secrets = toml.load(f)

    required_keys = ['database', 'hostname', 'port', 'password', 'username']
    for key in required_keys:
        if key not in secrets:
            raise Exception(f"Required key '#{key}' not present")

    return secrets

def connect_to_mysql():
    secrets = read_database_secrets()
    connection = mysql.connector.connect(
        host = secrets['hostname'],
        port = secrets['port'],
        user = secrets['username'],
        password = secrets['password'],
        database = secrets['database'],
    )
    return connection

connection = connect_to_mysql()
cursor = connection.cursor()

SAFE_ID = 76000000 # Reasonably completed on 2022-06-24
LIMIT = 100000

#def get_record_count():
#    query = f"SELECT COUNT(*) FROM tts_inference_jobs"
#    cursor.execute(query)
#    result = cursor.fetchall()
#    print(result)
#    return result[0]
#
##total_count = get_record_count()

#total_count = 75082057
total_count = 21925602

def get_user_tokens(cursor):
    query = f"""
		SELECT
			r.maybe_creator_user_token, r.creator_ip_address
		FROM
			tts_results as r
				LEFT OUTER JOIN
			users as u
			ON
					r.maybe_creator_user_token = u.token
		WHERE
				r.raw_inference_text LIKE '%spidermant%'
		AND r.created_at > ( CURDATE() - INTERVAL 1 HOUR )
    """
    cursor.execute(query)
    results = cursor.fetchall()

    user_tokens = [row[0] for row in results]
    user_tokens = [token for token in user_tokens if token is not None]
    user_tokens = set(user_tokens)

    ip_addresses = [row[1] for row in results]
    ip_addresses = [ip for ip in ip_addresses if ip is not None]
    ip_addresses = set(ip_addresses)

    return (user_tokens, ip_addresses)

(user_tokens, ip_addresses) = get_user_tokens(cursor)

print(user_tokens)
print(len(user_tokens))
print(len(ip_addresses))

with open('101_user_tokens.txt', 'w') as f:
    for user_token in user_tokens:
        f.write(user_token)
        f.write("\n")

with open('101_ip_addresses.txt', 'w') as f:
    for ip in ip_addresses:
        f.write(ip)
        f.write("\n")





