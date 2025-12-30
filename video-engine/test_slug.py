from app.utils.slug import slugify

topic = "The Life of a Snail"
slug = slugify(topic)
print(f"Original: '{topic}'")
print(f"Slug: '{slug}'")

assert slug == "the-life-of-a-snail", f"Expected 'the-life-of-a-snail', got '{slug}'"
