"""Download Poly Haven (CC0) assets at a given resolution into a folder.

usage: python fetch_polyhaven.py <out_dir> <res> hdri:<id> tex:<id> model:<id> ...
HDRIs -> <out>/hdri/<id>.hdr; textures -> <out>/tex/<id>/{diff,nor_gl,rough}.jpg;
models -> <out>/models/<id>/<id>.gltf (+ .bin and textures).
"""
import json, os, sys, time, urllib.request
UA = {"User-Agent": "short-video-director-asset-fetch/1.0"}

def get(url):
    for i in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        except Exception as e:
            err = e; time.sleep(3 * (i + 1))
    raise err

def save(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        open(path, "wb").write(get(url))

out, res = sys.argv[1], sys.argv[2]
manifest = []
for spec in sys.argv[3:]:
    kind, aid = spec.split(":", 1)
    files = json.loads(get(f"https://api.polyhaven.com/files/{aid}"))
    if kind == "hdri":
        f = files["hdri"][res]["hdr"]; save(f["url"], f"{out}/hdri/{aid}.hdr")
    elif kind == "tex":
        for m, name in [("Diffuse", "diff"), ("nor_gl", "nor_gl"), ("Rough", "rough")]:
            if m in files and res in files[m]:
                save(files[m][res]["jpg"]["url"], f"{out}/tex/{aid}/{name}.jpg")
    elif kind == "model":
        g = files["gltf"][res]["gltf"]
        save(g["url"], f"{out}/models/{aid}/{aid}.gltf")
        for rel, inc in g.get("include", {}).items():
            save(inc["url"], f"{out}/models/{aid}/{rel}")
    manifest.append({"id": aid, "kind": kind, "res": res, "source": f"https://polyhaven.com/a/{aid}", "license": "CC0"})
    print("ok", kind, aid, flush=True)
    time.sleep(0.5)
mf = f"{out}/polyhaven_manifest.json"
old = json.load(open(mf)) if os.path.exists(mf) else []
ids = {(m["kind"], m["id"]) for m in manifest}
json.dump([m for m in old if (m["kind"], m["id"]) not in ids] + manifest, open(mf, "w"), indent=1)
