import torch



def predict(model, image_tensor, device=None):
    """
    Predicts the class of a single image tensor using the provided model and returns the confidence score.
    Args:
        model: PyTorch model
        image_tensor: preprocessed image tensor (shape: [1, C, H, W])
        device: torch.device (optional)
    Returns:
        tuple: (predicted class (0 or 1), confidence score)
    """
    if device:
        model = model.to(device)
        image_tensor = image_tensor.to(device)
    model.eval()
    with torch.inference_mode():
        output = model(image_tensor)
        # Get probabilities using softmax
        probabilities = torch.softmax(output, dim=1)
        # Get the confidence score and predicted class
        confidence_score, predicted_class = torch.max(probabilities, dim=1)

    return predicted_class.item(), confidence_score.item()

