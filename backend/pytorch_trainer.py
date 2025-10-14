# pytorch_trainer.py
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# gpu availability check
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def build_dynamic_cnn(layers):
    model_layers = []
    
    input_channels = 1
    
    # keep track of the feature map size after Convolutional layers (starts at 28)
    current_size = 28
    
    # create layers based on provided config
    for layer in layers:
        layer_type = layer.get('type')
        
        if layer_type == 'Convolutional':
            out_channels = layer.get('outputChannels', 32)
            kernel_size = layer.get('kernelSize', 3)
            activation_name = layer.get('activation', 'ReLU')

            # add conv layer
            model_layers.append(nn.Conv2d(input_channels, out_channels, kernel_size, padding=1))
            input_channels = out_channels
            
            # add Activation
            if activation_name == 'ReLU':
                model_layers.append(nn.ReLU())
            elif activation_name == 'Sigmoid':
                model_layers.append(nn.Sigmoid())
            elif activation_name == 'Tanh':
                model_layers.append(nn.Tanh())
                
            # add Max Pooling to reduce size by half
            model_layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
            current_size //= 2
            
        elif layer_type in ('Fully Connected', 'Output'):
            # Stop processing Conv/Pool and prepare for the Flatten layer
            break

    flatten_size = input_channels * current_size * current_size
    model_layers.append(nn.Flatten())

    input_units = flatten_size
    is_after_flatten = False
    
    for layer in layers:
        layer_type = layer.get('type')
        
        if layer_type in ('Fully Connected', 'Output'):
            is_after_flatten = True
            
            output_units = layer.get('units', 128)
            activation_name = layer.get('activation', 'ReLU')

            model_layers.append(nn.Linear(input_units, output_units))
            input_units = output_units

            if layer_type == 'Fully Connected':
                if activation_name == 'ReLU':
                    model_layers.append(nn.ReLU())
                elif activation_name == 'Sigmoid':
                    model_layers.append(nn.Sigmoid())
                elif activation_name == 'Tanh':
                    model_layers.append(nn.Tanh())

    return nn.Sequential(*model_layers)

def train_model(layers, config):
    """Loads data, builds model, and runs a basic PyTorch training loop."""
    
    # --- Data Loading ---
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    
    # TODO add a database picker
    train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
    # WARNING uses a lot less images so it trains faster for demos
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
        return [f"ERROR: Could not build model. Likely a size mismatch. Details: {e}"], 0.0, 0.0
    
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
        
        # --- Validation (Test) Phase ---
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
        
        output_log.append(f"Epoch {epoch}/{epochs} - Loss: {final_loss:.4f}, Accuracy: {final_accuracy:.4f}")
        
    return output_log, final_loss, final_accuracy