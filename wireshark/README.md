# Wireshark and tshark notes

`sample-http-session.pcap` is a generated capture between documentation-only addresses `192.0.2.10` and `192.0.2.20`. It contains a TCP handshake, a plain HTTP request to `/api/releases`, a short fictional JSON response, and connection teardown. It contains no real traffic, credentials, people, or company systems.

Useful review steps:

1. Open the capture in Wireshark.
2. Apply `http.request.uri contains "/api/releases"`.
3. Follow the TCP stream.
4. Confirm `X-Request-Id: lab-capture-001` appears in both directions.
5. Compare this intentionally unencrypted exercise with normal HTTPS diagnosis, where endpoint logs or controlled TLS session keys are usually needed.

`display-filters.txt` and `capture-filters.txt` contain additional local filters. `tshark-smoke.sh` and `tshark-smoke.ps1` provide optional command-line checks.
