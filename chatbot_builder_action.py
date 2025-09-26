"""
title: Chatbot Flow Builder
author: SahithPoreddy
author_url: https://github.com/SahithPoreddy
funding_url: https://github.com/SahithPoreddy/Chatbot-builder
version: 1.0.0
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
import uuid
import logging
import time
from open_webui.models.files import Files

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class FileData(BaseModel):
    id: str
    filename: str
    meta: Dict[str, Any]

class Action:
    class Valves(BaseModel):
        show_status: bool = Field(
            default=True, description="Show status of the action."
        )
        html_filename: str = Field(
            default="chatbot_builder.html",
            description="Name of the HTML file to be created.",
        )
        button_label: str = Field(
            default="🎨 Open Flow Builder",
            description="Label for the chatbot builder button."
        )

    def __init__(self):
        self.valves = self.Valves()

    def create_or_get_file(self, user_id: str, html_content: str) -> str:
        """Create or update the chatbot builder HTML file"""

        filename = str(int(time.time() * 1000)) + "_" + self.valves.html_filename
        directory = "chatbot_builder"

        logger.debug(f"Attempting to create or get file: {filename}")

        # Check if the file already exists
        existing_files = Files.get_files()
        for file in existing_files:
            if (
                file.filename == f"{directory}/{user_id}/{filename}"
                and file.user_id == user_id
            ):
                logger.debug(f"Existing file found. Updating content.")
                # Update the existing file with new HTML content
                self.update_html_content(file.meta["path"], html_content)
                return file.id

        # If the file doesn't exist, create it
        base_path = os.path.join("uploads", directory)
        os.makedirs(base_path, exist_ok=True)
        file_path = os.path.join(base_path, filename)

        logger.debug(f"Creating new file at: {file_path}")
        self.update_html_content(file_path, html_content)

        file_id = str(uuid.uuid4())
        meta = {
            "source": file_path,
            "title": "Chatbot Flow Builder",
            "content_type": "text/html",
            "size": os.path.getsize(file_path),
            "path": file_path,
        }

        # Create a new file entry
        file_data = FileData(
            id=file_id, filename=f"{directory}/{user_id}/{filename}", meta=meta
        )
        new_file = Files.insert_new_file(user_id, file_data)
        logger.debug(f"New file created with ID: {new_file.id}")
        return new_file.id

    def update_html_content(self, file_path: str, html_content: str):
        """Update HTML file content"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.debug(f"HTML content updated at: {file_path}")

    def get_chatbot_builder_html(self) -> str:
        """Generate the complete chatbot builder HTML that loads from CDN"""

        # CDN URLs for the built assets
        css_url = "https://sahithporeddy.github.io/Chatbot-builder/dist/assets/index-DJQuoQVC.css"
        js_url = "https://sahithporeddy.github.io/Chatbot-builder/dist/assets/index-DevyOnKg.js"

        # Main HTML content that loads from CDN
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Flow Builder</title>

    <!-- Load CSS from CDN -->
    <link rel="stylesheet" href="{css_url}">

    <style>
        /* Ensure the React app takes full viewport */
        html, body {{
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }}

        #root {{
            width: 100%;
            height: 100vh;
        }}
    </style>
</head>
<body>
    <!-- Main React app container -->
    <div id="root"></div>

    <!-- Load JavaScript from CDN -->
    <script src="{js_url}"></script>

    <script>
        // Initialize after CDN assets are loaded
        document.addEventListener('DOMContentLoaded', function() {{
            console.log('🎨 Chatbot Flow Builder loaded from CDN successfully!');
        }});
    </script>
</body>
</html>
        """

        return html_content

    async def action(
        self,
        body: dict,
        __user__=None,
        __event_emitter__=None,
        __event_call__=None,
    ) -> Optional[dict]:
        """Main action method that creates and embeds the chatbot builder"""

        logger.debug(f"action:{__name__} started")

        if __event_emitter__:
            await __event_emitter__({
                "type": "status",
                "data": {
                    "description": "Loading Chatbot Flow Builder...",
                    "done": False,
                },
            })

        try:
            original_content = body["messages"][-1]["content"]

            # Generate the complete HTML with embedded CSS and JS
            html_content = self.get_chatbot_builder_html()

            # Create the HTML file
            user_id = __user__["id"]
            file_id = self.create_or_get_file(user_id, html_content)

            # Create the HTML embed tag
            html_embed_tag = f"{{{{HTML_FILE_ID_{file_id}}}}}"

            # Append the HTML embed tag to the original content
            body["messages"][-1]["content"] = f"{original_content}\\n\\n{html_embed_tag}"

            if __event_emitter__:
                await __event_emitter__({
                    "type": "status",
                    "data": {
                        "description": "✅ Chatbot Flow Builder loaded successfully!",
                        "done": True,
                    },
                })

            logger.debug("Chatbot Flow Builder loaded successfully")

        except Exception as e:
            error_message = f"Error loading Chatbot Flow Builder: {str(e)}"
            logger.error(f"Error: {error_message}")
            body["messages"][-1]["content"] += f"\\n\\nError: {error_message}"

            if self.valves.show_status and __event_emitter__:
                await __event_emitter__({
                    "type": "status",
                    "data": {
                        "description": "Error loading Chatbot Flow Builder",
                        "done": True,
                    },
                })

        logger.debug(f"action:{__name__} completed")
        return body
