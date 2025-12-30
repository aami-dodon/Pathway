import sys
import os
import time

# Add video-engine/app to path to import CMS service
sys.path.append(os.path.join(os.getcwd(), 'app'))

try:
    from services.cms import CmsService
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Configuration
    API_URL = os.getenv("CMS_API_URL", "http://localhost:9006/api")
    EMAIL = os.getenv("CMS_EMAIL")
    PASSWORD = os.getenv("CMS_PASSWORD")

    print(f"--- Testing CMS Integration ---")
    print(f"Connecting to {API_URL}...")
    
    cms = CmsService(api_url=API_URL, email=EMAIL, password=PASSWORD)
    
    # 1. Test Login
    print("\n1. Testing Login...")
    user = cms.login()
    print(f"✅ Login successful for user: {user.get('email')} (ID: {user.get('id')})")
    
    # 2. Test Fetching Coach Profile
    print("\n2. Fetching Coach Profile...")
    coach = cms.get_coach_profile()
    print(f"✅ Found Coach Profile: {coach.get('displayName')} (ID: {coach.get('id')})")
    
    # 3. Test Creating a Post (Draft)
    print("\n3. Creating a test post...")
    test_title = f"Prod Integration Test {int(time.time())}"
    test_content = "This is a test post created by the Antigravity agent to verify video-engine to production backend connectivity."
    test_excerpt = "Testing connectivity between video-engine and backend."
    
    post = cms.create_post(
        title=test_title,
        content_text=test_content,
        excerpt=test_excerpt,
        coach_id=coach.get('id')
    )
    
    print(f"Response: {post}")
    
    # Try to find ID and Title safely
    post_id = post.get('id') or post.get('doc', {}).get('id')
    post_title = post.get('title') or post.get('doc', {}).get('title')
    is_published = post.get('isPublished') or post.get('doc', {}).get('isPublished')
    
    print(f"✅ Post created successfully! ID: {post_id}")
    print(f"Post Title: {post_title}")
    print(f"Status: {'Published' if is_published else 'Draft'}")
    
    print("\n--- All tests passed! ---")

except Exception as e:
    print(f"\n❌ FAILED: {e}")
    sys.exit(1)
