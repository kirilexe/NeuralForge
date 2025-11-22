import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import os
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import numpy as np
import random
import io
import json
import threading
import queue
from PIL import Image
import zipfile
import pandas as pd
from PIL import Image
from torch.utils.data import Dataset
import plotly.graph_objects as go

TEMP_MODEL_PATH = './temp_model_state.pth'
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CONFUSION_MATRIX_DATA = None

def plot_confusion_matrix():
    """Creates and returns a Plotly confusion matrix as image bytes."""
    global CONFUSION_MATRIX_DATA
    
    if CONFUSION_MATRIX_DATA is None:
        # Return a simple "no data" image
        fig = go.Figure()
        fig.update_layout(
            title="No confusion matrix data available. Train a model first.",
            xaxis_title="Predicted Label",
            yaxis_title="True Label",
        )
        img_bytes = fig.to_image(format="png")
        return img_bytes
    
    predictions = CONFUSION_MATRIX_DATA['predictions']
    labels = CONFUSION_MATRIX_DATA['labels']
    num_classes = CONFUSION_MATRIX_DATA['num_classes']
    
    # Calculate confusion matrix
    confusion_mat = np.zeros((num_classes, num_classes), dtype=int)
    for true_label, pred_label in zip(labels, predictions):
        confusion_mat[true_label, pred_label] += 1
    
    # Get class names from the same source as testing
    global _TEST_DATASET_CACHE
    
    if _TEST_DATASET_CACHE is not None:
        # Use cached class names from test dataset
        _, class_names = _TEST_DATASET_CACHE
        print(f"Using cached class names: {class_names}")
    else:
        # Get class names the same way test_model does
        custom_dataset_path = './custom_data'
        test_path = os.path.join(custom_dataset_path, 'test')
        
        if os.path.exists(test_path):
            test_dataset = datasets.ImageFolder(root=test_path)
            class_names = test_dataset.classes
            print(f"Using custom dataset classes: {class_names}")
        else:
            # Use the same fallback as test_model
            saved_data = torch.load(TEMP_MODEL_PATH, map_location=DEVICE)
            input_channels = saved_data.get('input_channels', 1)
            
            if input_channels == 1:
                class_names = [str(i) for i in range(10)]
                print("Using MNIST class names (0-9)")
            else:
                class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer', 
                              'dog', 'frog', 'horse', 'ship', 'truck']
                print("Using CIFAR-10 class names")
    
    # Make sure we have the right number of class names
    if len(class_names) != num_classes:
        print(f"Warning: Class names count ({len(class_names)}) doesn't match num_classes ({num_classes}). Using numeric labels.")
        class_names = [str(i) for i in range(num_classes)]
    
    # Create Plotly heatmap
    fig = go.Figure(data=go.Heatmap(
        z=confusion_mat,
        x=class_names,  # Use actual class names instead of numeric indices
        y=class_names,  # Use actual class names instead of numeric indices
        colorscale='Viridis',
        hoverongaps=False,
        hovertemplate='True: %{y}<br>Predicted: %{x}<br>Count: %{z}<extra></extra>'
    ))
    
    fig.update_layout(
        title='Confusion Matrix',
        xaxis_title='Predicted Label',
        yaxis_title='True Label',
        width=600,
        height=600
    )
    
    # Convert to image bytes
    img_bytes = fig.to_image(format="png")
    return img_bytes

def build_dynamic_cnn(layers, input_channels=1, input_size=28, num_classes=10):
    model_layers = []
    current_channels = input_channels
    current_size = input_size
    
    # Process user-defined middle layers
    for layer in layers:
        layer_type = layer.get('type')
        
        if layer_type == 'Convolutional':
            out_channels = layer.get('outputChannels', 32)
            kernel_size = layer.get('kernelSize', 3)
            activation_name = layer.get('activation', 'ReLU')

            # Add conv layer
            model_layers.append(nn.Conv2d(current_channels, out_channels, kernel_size, padding=1))
            current_channels = out_channels
            
            # Add activation
            if activation_name == 'ReLU':
                model_layers.append(nn.ReLU())
            elif activation_name == 'Sigmoid':
                model_layers.append(nn.Sigmoid())
            elif activation_name == 'Tanh':
                model_layers.append(nn.Tanh())
                
            # Add Max Pooling to reduce size by half
            model_layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
            current_size //= 2
            
        elif layer_type == 'Fully Connected':
            # If we hit a FC layer, stop conv processing and flatten
            break

    # Flatten before FC layers
    flatten_size = current_channels * current_size * current_size
    model_layers.append(nn.Flatten())

    # Process FC layers (user-defined middle layers)
    input_units = flatten_size
    for layer in layers:
        layer_type = layer.get('type')
        
        if layer_type == 'Fully Connected':
            output_units = layer.get('units', 128)
            activation_name = layer.get('activation', 'ReLU')

            model_layers.append(nn.Linear(input_units, output_units))
            input_units = output_units

            # Add activation for FC layers
            if activation_name == 'ReLU':
                model_layers.append(nn.ReLU())
            elif activation_name == 'Sigmoid':
                model_layers.append(nn.Sigmoid())
            elif activation_name == 'Tanh':
                model_layers.append(nn.Tanh())

    # Output layer
    model_layers.append(nn.Linear(input_units, num_classes))
    model_layers.append(nn.Softmax(dim=1))

    return nn.Sequential(*model_layers)


