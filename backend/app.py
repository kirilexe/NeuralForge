# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from pytorch_trainer import train_model

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend


@app.route('/train', methods=['POST'])
def train_model_endpoint():
    data = request.get_json()
    model_layers = data.get('model_layers', [])

    # Default training configuration
    default_config = {
        "epochs": 5,
        "batchSize": 64,
        "optimizer": "Adam"
    }
    training_config = data.get('training_config', default_config)

    # ✅ Call the PyTorch training function
    output, final_loss, final_accuracy = train_model(model_layers, training_config)

    # ✅ Return JSON response
    return jsonify({
        "status": "success",
        "output": output,
        "loss": final_loss,
        "accuracy": final_accuracy
    })


@app.route('/', methods=['GET'])
def status():
    return "Flask API is running! PyTorch backend is ready."


if __name__ == '__main__':
    app.run(debug=True, port=5000)
