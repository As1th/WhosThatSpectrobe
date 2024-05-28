import os
from PIL import Image

MAX_WIDTH = 475
MAX_HEIGHT = 415

def resize_and_pad_image(image_path):
    with Image.open(image_path) as img:
        width, height = img.size

        # Resize if the image is larger than the max dimensions
        if width > MAX_WIDTH or height > MAX_HEIGHT:
            img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.BICUBIC)
            width, height = img.size

        # Create a new image with a transparent background
        new_img = Image.new("RGBA", (MAX_WIDTH, MAX_HEIGHT), (0, 0, 0, 0))

        # Paste the resized image onto the center of the new image
        new_img.paste(img, ((MAX_WIDTH - width) // 2, (MAX_HEIGHT - height) // 2))
        
        # Save the new image, overwriting the original
        new_img.save(image_path)

def process_images_in_folder(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            image_path = os.path.join(folder_path, filename)
            resize_and_pad_image(image_path)

def main(folder_path):
    process_images_in_folder(folder_path)
    print("Images have been processed.")

if __name__ == "__main__":
    folder_path = os.getcwd()
    main(folder_path)
