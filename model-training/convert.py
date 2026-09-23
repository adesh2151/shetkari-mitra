"""
Convert trained Keras .h5 model(s) into TF.js LayersModel(s) under public/model/.
Handles the field-crops model and any per-crop models that exist.
Run in the CONVERSION env (has tensorflowjs): python convert.py
"""
import json, os, shutil, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.abspath(os.path.join(HERE, "..", "public", "model"))

# (h5 file, labels file, output dir) — only those present are converted.
JOBS = [
    ("model.h5", "labels.json", PUB),
    ("model-sugarcane.h5", "labels-sugarcane.json", os.path.join(PUB, "sugarcane")),
]

for h5, labels, out in JOBS:
    h5p = os.path.join(HERE, h5)
    lblp = os.path.join(HERE, labels)
    if not os.path.exists(h5p):
        print("skip (no file):", h5)
        continue
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith((".json", ".bin")):
            os.remove(os.path.join(out, f))
    subprocess.run(["tensorflowjs_converter", "--input_format=keras", h5p, out], check=True)
    if os.path.exists(lblp):
        shutil.copy(lblp, os.path.join(out, "labels.json"))
    print("Converted", h5, "->", out)