def calculate_input_size(layers, input_size=28):
    """Calculate the final size after conv and pooling layers"""
    current_size = input_size
    
    for layer in layers:
        layer_type = layer.get('type')
        
        if layer_type == 'Convolutional':
            # Conv with padding=1 doesn't change size
            # MaxPool reduces size by half
            current_size //= 2
            
        elif layer_type == 'Fully Connected':
            # Stop when we hit FC layers
            break
    
    return current_size

def train_model(layers, config, progress_callback=None):
    """Loads data, builds model, and runs a basic PyTorch training loop."""

    global _TEST_DATASET_CACHE
    global CONFUSION_MATRIX_DATA  # Access global variable
    
    _TEST_DATASET_CACHE = None
    CONFUSION_MATRIX_DATA = None  # Reset confusion matrix data
    
    # Check if custom dataset exists
    custom_dataset_path = './custom_data'
    has_custom_dataset = os.path.exists(custom_dataset_path) and os.listdir(custom_dataset_path)
    
    if has_custom_dataset:
        print("Custom dataset detected - loading from ZIP file...")
        try:
            train_dataset, test_dataset, dataset_info = load_custom_zip_dataset(custom_dataset_path)
            print(f"✅ Custom dataset loaded: {dataset_info}")
            
            # Use detected parameters
            input_channels = dataset_info['channels']
            input_size = dataset_info['image_size']
            num_classes = dataset_info['num_classes']
            
            print(f"Detected input size: {input_size}x{input_size}, channels: {input_channels}, classes: {num_classes}")
                
        except Exception as e:
            print(f"❌ Failed to load custom dataset: {e}")
            print("🔄 Falling back to MNIST dataset...")
            # Use MNIST as default
            transform = transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize((0.1307,), (0.3081,))
            ])
            train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
            test_dataset = datasets.MNIST('./data', train=False, transform=transform)
            input_channels, input_size, num_classes = 1, 28, 10
    else:
        # Use MNIST as default
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,))
        ])
        train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
        test_dataset = datasets.MNIST('./data', train=False, transform=transform)
        input_channels, input_size, num_classes = 1, 28, 10
    
    # Build model with detected parameters
    try:
        model = build_dynamic_cnn(layers, input_channels, input_size, num_classes).to(DEVICE)
    except Exception as e:
        return [f"ERROR: Could not build model. Details: {e}"], 0.0, 0.0
    
    # Rest of the function remains exactly the same...
    subset_indices = torch.randperm(len(train_dataset))
    
    # Check for demo mode
    if config.get('demo_mode', False):
        print("⚠️ DEMO MODE: Using only 5000 samples")
        subset_indices = subset_indices[:5000] #[:5000] # for demo mode, use only 5000
    train_subset = torch.utils.data.Subset(train_dataset, subset_indices)
    
    batch_size = config.get('batchSize', 64)
    epochs = config.get('epochs', 3)
    
    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=1000, shuffle=False)
    
    criterion = nn.CrossEntropyLoss()
    optimizer_name = config.get('optimizer', 'Adam')
    
    if optimizer_name == 'Adam':
        optimizer = optim.Adam(model.parameters(), lr=0.001)
    elif optimizer_name == 'SGD':
        optimizer = optim.SGD(model.parameters(), lr=0.01)
    else:
        optimizer = optim.Adam(model.parameters(), lr=0.001)

    output_log = ["=================================================="]
    output_log.append(f"Model built with PyTorch on device: {DEVICE}")
    output_log.append(f"Training Config: Epochs={epochs}, Batch={batch_size}, Opt={optimizer_name}")
    output_log.append(f"Input: {input_channels} channel(s), {input_size}x{input_size} images")
    output_log.append(f"Architecture: Input → {len(layers)} user layers → Output({num_classes} classes)")
    
    final_loss, final_accuracy = 0.0, 0.0

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        
        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            
        epoch_loss = running_loss / len(train_subset)
        
        model.eval()
        correct = 0
        total = 0
        
        # Collect predictions for confusion matrix (only on last epoch)
        if epoch == epochs:
            all_predictions = []
            all_labels = []
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
                
                # Store predictions and labels for confusion matrix (only on last epoch)
                if epoch == epochs:
                    all_predictions.extend(predicted.cpu().numpy())
                    all_labels.extend(labels.cpu().numpy())
        
        epoch_accuracy = correct / total
        final_loss, final_accuracy = epoch_loss, epoch_accuracy

        # Store confusion matrix data on final epoch
        if epoch == epochs:
            CONFUSION_MATRIX_DATA = {
                'predictions': all_predictions,
                'labels': all_labels,
                'num_classes': num_classes
            }

        # Call optional progress callback for real-time streaming (e.g., SSE or websocket)
        if progress_callback is not None:
            try:
                progress_callback({"epoch": epoch, "loss": final_loss, "accuracy": final_accuracy})
            except Exception:
                # Don't let callback errors break training; just continue
                pass

        # Print to stdout with flush so console shows updates in real time
        epoch_line = f"Epoch {epoch}/{epochs} - Loss: {final_loss:.4f}, Accuracy: {final_accuracy:.4f}"
        print(epoch_line, flush=True)
        output_log.append(epoch_line)

        save_data = {
            'state_dict': model.state_dict(),
            'layers': layers,
            'input_channels': input_channels,
            'input_size': input_size,
            'num_classes': num_classes
        }
        torch.save(save_data, TEMP_MODEL_PATH)
        
    return output_log, final_loss, final_accuracy


