# Model folder (Phase 2)

The app runs in **demo mode** until you drop a real model here.

Put these three files in this folder:

```
public/model/
├── model.json        # TensorFlow.js model topology
├── group1-shard1of*.bin   # model weights (one or more .bin files)
└── labels.json       # array of class names, in the SAME order the model outputs
```

## labels.json format

An ordered JSON array. Each string must match a key in `src/ml/diseases.json`
(add new keys there for any class not already covered):

```json
["healthy", "tomato_early_blight", "tomato_late_blight", "grape_downy_mildew"]
```

## How to get model.json

1. Train (or download) a crop-disease model — e.g. on the free **PlantVillage**
   dataset — as a Keras/TensorFlow model.
2. Convert it to TensorFlow.js format:

   ```bash
   pip install tensorflowjs
   tensorflowjs_converter --input_format=keras model.h5 public/model
   ```

3. Make sure `INPUT_SIZE` in `src/ml/classifier.js` matches the model's
   expected input (commonly 224).

That's it — reload the app and it will use the real model automatically.
