from PIL import Image
import torchvision.transforms as transforms
from io import BytesIO

def preprocess_image(image_input):
    """
    Loads and preprocesses an image for model prediction.
    Args:
        image_input (str or bytes): Path to the image file or image bytes.
    Returns:
        torch.Tensor: Preprocessed image tensor with shape [1, 3, 224, 224].
    """
    if isinstance(image_input, str):
        img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        img = Image.open(BytesIO(image_input)).convert("RGB")
    else:
        raise ValueError("image_input must be a file path or bytes.")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    img_tensor = transform(img).unsqueeze(0)
    return img_tensor