# ===== SIMPLE CUSTOM DATASET LOADING =====

class SimpleCustomDataset(torch.utils.data.Dataset):
    """Simple dataset for images and labels."""
    def __init__(self, images, labels, transform=None):
        self.images = images
        self.labels = labels
        self.transform = transform
        
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        image = self.images[idx]
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def load_custom_zip_dataset(custom_dataset_path):
    """Load dataset from ZIP file - handles any folder names."""
    import zipfile
    from PIL import Image
    import io
    
    # Find the first ZIP file in custom_data folder
    zip_files = [f for f in os.listdir(custom_dataset_path) if f.endswith('.zip')]
    if not zip_files:
        raise Exception("No ZIP file found in custom_data folder")
    
    zip_path = os.path.join(custom_dataset_path, zip_files[0])
    print(f"Loading from ZIP: {zip_files[0]}")
    
    train_images = []
    train_labels = []
    test_images = []
    test_labels = []
    
    # Dynamic class mapping - will be built as we encounter folder names
    class_to_label = {}
    next_label = 0
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Get all files in the ZIP
        file_list = zip_ref.namelist()
        print(f"Files in ZIP: {len(file_list)}")
        print(f"First few files: {file_list[:10]}")  # Debug: show first 10 files
        
        # Look for training/ and testing/ folders 
        for file_path in file_list:
            if file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                # Parse the path to get label and split type
                parts = file_path.split('/')
                
                # Debug: print the path structure
                if len(train_images) < 5:  # Only print first few for debugging
                    print(f"Processing: {file_path}, Parts: {parts}")
                
                # Find the class folder name (the folder containing the image)
                class_name = None
                for i, part in enumerate(parts):
                    if i < len(parts) - 1:  # Not the last part (filename)
                        if parts[i+1].lower().endswith(('.png', '.jpg', '.jpeg')):
                            class_name = part
                            break
                
                # If we couldn't find class name, try the folder before the file
                if class_name is None and len(parts) >= 2:
                    class_name = parts[-2]  # Folder containing the image file
                
                if class_name:
                    # Add to class mapping if new class
                    if class_name not in class_to_label:
                        class_to_label[class_name] = next_label
                        next_label += 1
                    
                    label = class_to_label[class_name]
                    
                    # Determine if it's train or test
                    is_train = any(x in file_path.lower() for x in ['training', 'train'])
                    is_test = any(x in file_path.lower() for x in ['testing', 'test'])
                    
                    # If no clear train/test, use folder structure or default to train
                    if not is_train and not is_test:
                        # Check if file is in a train/test folder
                        for part in parts:
                            if 'train' in part.lower():
                                is_train = True
                                break
                            elif 'test' in part.lower():
                                is_test = True
                                break
                        # If still not clear, default to train
                        if not is_train and not is_test:
                            is_train = True
                    
                    try:
                        with zip_ref.open(file_path) as file:
                            image_data = file.read()
                            # Try to detect if image is RGB or grayscale
                            image = Image.open(io.BytesIO(image_data))
                            
                            # Convert to RGB if it's not grayscale
                            if image.mode != 'L':
                                image = image.convert('RGB')
                            
                            if is_train:
                                train_images.append(image)
                                train_labels.append(label)
                            else:  # is_test
                                test_images.append(image)
                                test_labels.append(label)
                    except Exception as e:
                        print(f"Warning: Could not load {file_path}: {e}")
        
        # If we found images but no test images, split train 80/20
        if train_images and not test_images:
            print("No test folder found, splitting train data 80/20")
            split_idx = int(0.8 * len(train_images))
            test_images = train_images[split_idx:]
            test_labels = train_labels[split_idx:]
            train_images = train_images[:split_idx]
            train_labels = train_labels[:split_idx]
    
    if not train_images:
        # Print debug info about what files were found
        image_files = [f for f in file_list if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        print(f"Found {len(image_files)} image files but couldn't load any")
        print(f"Image files: {image_files[:20]}")  # Show first 20 image files
        raise Exception("No training images found in ZIP file")
    
    print(f"Loaded {len(train_images)} training images, {len(test_images)} test images")
    
    # Print class mapping for debugging
    print(f"Class mapping: {class_to_label}")
    
    # Print label distribution for debugging
    if train_labels:
        unique_labels = sorted(set(train_labels + test_labels))
        print(f"Unique labels found: {unique_labels}")
        print(f"Number of classes: {len(class_to_label)}")
        print(f"Train label distribution: {np.bincount(train_labels)}")
        if test_labels:
            print(f"Test label distribution: {np.bincount(test_labels)}")
    
    # Get dataset info for model building
    if train_images:
        sample_image = train_images[0]
        if isinstance(sample_image, Image.Image):
            image_size = sample_image.size[0]  # Assuming square images
            channels = 3 if sample_image.mode == 'RGB' else 1
        else:
            image_size = sample_image.shape[0]
            channels = sample_image.shape[2] if len(sample_image.shape) == 3 else 1
    else:
        image_size = 28
        channels = 1
    
    # Create appropriate transform based on image type
    if channels == 1:
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,))
        ])
    else:
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
    
    train_dataset = SimpleCustomDataset(train_images, train_labels, transform)
    test_dataset = SimpleCustomDataset(test_images, test_labels, transform)
    
    dataset_info = {
        'channels': channels,
        'image_size': image_size,
        'num_classes': len(class_to_label)
    }
    
    return train_dataset, test_dataset, dataset_info


