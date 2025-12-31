import tensorflow as tf

model = tf.keras.models.load_model("food_vision_model.keras")

print("Model summary:")
model.summary()

print("\nOutput shape:", model.output_shape)
print("\nLast layer:", model.layers[-1])
