#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
tshark -r sample-http-session.pcap -Y 'http.request.uri contains "/api/releases"' -T fields -e http.request.method -e http.request.uri
