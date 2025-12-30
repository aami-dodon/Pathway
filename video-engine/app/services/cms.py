import requests
import json
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

    def create_post(self, title, content_text, excerpt, slug=None, coach_id=None):
        if not self.token:
            self.login()
            
        if not coach_id:
             # Fallback to current user's coach profile
             coach = self.get_coach_profile()
             coach_id = coach.get("id")

        # Create basic Lexical JSON structure with the content as one paragraph
        lexical_content = {
            "root": {
                "type": "root",
                "format": "",
                "indent": 0,
                "version": 1,
                "children": [
                    {
                        "type": "paragraph",
                        "format": "",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "type": "text",
                                "detail": 0,
                                "format": 0,
                                "mode": "normal",
                                "style": "",
                                "text": content_text or "",
                                "version": 1
                            }
                        ],
                        "direction": "ltr"
                    }
                ],
                "direction": "ltr"
            }
        }

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
