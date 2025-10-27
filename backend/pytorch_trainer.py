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

TEMP_MODEL_PATH = './temp_model_state.pth'
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def build_dynamic_cnn(layers):
    model_layers = []
    
    # ALWAYS start with input layer for MNIST (1 channel, 28x28)
    input_channels = 1
    current_size = 28
    
    # Process user-defined middle layers
    for layer in layers:
        layer_type = layer.get('type')
        
        if layer_type == 'Convolutional':
            out_channels = layer.get('outputChannels', 32)
            kernel_size = layer.get('kernelSize', 3)
            activation_name = layer.get('activation', 'ReLU')

            # Add conv layer
            model_layers.append(nn.Conv2d(input_channels, out_channels, kernel_size, padding=1))
            input_channels = out_channels
            
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
    flatten_size = input_channels * current_size * current_size
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

    # ALWAYS end with output layer for MNIST (10 classes)
    model_layers.append(nn.Linear(input_units, 10))  # 10 classes for MNIST
    model_layers.append(nn.Softmax(dim=1))

    return nn.Sequential(*model_layers)

def train_model(layers, config):
    """Loads data, builds model, and runs a basic PyTorch training loop."""
    
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    
    train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
    subset_indices = torch.randperm(len(train_dataset))[:5000] 
    train_subset = torch.utils.data.Subset(train_dataset, subset_indices)
    
    test_dataset = datasets.MNIST('./data', train=False, transform=transform)
    
    batch_size = config.get('batchSize', 64)
    epochs = config.get('epochs', 3)
    
    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=1000, shuffle=False)
    
    try:
        model = build_dynamic_cnn(layers).to(DEVICE)
    except Exception as e:
        return [f"ERROR: Could not build model. Details: {e}"], 0.0, 0.0
    
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
    output_log.append(f"Architecture: Input → {len(layers)} user layers → Output(10 classes)")
    
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
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        epoch_accuracy = correct / total
        final_loss, final_accuracy = epoch_loss, epoch_accuracy

        # Send data to frontend via SSE for the real time updating graph
        """
        data = {
            "epoch": epoch,
            "loss": final_loss,
            "accuracy": final_accuracy
        }
        """

        # yield f"data: {json.dumps(data)}\n\n"

        output_log.append(f"Epoch {epoch}/{epochs} - Loss: {final_loss:.4f}, Accuracy: {final_accuracy:.4f}")

        save_data = {
            'state_dict': model.state_dict(),
            'layers': layers
        }
        torch.save(save_data, TEMP_MODEL_PATH)
        
    return output_log, final_loss, final_accuracy

def load_temp_model():
    """Loads the model state from the temporary file and rebuilds the model."""
    if not os.path.exists(TEMP_MODEL_PATH):
        return None
    
    saved_data = torch.load(TEMP_MODEL_PATH, map_location=DEVICE)
    model = build_dynamic_cnn(saved_data['layers']).to(DEVICE)
    model.load_state_dict(saved_data['state_dict'])
    model.eval()
    return model

def test_model(model):
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    
    test_dataset = datasets.MNIST('./data', train=False, transform=transform)
    test_loader = DataLoader(test_dataset, batch_size=100, shuffle=True)
    
    model.eval()
    
    classes = [str(i) for i in range(10)]
    
    def view_classification(image, probabilities):
        if matplotlib.pyplot.get_fignums():
            matplotlib.pyplot.close('all')

        probabilities = probabilities.data.numpy().squeeze()
        fig, (ax1, ax2) = plt.subplots(figsize=(6, 9), ncols=2)
        
        mean = 0.1307
        std = 0.3081
        image_denorm = image * std + mean
        
        ax1.imshow(image_denorm.cpu().squeeze(), cmap='gray')
        ax1.axis('off')
        
        ax2.barh(np.arange(10), probabilities)
        ax2.set_aspect(0.1)
        ax2.set_yticks(np.arange(10))
        ax2.set_yticklabels(classes)
        ax2.set_title('Class Probability')
        ax2.set_xlim(0, 1.1)
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf.getvalue()

    images, labels = next(iter(test_loader))
    image_number = random.randint(0, 99)

    image = images[image_number]
    actual_label = labels[image_number].item()
    batched_image = image.unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(batched_image)
    
    probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze().cpu()
    
    probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze().cpu()

# Debug: Check the shape
    print(f"Output shape: {outputs.shape}, Probabilities shape: {probabilities.shape}")

    # Make sure probabilities has 10 elements (one per class)
    if probabilities.dim() == 0:
        probabilities = torch.nn.functional.softmax(outputs, dim=1).squeeze(0).cpu()
        
    # Return the image bytes
    return view_classification(image, probabilities)
