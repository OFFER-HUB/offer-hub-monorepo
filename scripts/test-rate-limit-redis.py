import concurrent.futures
import os
import pathlib
import re
import socket
import subprocess
import tempfile
import time

repo = pathlib.Path(__file__).resolve().parents[1]
source = (repo / 'src/lib/rate-limit.ts').read_text()
script = re.search(r'export const RATE_LIMIT_SCRIPT = `([\s\S]*?)`;', source).group(1)
temp_dir = tempfile.TemporaryDirectory(prefix='offerhub-rl-', dir='/tmp')
socket_path = str(pathlib.Path(temp_dir.name) / 'redis.sock')
server = subprocess.Popen([
    os.environ.get('REDIS_SERVER', 'redis-server'), '--port', '0',
    '--unixsocket', socket_path, '--save', '', '--appendonly', 'no',
], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

def command(*args):
    parts = [str(arg).encode() for arg in args]
    payload = ('*%s\r\n' % len(parts)).encode()
    for part in parts:
        payload += ('$%s\r\n' % len(part)).encode() + part + b'\r\n'
    with socket.socket(socket.AF_UNIX) as client:
        client.settimeout(5)
        client.connect(socket_path)
        client.sendall(payload)
        stream = client.makefile('rb')
        def read():
            line = stream.readline().rstrip(b'\r\n')
            if line[:1] == b':':
                return int(line[1:])
            if line[:1] == b'*':
                return [read() for _ in range(int(line[1:]))]
            if line[:1] == b'+':
                return line[1:].decode()
            raise AssertionError(line)
        return read()

def consume(key, limit, window):
    return command('EVAL', script, 1, key, limit, window)

try:
    for _ in range(100):
        if pathlib.Path(socket_path).exists():
            break
        if server.poll() is not None:
            raise RuntimeError(server.stderr.read().decode())
        time.sleep(0.05)

    assert consume('reset', 2, 200)[0] == 1
    assert consume('reset', 2, 200)[0] == 1
    allowed, ttl = consume('reset', 2, 200)
    assert allowed == 0 and 0 < ttl <= 200
    assert consume('other-ip', 2, 200)[0] == 1
    time.sleep(0.22)
    assert consume('reset', 2, 200)[0] == 1
    print('PASS: allowed, limited, independent IP and expiry reset')

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        decisions = list(executor.map(lambda _: consume('concurrent', 3, 10_000), range(20)))
    assert sum(result[0] for result in decisions) == 3
    print('PASS: exactly 3 of 20 concurrent requests admitted')

    before = command('PTTL', 'concurrent')
    time.sleep(0.04)
    assert consume('concurrent', 3, 10_000)[0] == 0
    after = command('PTTL', 'concurrent')
    assert after < before
    print('PASS: rejected requests do not extend expiry')

    command('SET', 'orphan', 99)
    assert consume('orphan', 2, 200)[0] == 1
    assert command('PTTL', 'orphan') > 0
    print('PASS: counter without expiry recovers to a bounded window')
finally:
    server.terminate()
    server.wait(timeout=5)
    temp_dir.cleanup()
