"""
Train a crop-disease classifier on PlantVillage and export it for the app.

Output (written into ../public/model/):
  - model.json + *.bin   (TensorFlow.js model)
  - labels.json          (ordered class keys matching src/ml/diseases.json)

Run on Google Colab (free GPU) or any machine with the dataset. See README.md.

Usage:
  python train.py --data /path/to/PlantVillage --epochs 8
"""
import argparse
import json
import os
import shutil

import tensorflow as tf
import tensorflowjs as tfjs

IMG_SIZE = 224
BATCH = 32
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "public", "model"))
MAP_PATH = os.path.join(HERE, "plantvillage_label_map.json")


def load_label_map():
    with open(MAP_PATH, encoding="utf-8") as f:
        raw = json.load(f)
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="PlantVillage folder (class sub-folders)")
    ap.add_argument("--epochs", type=int, default=8)
    args = ap.parse_args()

    label_map = load_label_map()
    supported = set(label_map.keys())

    # Keep only the class folders we support (Maharashtra-relevant crops).
    all_classes = sorted(d for d in os.listdir(args.data)
                         if os.path.isdir(os.path.join(args.data, d)))
    class_names = [c for c in all_classes if c in supported]
    missing = supported - set(class_names)
    if missing:
        print("WARNING: these mapped classes were not found in the dataset:")
        for m in sorted(missing):
            print("  -", m)
    if not class_names:
        raise SystemExit("No supported classes found. Check --data path and the label map.")
    print(f"Training on {len(class_names)} classes.")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        args.data, labels="inferred", label_mode="int", class_names=class_names,
        image_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH,
        validation_split=0.2, subset="training", seed=42)
    val_ds = tf.keras.utils.image_dataset_from_directory(
        args.data, labels="inferred", label_mode="int", class_names=class_names,
        image_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH,
        validation_split=0.2, subset="validation", seed=42)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(AUTOTUNE)
    val_ds = val_ds.prefetch(AUTOTUNE)

    # Transfer learning: MobileNetV2 (small, fast, good on phones).
    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3), include_top=False, weights="imagenet")
    base.trainable = False

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = tf.keras.layers.Rescaling(1.0 / 255)(inputs)  # app feeds pixels/255 too
    x = tf.keras.layers.RandomFlip("horizontal")(x)
    x = tf.keras.layers.RandomRotation(0.1)(x)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(len(class_names), activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)

    model.compile(optimizer="adam",
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    # labels.json: model output order -> our diseases.json keys.
    labels = [label_map[c] for c in class_names]

    if os.path.isdir(OUT_DIR):
        for f in os.listdir(OUT_DIR):
            if f.endswith((".json", ".bin")) and f != "README.md":
                os.remove(os.path.join(OUT_DIR, f))
    os.makedirs(OUT_DIR, exist_ok=True)

    tfjs.converters.save_keras_model(model, OUT_DIR)
    with open(os.path.join(OUT_DIR, "labels.json"), "w", encoding="utf-8") as f:
        json.dump(labels, f, ensure_ascii=False, indent=2)

    print("\nDone. Wrote model.json, weight .bin files and labels.json to:")
    print(" ", OUT_DIR)
    print("Commit those files and push — the app will use the real model automatically.")


if __name__ == "__main__":
    main()
