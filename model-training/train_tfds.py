"""
Train the crop-disease model from TensorFlow Datasets' built-in PlantVillage
dataset (downloads automatically — NO Kaggle account, NO API key needed).

Exports into ../public/model/:  model.json + *.bin + labels.json

Run (inside the venv):
  python train_tfds.py --cap 250 --epochs 4
"""
import argparse, json, os, sys
import numpy as np
import tensorflow as tf
import tensorflow_datasets as tfds

IMG = 224
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "public", "model"))
H5_PATH = os.path.join(HERE, "model.h5")
MAP_PATH = os.path.join(HERE, "plantvillage_label_map.json")


def load_map():
    with open(MAP_PATH, encoding="utf-8") as f:
        return {k: v for k, v in json.load(f).items() if not k.startswith("_")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cap", type=int, default=250, help="max images per class")
    ap.add_argument("--epochs", type=int, default=4)
    args = ap.parse_args()

    label_map = load_map()

    print("Loading PlantVillage via TensorFlow Datasets (first run downloads ~1 GB)...")
    ds, info = tfds.load("plant_village", split="train", as_supervised=True, with_info=True)
    names = info.features["label"].names
    print(f"Dataset has {len(names)} classes.")

    # Keep only classes we have advice for (in the label map).
    allowed = [i for i, n in enumerate(names) if n in label_map]
    if not allowed:
        sys.exit("No dataset classes matched the label map — check names.")
    old_to_new = {old: new for new, old in enumerate(allowed)}
    class_keys = [label_map[names[old]] for old in allowed]  # -> diseases.json keys
    print(f"Training on {len(allowed)} classes:")
    for k in class_keys:
        print("  -", k)

    allowed_set = set(allowed)
    cap = args.cap
    counts = {i: 0 for i in allowed}
    X, y = [], []

    print("Collecting a balanced subset (streaming, please wait)...")
    for img, lbl in tfds.as_numpy(ds):
        l = int(lbl)
        if l not in allowed_set or counts[l] >= cap:
            continue
        im = tf.image.resize(img, (IMG, IMG)).numpy().astype("uint8")
        X.append(im)
        y.append(old_to_new[l])
        counts[l] += 1
        if all(counts[i] >= cap for i in allowed):
            break
    X = np.asarray(X, dtype="uint8")
    y = np.asarray(y, dtype="int32")
    print(f"Collected {len(X)} images.")

    # Shuffle + split 85/15.
    idx = np.random.permutation(len(X))
    X, y = X[idx], y[idx]
    n_val = max(1, int(len(X) * 0.15))
    Xv, yv = X[:n_val], y[:n_val]
    Xt, yt = X[n_val:], y[n_val:]

    def pipe(Xa, ya, training):
        d = tf.data.Dataset.from_tensor_slices((Xa, ya))
        d = d.map(lambda im, l: (tf.cast(im, tf.float32) / 255.0, l))
        if training:
            d = d.shuffle(1000)
        return d.batch(32).prefetch(tf.data.AUTOTUNE)

    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet")
    base.trainable = False
    model = tf.keras.Sequential([
        tf.keras.layers.Input((IMG, IMG, 3)),
        base,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(len(allowed), activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(pipe(Xt, yt, True), validation_data=pipe(Xv, yv, False), epochs=args.epochs)

    # Save a Keras H5 model; convert.py turns it into a TF.js LayersModel.
    model.save(H5_PATH)
    with open(os.path.join(HERE, "labels.json"), "w", encoding="utf-8") as f:
        json.dump(class_keys, f, ensure_ascii=False, indent=2)
    print("\nSaved model to", H5_PATH)
    print("Saved labels.json to", HERE)
    print("Next: run convert.py to produce the TF.js model in", OUT_DIR)


if __name__ == "__main__":
    main()
