import os
from PIL import Image

def get_image_dimensions(folder_path):
    max_width = 0
    max_height = 0
    
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            image_path = os.path.join(folder_path, filename)
            with Image.open(image_path) as img:
                width, height = img.size
                if width > max_width:
                    max_width = width
                if height > max_height:
                    max_height = height
                    
    return max_width, max_height

def pad_images_to_max_size(folder_path, max_width, max_height):
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            image_path = os.path.join(folder_path, filename)
            with Image.open(image_path) as img:
                width, height = img.size
                new_img = Image.new("RGBA", (max_width, max_height), (0, 0, 0, 0))
                new_img.paste(img, ((max_width - width) // 2, (max_height - height) // 2))
                new_img.save(image_path)

def main(folder_path):
    max_width, max_height = get_image_dimensions(folder_path)
    print(f"Max Width: {max_width}, Max Height: {max_height}")
    pad_images_to_max_size(folder_path, max_width, max_height)
    print("Images have been resized and padded.")

if __name__ == "__main__":
    folder_path = "front"  # Replace with the path to your folder
    main(folder_path)
