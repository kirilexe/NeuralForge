from flask import Flask, request, jsonify, make_response, Response, send_file
from pytorch_trainer import train_model, load_temp_model, test_model, train_generator, test_model_custom_image, download_model, TEMP_MODEL_PATH
import os
from io import BytesIO
import shutil

CUSTOM_DATASET_PATH = './custom_data'

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


@app.route('/download_model', methods=['GET'])
def download_model_route():
    """Flask route to send the model file for download."""
    model_bytes = download_model()
    if model_bytes is None:
        return Response("Model not found", status=404)
    
    return send_file(
        BytesIO(model_bytes),
        as_attachment=True,
        download_name="model.pth",  # name shown in browser download
        mimetype="application/octet-stream"
    )

import os
import shutil

# Add this constant
CUSTOM_DATASET_PATH = './custom_data'

@app.route('/upload_dataset', methods=['POST'])
def upload_dataset():
    try:
        print("Upload dataset endpoint hit")  # Debug log
        
        # Create custom data directory if it doesn't exist
        os.makedirs(CUSTOM_DATASET_PATH, exist_ok=True)
        
        # Check if we're using MNIST (clear custom dataset)
        if 'use_mnist' in request.form:
            print("Clearing custom dataset, using MNIST")  # Debug log
            # Clear any existing custom dataset files
            for filename in os.listdir(CUSTOM_DATASET_PATH):
                file_path = os.path.join(CUSTOM_DATASET_PATH, filename)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
            
            return jsonify({
                "status": "success",
                "message": "Using MNIST dataset. Custom dataset cleared."
            })
        
        # Handle custom dataset upload
        if 'dataset' not in request.files:
            return jsonify({"error": "No dataset file provided"}), 400
        
        file = request.files['dataset']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        print(f"Uploading custom dataset: {file.filename}")  # Debug log
        
        # Clear previous custom dataset first
        for filename in os.listdir(CUSTOM_DATASET_PATH):
            file_path = os.path.join(CUSTOM_DATASET_PATH, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")
        
        # Save the new dataset file
        filename = file.filename
        file_path = os.path.join(CUSTOM_DATASET_PATH, filename)
        file.save(file_path)
        
        return jsonify({
            "status": "success",
            "message": f"Custom dataset '{filename}' uploaded successfully"
        })
        
    except Exception as e:
        print(f"Error in upload_dataset: {str(e)}")  # Debug log
        return jsonify({"error": f"Error handling dataset: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def status():
    return "Backend is running. Flask ready API on"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
