from flask import Flask, request, jsonify, make_response, Response
from pytorch_trainer import train_model, load_temp_model, test_model, train_generator, test_model_custom_image, TEMP_MODEL_PATH
import os

# for whatever reason the browser blocks the testing requests because of CORS, so the only way
# to make this work is to disable CORS in the browser by running some command??????

app = Flask(__name__)

@app.route('/train', methods=['POST'])
def train_model_endpoint():
    data = request.get_json()
    model_layers = data.get('model_layers', [])

    default_config = {
        "epochs": 5,
        "batchSize": 64,
        "optimizer": "Adam"
    }
    training_config = data.get('training_config', default_config)

    output, final_loss, final_accuracy = train_model(model_layers, training_config)

    return jsonify({
        "status": "success",
        "output": output,
        "loss": final_loss,
        "accuracy": final_accuracy
    })

@app.route('/train_stream', methods=['POST'])
def train_stream():
    data = request.get_json() or {}
    model_layers = data.get('model_layers', [])

    default_config = {
        "epochs": 5,
        "batchSize": 64,
        "optimizer": "Adam"
    }
    training_config = data.get('training_config', default_config)

    def generate():
        for message in train_generator(model_layers, training_config):
            yield message

    return Response(generate(), mimetype='text/event-stream')

@app.route('/test', methods=['POST'])
def test_endpoint():
    model = load_temp_model()

    if model is None:
        return jsonify({
            "status": "error",
            "message": "No trained model found. Please train a model first."
        }), 400
    
    try:
        image_bytes = test_model(model)
        
        # used to delete the model so you could only test it once, fix later.
        # if os.path.exists(TEMP_MODEL_PATH):
        #     os.remove(TEMP_MODEL_PATH)
            
        response = make_response(image_bytes)
        response.headers.set('Content-Type', 'image/png')
        response.headers.set('Content-Disposition', 'attachment', filename='classification.png')
        return response
    
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": f"An error occurred during model testing: {e}"
        }), 500
    
from flask import Flask, request, send_file, jsonify
from PIL import Image
import io

@app.route('/test_custom', methods=['POST'])
def test_custom():
    try:
        # Check if image file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Load the trained model
        model = load_temp_model()
        if model is None:
            return jsonify({'error': 'No trained model found. Please train a model first.'}), 404
        
        # Open the image from the uploaded file
        image = Image.open(file.stream)
        
        # Test the model with the custom image
        image_bytes = test_model_custom_image(model, image)
        
        # Return the visualization as PNG (consistent with /test endpoint)
        response = make_response(image_bytes)
        response.headers.set('Content-Type', 'image/png')
        response.headers.set('Content-Disposition', 'attachment', filename='custom_classification.png')
        return response
        
    except Exception as e:
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

@app.route('/', methods=['GET'])
def status():
    return "Backend is running. Flask ready API on"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
