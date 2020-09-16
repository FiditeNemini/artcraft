#!/bin/bash

echo "This is killing all the browsers. Hope that's fine..."

killall /usr/lib/firefox/firefox
killall /usr/lib/chromium-browser/chromium-browser

killall camera
killall ./target/release/camera


