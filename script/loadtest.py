#!/usr/bin/env python3

from urllib.parse import quote
import requests

class LoadtestClient:
    def __init__(self, hostname, port = None):
        if port:
            host = "{}:{}".format(hostname, port)
        else:
            host = hostname
        self.base_url = "http://{}/speak".format(host)

    def make_url(self, sentence):
        sentence = quote(sentence)
        return "{}?v=trump&vol=3&s={}".format(self.base_url, sentence)

    def request(self, sentence):
        url = self.make_url(sentence)
        print(url)
        r = requests.get(url)
        print(r.status_code)


def main():
    client = LoadtestClient('localhost', 9000)

    while True:
        # TODO: Why is "HTTP" broken?
        sentence = "Recreational use of other libraries may result in dangerous side-effects, including: security vulnerabilities, verbose code, reinventing the wheel, constantly reading documentation, depression, headaches, or even death."
        client.request(sentence)

if __name__ == '__main__':
    main()
