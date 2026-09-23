# Training the real AI model (free, on Google Colab GPU)

This turns the app from demo mode into **real** disease detection.
You do NOT need a powerful computer — Google Colab gives you a free GPU.

## Option A — Google Colab (recommended, free GPU, ~30–40 min)

1. Open https://colab.research.google.com → New notebook.
2. Runtime → Change runtime type → **T4 GPU** → Save.
3. Paste and run these cells one by one:

**Cell 1 — get the code**
```python
!git clone https://github.com/adesh2151/shetkari-mitra.git
%cd shetkari-mitra/model-training
!pip install -q tensorflowjs==4.17.0
```

**Cell 2 — download the PlantVillage dataset (free, from Kaggle)**
```python
# Upload your kaggle.json (Kaggle > Account > Create New API Token) when prompted
from google.colab import files; files.upload()
!mkdir -p ~/.kaggle && cp kaggle.json ~/.kaggle/ && chmod 600 ~/.kaggle/kaggle.json
!pip install -q kaggle
!kaggle datasets download -d abdallahalidev/plantvillage-dataset -p /content --unzip
# The color images are under this folder:
DATA = "/content/plantvillage dataset/color"
```

**Cell 3 — train + export**
```python
!python train.py --data "/content/plantvillage dataset/color" --epochs 8
```

**Cell 4 — download the trained model files**
```python
from google.colab import files
import shutil
shutil.make_archive("model", "zip", "../public/model")
files.download("model.zip")
```

4. Unzip `model.zip` into your local `public/model/` folder (replacing the
   README there is fine to keep). You should have `model.json`, one or more
   `*.bin` files, and `labels.json`.
5. Commit and push:
   ```bash
   cd ~/git-personal/shetkari-mitra
   git add public/model
   git commit -m "Add trained crop-disease model"
   git push
   ```
   GitHub Actions redeploys the PWA automatically — detection is now real.

## Option B — Local machine

Needs Python 3.10/3.11 and ideally a GPU. Slow on CPU.
```bash
cd model-training
pip install -r requirements.txt
# Download PlantVillage (see Kaggle link above), then:
python train.py --data "/path/to/plantvillage dataset/color" --epochs 8
```

## What gets trained

Only the Maharashtra-relevant crops PlantVillage covers: **tomato, potato,
grape, corn (maize), chilli/capsicum**. The class list and how each maps to the
app's advice keys is in `plantvillage_label_map.json`.

## Crops PlantVillage does NOT cover

Cotton, sugarcane, onion, soybean, pomegranate, wheat, rice and others are not
in PlantVillage. Their advice entries exist in `src/ml/diseases.json` for the
future, but detecting them needs extra datasets (a separate training task).