def train_generator(layers, config):
    """Generator that runs train_model in a background thread and yields
    Server-Sent Events (SSE) formatted messages (text/event-stream).

    Yields lines like: 'data: {json}\n\n' for each epoch and a final message
    with done=True when training completes.
    """
    q = queue.Queue()
    sentinel = object()

    def callback(data):
        try:
            q.put(json.dumps(data))
        except Exception:
            pass

    def worker():
        output, final_loss, final_accuracy = train_model(layers, config, progress_callback=callback)
        # send final summary
        try:
            q.put(json.dumps({"done": True, "loss": final_loss, "accuracy": final_accuracy, "output": output}))
        except Exception:
            pass
        q.put(sentinel)

    t = threading.Thread(target=worker, daemon=True)
    t.start()

    while True:
        item = q.get()
        if item is sentinel:
            break
        yield f"data: {item}\n\n"

def load_temp_model():
    """Loads the model state from the temporary file and rebuilds the model."""
    if not os.path.exists(TEMP_MODEL_PATH):
        return None
    
    saved_data = torch.load(TEMP_MODEL_PATH, map_location=DEVICE)
    
    # Use saved parameters if available, otherwise use defaults
    input_channels = saved_data.get('input_channels', 1)
    input_size = saved_data.get('input_size', 28)
    num_classes = saved_data.get('num_classes', 10)
    
    model = build_dynamic_cnn(saved_data['layers'], input_channels, input_size, num_classes).to(DEVICE)
    model.load_state_dict(saved_data['state_dict'])
    model.eval()
    return model

