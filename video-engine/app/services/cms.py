import requests
import os
import json
import mimetypes
import logging

logger = logging.getLogger(__name__)

class CmsService:
    def __init__(self, api_url=None, email=None, password=None):
        # Default to localhost for now, can be configured
        self.api_url = api_url or "http://localhost:9006/api"
        self.email = email
        self.password = password
        self.token = None
        self.user = None

    def login(self):
        if not self.email or not self.password:
            raise ValueError("CMS Credentials (email/password) not provided in Settings")

        try:
            resp = requests.post(
                f"{self.api_url}/users/login",
                json={"email": self.email, "password": self.password},
                headers={"Content-Type": "application/json"}
            )
            
            if resp.status_code == 401:
                raise ValueError("Invalid email or password.")
                
            if resp.status_code == 404:
                raise ValueError(f"Endpoint not found (404): {self.api_url}/users/login. Check your CMS API URL.")

            resp.raise_for_status()
            
            try:
                data = resp.json()
            except json.JSONDecodeError:
                snippet = resp.text[:200]
                raise ValueError(f"Invalid JSON response from CMS ({resp.status_code}). Response snippet: {snippet}")

            self.token = data.get("token")
            self.user = data.get("user")
            return self.user
        except Exception as e:
            logger.error(f"CMS Login failed: {e}")
            raise Exception(f"CMS Login failed: {str(e)}")

    def get_coach_profile(self):
        if not self.token:
            self.login()
        
        user_id = self.user.get("id")
        try:
            # Query coach-profiles where user equals current user
            resp = requests.get(
                f"{self.api_url}/coach-profiles",
                params={"where[user][equals]": user_id, "depth": 0},
                headers={"Authorization": f"JWT {self.token}"}
            )
            resp.raise_for_status()
            data = resp.json()
            docs = data.get("docs", [])
            if not docs:
                raise ValueError(f"No Coach Profile found for user: {self.email}. Please create a Coach Profile in the CMS first.")
            return docs[0]
        except Exception as e:
            logger.error(f"Failed to fetch Coach Profile: {e}")
            raise
            
    def get_all_coaches(self):
        if not self.token:
            self.login()
        
        try:
            resp = requests.get(
                f"{self.api_url}/coach-profiles",
                params={"limit": 100, "depth": 0},
                headers={"Authorization": f"JWT {self.token}"}
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("docs", [])
        except Exception as e:
            logger.error(f"Failed to fetch coaches: {e}")
            raise

    def create_post(self, title, content_text, excerpt, slug=None, coach_id=None, featured_image_id=None):
        if not self.token:
            self.login()
            
        if not coach_id:
             # Fallback to current user's coach profile
             coach = self.get_coach_profile()
             coach_id = coach.get("id")

        # Convert Markdown content to Lexical JSON format for Payload CMS
        from app.services.markdown_to_lexical import markdown_to_lexical
        lexical_content = markdown_to_lexical(content_text or "")

        payload = {
            "title": title,
            "author": coach_id,
            "content": lexical_content,
            "excerpt": excerpt,
            "isPublished": False, # Draft
            "isSubscriberOnly": False
        }
        
        if slug:
            payload["slug"] = slug
            
        if featured_image_id:
            payload["featuredImage"] = featured_image_id

        try:
            resp = requests.post(
                f"{self.api_url}/posts",
                json=payload,
                headers={"Authorization": f"JWT {self.token}"}
            )
            
            try:
                resp.raise_for_status()
            except requests.exceptions.HTTPError:
                raise Exception(f"CMS Error: {resp.text}")
                
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to create post: {e}")
            raise

    def upload_media(self, file_path, alt_text="Featured Image"):
        if not self.token:
            self.login()
            
        try:
            mime_type, _ = mimetypes.guess_type(file_path)
            mime_type = mime_type or 'image/png'
            logger.info(f"Uploading media: {file_path} (mime: {mime_type}, alt: {alt_text})")
            
            with open(file_path, 'rb') as f:
                # Payload 3.0 (Next.js) requires metadata in a '_payload' field as a JSON string
                # when performing multipart/form-data uploads.
                files = {
                    'file': (os.path.basename(file_path), f, mime_type)
                }
                data = {
                    '_payload': json.dumps({
                        'alt': str(alt_text),
                        'category': 'images'
                    })
                }
                
                resp = requests.post(
                    f"{self.api_url}/media",
                    files=files,
                    data=data,
                    headers={"Authorization": f"JWT {self.token}"}
                )
                
                if resp.status_code >= 400:
                    try:
                        error_json = resp.json()
                        error_msg = json.dumps(error_json, indent=2)
                        logger.error(f"CMS Media Upload Error Detail: {error_msg}")
                        raise Exception(f"CMS Upload Failed ({resp.status_code}): {error_msg}")
                    except:
                        logger.error(f"CMS Media Upload Error Body: {resp.text}")
                        raise Exception(f"CMS Upload Failed ({resp.status_code}): {resp.text}")
                return resp.json()
        except Exception as e:
            logger.error(f"Failed to upload media: {e}")
            raise
