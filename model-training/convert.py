"""
Convert the trained model.h5 into a TF.js LayersModel in ../public/model/.
Run inside the CONVERSION venv (which has tensorflowjs installed):

  python convert.py
"""
import json, os, shutil, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
H5 = os.path.join(HERE, "model.h5")
LABELS = os.path.join(HERE, "labels.json")
OUT = os.path.abspath(os.path.join(HERE, "..", "public", "model"))

if not os.path.exists(H5):
    raise SystemExit("model.h5 not found — run train_tfds.py first.")

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith((".json", ".bin")):
        os.remove(os.path.join(OUT, f))

subprocess.run(
    ["tensorflowjs_converter", "--input_format=keras", H5, OUT],
    check=True,
)
shutil.copy(LABELS, os.path.join(OUT, "labels.json"))
print("Wrote TF.js model + labels.json to", OUT)
