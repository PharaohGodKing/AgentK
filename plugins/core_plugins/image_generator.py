"""
Image generator plugin for AgentK - Generates images from text descriptions
"""

import base64
import io
from typing import Dict, Any
from plugins.base_plugin import BasePlugin
import logging

logger = logging.getLogger(__name__)

class ImageGenerator(BasePlugin):
    """
    Image generator plugin that creates images from text descriptions
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.name = "Image Generator"
        self.version = "1.0.0"
        self.description = "Generates images from text descriptions using various AI models"
        self.capabilities = ["image_generation", "image_processing", "creative_content"]
        
        # Default configuration
        self.default_model = self.get_config_value("default_model", "dalle")
        self.default_size = self.get_config_value("default_size", "512x512")
        self.default_quality = self.get_config_value("default_quality", "standard")
        
        # Available models and their configurations
        self.models = {
            "dalle": {
                "name": "DALL-E",
                "description": "OpenAI's image generation model",
                "max_length": 1000,
                "supported_sizes": ["256x256", "512x512", "1024x1024"]
            },
            "stable_diffusion": {
                "name": "Stable Diffusion",
                "description": "Open source image generation model",
                "max_length": 2000,
                "supported_sizes": ["512x512", "768x768", "1024x1024"]
            }
        }
    
    async def initialize(self) -> None:
        """Initialize the image generator plugin"""
        await super().initialize()
        
        # Check if required dependencies are available
        try:
            # Try to import PIL to check if it's available
            import PIL
            self.pil_available = True
        except ImportError:
            self.pil_available = False
            logger.warning("PIL/Pillow not available. Image processing capabilities will be limited.")
        
        logger.info("Image Generator plugin initialized")
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an image from a text description
        
        Args:
            parameters: Should contain 'prompt' for the image description
            
        Returns:
            Dictionary with image generation results
        """
        if not self.validate_parameters(parameters, ["prompt"]):
            return {
                "success": False,
                "error": "Missing required parameter: prompt"
            }
        
        prompt = parameters["prompt"]
        model = parameters.get("model", self.default_model)
        size = parameters.get("size", self.default_size)
        quality = parameters.get("quality", self.default_quality)
        
        # Validate parameters
        if model not in self.models:
            return {
                "success": False,
                "error": f"Unknown model: {model}. Available models: {list(self.models.keys())}"
            }
        
        if size not in self.models[model]["supported_sizes"]:
            return {
                "success": False,
                "error": f"Unsupported size: {size}. Supported sizes: {self.models[model]['supported_sizes']}"
            }
        
        if len(prompt) > self.models[model]["max_length"]:
            return {
                "success": False,
                "error": f"Prompt too long. Max length: {self.models[model]['max_length']} characters"
            }
        
        try:
            logger.info(f"Generating image with model {model}: {prompt[:50]}...")
            
            # For demonstration purposes, we'll generate a placeholder image
            # In a real implementation, you would call actual image generation APIs
            
            image_data = self._generate_placeholder_image(prompt, size)
            
            # Convert to base64 for easy transmission
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            return {
                "success": True,
                "prompt": prompt,
                "model": model,
                "size": size,
                "quality": quality,
                "image_format": "png",
                "image_data": image_base64,
                "image_size": len(image_data),
                "message": "Image generated successfully (placeholder for demonstration)"
            }
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            return {
                "success": False,
                "error": f"Image generation failed: {str(e)}",
                "prompt": prompt,
                "model": model
            }
    
    def _generate_placeholder_image(self, prompt: str, size: str) -> bytes:
        """
        Generate a placeholder image for demonstration purposes
        In a real implementation, this would call an actual image generation API
        """
        try:
            # Try to use PIL if available
            if self.pil_available:
                from PIL import Image, ImageDraw, ImageFont
                import textwrap
                
                # Parse size
                width, height = map(int, size.split('x'))
                
                # Create image
                img = Image.new('RGB', (width, height), color='white')
                draw = ImageDraw.Draw(img)
                
                # Try to load a font
                try:
                    font = ImageFont.truetype("arial.ttf", 20)
                except:
                    font = ImageFont.load_default()
                
                # Wrap text
                wrapped_text = textwrap.fill(f"Placeholder for: {prompt}", width=30)
                
                # Calculate text position
                bbox = draw.textbbox((0, 0), wrapped_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                x = (width - text_width) // 2
                y = (height - text_height) // 2
                
                # Draw text
                draw.text((x, y), wrapped_text, font=font, fill='black')
                
                # Draw border
                draw.rectangle([0, 0, width-1, height-1], outline='gray', width=2)
                
                # Save to bytes
                img_bytes = io.BytesIO()
                img.save(img_bytes, format='PNG')
                return img_bytes.getvalue()
                
        except Exception as e:
            logger.warning(f"Failed to create placeholder with PIL: {e}")
        
        # Fallback: return a simple SVG placeholder
        width, height = size.split('x')
        svg_content = f'''
        <svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" 
                  font-size="14" fill="#666">Placeholder: {prompt[:30]}...</text>
            <rect width="100%" height="100%" fill="none" stroke="#ccc" stroke-width="2"/>
        </svg>
        '''
        return svg_content.encode('utf-8')
    
    async def process_image(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process an existing image (resize, filter, etc.)
        """
        if not self.validate_parameters(parameters, ["image_data", "operation"]):
            return {
                "success": False,
                "error": "Missing required parameters: image_data and operation"
            }
        
        if not self.pil_available:
            return {
                "success": False,
                "error": "Image processing requires PIL/Pillow library"
            }
        
        try:
            from PIL import Image, ImageFilter, ImageEnhance
            import io
            
            # Decode base64 image data
            image_data = base64.b64decode(parameters["image_data"])
            image = Image.open(io.BytesIO(image_data))
            
            operation = parameters["operation"]
            
            if operation == "resize":
                width = parameters.get("width", image.width)
                height = parameters.get("height", image.height)
                resized_image = image.resize((width, height), Image.Resampling.LANCZOS)
                result_image = resized_image
                
            elif operation == "crop":
                left = parameters.get("left", 0)
                top = parameters.get("top", 0)
                right = parameters.get("right", image.width)
                bottom = parameters.get("bottom", image.height)
                cropped_image = image.crop((left, top, right, bottom))
                result_image = cropped_image
                
            elif operation == "filter":
                filter_type = parameters.get("filter_type", "blur")
                if filter_type == "blur":
                    filtered_image = image.filter(ImageFilter.BLUR)
                elif filter_type == "sharpen":
                    filtered_image = image.filter(ImageFilter.SHARPEN)
                elif filter_type == "contour":
                    filtered_image = image.filter(ImageFilter.CONTOUR)
                else:
                    return {
                        "success": False,
                        "error": f"Unknown filter type: {filter_type}"
                    }
                result_image = filtered_image
                
            elif operation == "enhance":
                enhance_type = parameters.get("enhance_type", "brightness")
                factor = parameters.get("factor", 1.0)
                
                if enhance_type == "brightness":
                    enhancer = ImageEnhance.Brightness(image)
                elif enhance_type == "contrast":
                    enhancer = ImageEnhance.Contrast(image)
                elif enhance_type == "sharpness":
                    enhancer = ImageEnhance.Sharpness(image)
                elif enhance_type == "color":
                    enhancer = ImageEnhance.Color(image)
                else:
                    return {
                        "success": False,
                        "error": f"Unknown enhance type: {enhance_type}"
                    }
                
                result_image = enhancer.enhance(factor)
                
            else:
                return {
                    "success": False,
                    "error": f"Unknown operation: {operation}"
                }
            
            # Convert back to bytes
            output_format = parameters.get("format", "PNG")
            img_bytes = io.BytesIO()
            result_image.save(img_bytes, format=output_format)
            processed_data = img_bytes.getvalue()
            
            # Encode as base64
            processed_base64 = base64.b64encode(processed_data).decode('utf-8')
            
            return {
                "success": True,
                "operation": operation,
                "image_format": output_format.lower(),
                "image_data": processed_base64,
                "image_size": len(processed_data),
                "original_size": (image.width, image.height),
                "processed_size": (result_image.width, result_image.height)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Image processing failed: {str(e)}",
                "operation": parameters.get("operation")
            }
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        await super().cleanup()
        logger.info("Image Generator plugin cleaned up")