# Global variable to cache the test dataset
_TEST_DATASET_CACHE = None

def test_model(model):
    global _TEST_DATASET_CACHE
    
    # Get the model parameters
    saved_data = torch.load(TEMP_MODEL_PATH, map_location=DEVICE)
    input_size = saved_data.get('input_size', 28)
    input_channels = saved_data.get('input_channels', 1)
    
    # Use cached dataset if available
    if _TEST_DATASET_CACHE is None:
        # Create appropriate transform based on input channels
        if input_channels == 1:
            transform = transforms.Compose([
                transforms.Grayscale(num_output_channels=1),
                transforms.Resize((input_size, input_size)),
                transforms.ToTensor(),
                transforms.Normalize((0.1307,), (0.3081,))
            ])
        else:
            transform = transforms.Compose([
                transforms.Resize((input_size, input_size)),
                transforms.ToTensor(),
                transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
            ])
        
        # Use ImageFolder for simple folder structure
        custom_dataset_path = './custom_data'
        test_path = os.path.join(custom_dataset_path, 'test')
        
        if os.path.exists(test_path):
            test_dataset = datasets.ImageFolder(root=test_path, transform=transform)
            class_names = test_dataset.classes  # This gives us the actual folder names
            print(f"Testing with custom dataset. Classes: {class_names}")
        else:
            # Fallback to default datasets
            if input_channels == 1:
                test_dataset = datasets.MNIST('./data', train=False, transform=transform)
                class_names = [str(i) for i in range(10)]
                print("Testing with MNIST dataset")
            else:
                test_dataset = datasets.CIFAR10('./data', train=False, transform=transform, download=True)
                class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer', 
                              'dog', 'frog', 'horse', 'ship', 'truck']  # CIFAR-10 actual classes
                print("Testing with CIFAR10 dataset")
        
        _TEST_DATASET_CACHE = (test_dataset, class_names)
    else:
        test_dataset, class_names = _TEST_DATASET_CACHE
        print("Using cached test dataset")
    
    test_loader = DataLoader(test_dataset, batch_size=100, shuffle=True)
    
    model.eval()
    
    def view_classification(image, probabilities, actual_class, predicted_class):
        if matplotlib.pyplot.get_fignums():
            matplotlib.pyplot.close('all')

        probabilities = probabilities.cpu().data.numpy().squeeze()
        fig, (ax1, ax2) = plt.subplots(figsize=(8, 6), ncols=2)
        
        # Denormalize based on input channels
        if input_channels == 1:
            mean = 0.1307
            std = 0.3081
            image_denorm = image.cpu() * std + mean
            ax1.imshow(image_denorm.squeeze(), cmap='gray')
        else:
            mean = 0.5
            std = 0.5
            image_denorm = image.cpu() * std + mean
            image_display = image_denorm.permute(1, 2, 0)
            ax1.imshow(image_display)
        
        ax1.axis('off')
        ax1.set_title(f'Actual: {actual_class}\nPredicted: {predicted_class}', fontsize=12)
        
        ax2.barh(np.arange(len(class_names)), probabilities)
        ax2.set_aspect(0.1)
        ax2.set_yticks(np.arange(len(class_names)))
        ax2.set_yticklabels(class_names)
        ax2.set_title('Class Probability')
        ax2.set_xlim(0, 1.1)
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf.getvalue()

    # Get a batch and find correct channels
    for images, labels in test_loader:
        if images.shape[1] == input_channels:
            break
    else:
        images, labels = next(iter(test_loader))
        if input_channels == 1 and images.shape[1] == 3:
            images = torch.mean(images, dim=1, keepdim=True)
        elif input_channels == 3 and images.shape[1] == 1:
            images = images.repeat(1, 3, 1, 1)

    # ONLY resize if image size doesn't match model input size
    if images.shape[2] != input_size or images.shape[3] != input_size:
        resize_transform = transforms.Resize((input_size, input_size))
        images_resized = torch.stack([resize_transform(img) for img in images])
        images = images_resized

    image_number = random.randint(0, len(images) - 1)

    image = images[image_number]
    actual_label_idx = labels[image_number].item()
    batched_image = image.unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(batched_image)
    
    probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze()
    predicted_label_idx = torch.argmax(probabilities).item()

    # FIX: Use the actual class names from the dataset
    actual_class = class_names[actual_label_idx]
    predicted_class = class_names[predicted_label_idx]

    print(f"Actual: {actual_class} ({actual_label_idx}), Predicted: {predicted_class} ({predicted_label_idx})")

    # Make sure probabilities has correct number of elements
    if probabilities.dim() == 0:
        probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze(0)
        
    # Return the image bytes
    return view_classification(image, probabilities, actual_class, predicted_class)

