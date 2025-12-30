import sys
import os

# Add video-engine/app to path to import CMS service
sys.path.append(os.path.join(os.getcwd(), 'app'))

try:
    from services.cms import CmsService
    
    # Configuration
    API_URL = "http://localhost:9006/api"
    EMAIL = "sayantan.kumar.basu@gmail.com"
    PASSWORD = "!1Dilbert"

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
    test_title = "Integration Test from Video Engine"
    test_content = "This is a test post created by the Antigravity agent to verify video-engine to backend connectivity."
    test_excerpt = "Testing connectivity between video-engine and backend."
    
    post = cms.create_post(
        title=test_title,
        content_text=test_content,
        excerpt=test_excerpt,
        coach_id=coach.get('id')
    )
    
    print(f"✅ Post created successfully! ID: {post.get('id')}")
    print(f"Post Title: {post.get('title')}")
    print(f"Status: {'Published' if post.get('isPublished') else 'Draft'}")
    
    print("\n--- All tests passed! ---")

except Exception as e:
    print(f"\n❌ FAILED: {e}")
    sys.exit(1)
