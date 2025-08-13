import json, os, subprocess, sys

SRC_DIR = os.environ.get("SRC_DIR", "/mnt/source")
OUT_FILE = os.environ.get("OUT_FILE", "/mnt/output/findings.json")


def run_cmd(cmd, cwd=None, timeout=240):
    p = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        out, err = p.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        p.kill(); return 124, b"", b"timeout"
    return p.returncode, out, err


def run_solhint(src_dir):
    # Collect all .sol files
    files = []
    for root, _, fs in os.walk(src_dir):
        for f in fs:
            if f.endswith('.sol'):
                files.append(os.path.join(root, f))
    if not files:
        return []
    code, out, err = run_cmd(["solhint", "-f", "json", *files])
    try:
        return json.loads(out.decode() or "[]")
    except Exception:
        return []


def run_slither(src_dir):
    # Slither expects a project; scanning '.' works for simple cases
    _code, _out, _err = run_cmd(["slither", ".", "--json", "slither.json"], cwd=src_dir)
    try:
        with open(os.path.join(src_dir, "slither.json"), "r") as f:
            return json.load(f)
    except Exception:
        return {}


def main():
    findings = {"solhint": [], "slither": {}}
    findings["solhint"] = run_solhint(SRC_DIR)
    findings["slither"] = run_slither(SRC_DIR)
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w") as f:
        json.dump(findings, f)
    print("DONE")

if _name_ == "_main_":
    main()