def test_model_custom_image(model, image):
    # Get the model parameters
    saved_data = torch.load(TEMP_MODEL_PATH, map_location=DEVICE)
    input_size = saved_data.get('input_size', 28)
    input_channels = saved_data.get('input_channels', 1)
    
    # FIX: Get class names from the same source as test_model
    global _TEST_DATASET_CACHE
    
    if _TEST_DATASET_CACHE is not None:
        # Use cached class names from test_model
        _, class_names = _TEST_DATASET_CACHE
    else:
        # Get class names the same way test_model does
        custom_dataset_path = './custom_data'
        test_path = os.path.join(custom_dataset_path, 'test')
        
        if os.path.exists(test_path):
            test_dataset = datasets.ImageFolder(root=test_path)
            class_names = test_dataset.classes
            print(f"Using custom dataset classes: {class_names}")
        else:
            # Use the same fallback as test_model
            if input_channels == 1:
                class_names = [str(i) for i in range(10)]
                print("Using MNIST class names (0-9)")
            else:
                class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer', 
                              'dog', 'frog', 'horse', 'ship', 'truck']
                print("Using CIFAR-10 class names")
    
    # Convert image if needed
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image)
    
    # Handle color/grayscale based on model
    if input_channels == 1:
        if image.mode != 'L':
            image = image.convert('L')
        transform = transforms.Compose([
            transforms.Resize((input_size, input_size)),
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,))
        ])
    else:
        if image.mode != 'RGB':
            image = image.convert('RGB')
        transform = transforms.Compose([
            transforms.Resize((input_size, input_size)),
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
    
    # Transform the image
    image_tensor = transform(image)

    # ONLY resize if needed
    if image_tensor.shape[1] != input_size or image_tensor.shape[2] != input_size:
        resize_transform = transforms.Resize((input_size, input_size))
        image_tensor = resize_transform(image_tensor)
    
    # Ensure the image tensor has the correct number of channels
    if input_channels == 1 and image_tensor.shape[0] == 3:
        image_tensor = torch.mean(image_tensor, dim=0, keepdim=True)
    elif input_channels == 3 and image_tensor.shape[0] == 1:
        image_tensor = image_tensor.repeat(3, 1, 1)
    
    model.eval()
    
    def view_classification(image, probabilities, predicted_class):
        if matplotlib.pyplot.get_fignums():
            matplotlib.pyplot.close('all')

        probabilities = probabilities.cpu().data.numpy().squeeze()
        fig, (ax1, ax2) = plt.subplots(figsize=(8, 6), ncols=2)
        
        # Denormalize based on input channels
        if input_channels == 1:
            mean = 0.1307
            std = 0.3081
            image_denorm = image.cpu() * std + mean
            ax1.imshow(image_denorm.squeeze(), cmap='gray')
        else:
            mean = 0.5
            std = 0.5
            image_denorm = image.cpu() * std + mean
            image_display = image_denorm.permute(1, 2, 0)
            ax1.imshow(image_display)
        
        ax1.axis('off')
        ax1.set_title(f'Predicted: {predicted_class}', fontsize=12)
        
        ax2.barh(np.arange(len(class_names)), probabilities)
        ax2.set_aspect(0.1)
        ax2.set_yticks(np.arange(len(class_names)))
        ax2.set_yticklabels(class_names)
        ax2.set_title('Class Probability')
        ax2.set_xlim(0, 1.1)
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf.getvalue()

    # Prepare image for model
    batched_image = image_tensor.unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(batched_image)
    
    probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze()
    predicted_label_idx = torch.argmax(probabilities).item()
    
    # Use the correct class names
    predicted_class = class_names[predicted_label_idx]

    print(f"Predicted: {predicted_class} ({predicted_label_idx})")
    print(f"Available classes: {class_names}")

    # Make sure probabilities has correct number of elements
    if probabilities.dim() == 0:
        probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze(0)
        
    # Return the image bytes
    return view_classification(image_tensor, probabilities, predicted_class)


# ---------------

def download_model():
    """Returns the bytes of the saved model file for download."""
    if not os.path.exists(TEMP_MODEL_PATH):
        return None
    
    with open(TEMP_MODEL_PATH, 'rb') as f:
        model_bytes = f.read()
    
    return model_bytes