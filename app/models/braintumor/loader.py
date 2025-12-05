def load_model(model_path="app/models/braintumor/brain_tumor_model.pth"):

    import torch
    import torch.nn as nn
    import torchvision.models as models

    # Load a pre-trained ResNet18 model
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Modify the final fully connected layer for binary classification with Dropout
    num_ftrs = model.fc.in_features
    # Replace the final fc layer with a Sequential model that includes Dropout and Linear layer
    model.fc = nn.Sequential(
        nn.Dropout(0.5), # Add dropout layer with dropout probability of 0.5
        nn.Linear(num_ftrs, 2) # 2 output classes (positive/negative)
    )


    # Load the saved state dictionary
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    # Set the model to evaluation mode
    model.eval()
    return model

