$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
tshark -r sample-http-session.pcap -Y 'http.request.uri contains "/api/releases"' -T fields -e http.request.method -e http.request.uri
