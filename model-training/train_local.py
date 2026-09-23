"""
Train a crop-disease classifier from a LOCAL folder of class sub-folders
(one folder per disease class). Used for datasets downloaded from Mendeley etc.

Saves a Keras .h5 + a labels.json (class keys in model-output order).
Convert to TF.js afterwards with convert.py / the CI workflow.

Usage:
  python train_local.py --data data/sugarcane --out model-sugarcane.h5 \
      --labels labels-sugarcane.json --map map-sugarcane.json --epochs 6
"""
import argparse, json, os, re
import tensorflow as tf

IMG = 224
BATCH = 32
HERE = os.path.dirname(os.path.abspath(__file__))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.strip().lower()).strip("_")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="folder with one sub-folder per class")
    ap.add_argument("--out", required=True, help="output .h5 path")
    ap.add_argument("--labels", required=True, help="output labels.json path")
    ap.add_argument("--map", default="", help="optional JSON mapping folder name -> diseases.json key")
    ap.add_argument("--epochs", type=int, default=6)
    args = ap.parse_args()

    data_dir = args.data if os.path.isabs(args.data) else os.path.join(HERE, args.data)
    fmap = {}
    if args.map:
        mp = args.map if os.path.isabs(args.map) else os.path.join(HERE, args.map)
        if os.path.exists(mp):
            with open(mp, encoding="utf-8") as f:
                fmap = json.load(f)

    train = tf.keras.utils.image_dataset_from_directory(
        data_dir, validation_split=0.2, subset="training", seed=42,
        image_size=(IMG, IMG), batch_size=BATCH)
    val = tf.keras.utils.image_dataset_from_directory(
        data_dir, validation_split=0.2, subset="validation", seed=42,
        image_size=(IMG, IMG), batch_size=BATCH)
    class_names = train.class_names
    print("Classes:", class_names)

    AUTOTUNE = tf.data.AUTOTUNE
    norm = tf.keras.layers.Rescaling(1.0 / 255)
    aug = tf.keras.Sequential([tf.keras.layers.RandomFlip("horizontal"),
                               tf.keras.layers.RandomRotation(0.1)])
    train = train.map(lambda x, y: (aug(norm(x)), y)).prefetch(AUTOTUNE)
    val = val.map(lambda x, y: (norm(x), y)).prefetch(AUTOTUNE)

    base = tf.keras.applications.MobileNetV2(input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet")
    base.trainable = False
    model = tf.keras.Sequential([
        tf.keras.layers.Input((IMG, IMG, 3)), base,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(len(class_names), activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train, validation_data=val, epochs=args.epochs)

    keys = [fmap.get(c, slug(c)) for c in class_names]
    out = args.out if os.path.isabs(args.out) else os.path.join(HERE, args.out)
    lbl = args.labels if os.path.isabs(args.labels) else os.path.join(HERE, args.labels)
    model.save(out)
    with open(lbl, "w", encoding="utf-8") as f:
        json.dump(keys, f, ensure_ascii=False, indent=2)
    print("Saved model ->", out)
    print("Saved labels ->", lbl, "=", keys)


if __name__ == "__main__":
    main()
