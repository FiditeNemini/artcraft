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

total_count = 75082057

def get_first_record(cursor):
    query = f"select * from tts_inference_jobs order by id limit 1"
    cursor.execute(query)
    result = cursor.fetchall()
    print(result)
    return result

total_deleted = 0

keep_deleting = True

while keep_deleting:
    query = f"DELETE FROM tts_inference_jobs WHERE id < {SAFE_ID} ORDER BY ID ASC LIMIT {LIMIT}"
    #query = f"DELETE FROM tts_inference_jobs ORDER BY ID asc LIMIT {LIMIT}"
    #print(query)

    cursor.execute(query)
    connection.commit() # NB: Python does not autocommit changes!

    #result = cursor.fetchall()
    count = cursor.rowcount
    total_deleted += count

    percent_deleted = (total_deleted / total_count) * 100.0

    print(f'Deleted {count}; total deleted = {total_deleted} ({percent_deleted:.4f})')

    if count < LIMIT - 1:
        keep_deleting = False

    time.sleep(0.5)

    #record = get_first_record(cursor)
    #time.sleep(2)

