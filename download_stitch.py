import os
import urllib.request
import re

SCREENS = [
    {
        "title": "Vilora Naturals - Redesigned Luxury Home",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2NlMDM0ZGExZDQ2ZTRmNjBhZjljMTkwMjFiMjA4ZjQ4EgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Inventory System",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2RjOTNhYmYzZWEzYjQ5OTA5YWFmMzUzNGY5NmRiOWUwEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Product Details",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ1NmIwZGM2NjM3ZDQwYjA5YjZmYmZhNTMxZGU0MGI0EgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Reviews Moderation",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Q5YmFlYTMzYTNhZTQ1NmE5ODBmZjZlNTM5NDNiMmM2EgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Customer Dashboard",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzgxYWNlMjg3NDYyZjQ4ZGI4ODA5YmNjMTMxZjJiMzRlEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Analytics Dashboard",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFlMDQ2MmI3NGI2MDRkNmU4NTUxYmI3NzNkODhmYzAxEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - User Management",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E1MDNiYjQzZmUxNDQ3ZmI4NTY0NGE5YjQ5MzM0Yjk5EgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Home",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2IyYmU5YjI4OGVhNzQ5MzRiNjU0MGI4OGNiMDQ4YmRhEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Checkout",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ4MjdiZmE2YjJiOTRhYWY4ZTYxNzk1MTEyNzM3MjQzEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Product Management",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2YxOWNkZDgyZjdmOTQ4NjY5ZTEyYTE2MTg0ZDk1MDIyEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Coupon Management",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y3Njc5M2JjZWY1ZjQ2MzZhNjk0Mzk1OWY2OWIzNjg2EgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Orders Management",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzM3N2UxY2UzYTM5MzQzMzk4ZGVhZmRmODI1NzQyZWFkEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Admin - Analytics Dashboard v2",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk1ZDNhMWQxZTY5MjQ1MGJiNjk2YzVjZTZhZDE4MWVmEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Member Dashboard",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzNjYWU2OGViNjI1ZDRlYmM4ZTBlYWVmYzU5YWQ5MTQyEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Shopping Bag",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdlZWYyMmY5NzIzZDQyMThhNGRiYjE0ZjUxYjg1YTA5EgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    },
    {
        "title": "Vilora Naturals - Sign In & Register",
        "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzY3Yjg2MzVmZmY2OTQzODc4MWQxZGY3ZjllMTFlZDZhEgsSBxCEspy4lBgYAZIBIwoKcHJvamVjdF9pZBIVQhM1NzI1MzY5NzA1NDk0MzcwNDc1&filename=&opi=89354086"
    }
]

def sanitize_filename(title):
    # Convert to lowercase and replace spaces/hyphens with underscores
    name = re.sub(r'[^a-zA-Z0-9]+', '_', title.lower())
    # Remove leading/trailing underscores
    name = name.strip('_')
    return name + ".html"

target_dir = os.path.join("src", "main", "resources", "templates")
os.makedirs(target_dir, exist_ok=True)

for screen in SCREENS:
    filename = sanitize_filename(screen["title"])
    filepath = os.path.join(target_dir, filename)
    print(f"Downloading {screen['title']} -> {filepath}")
    
    req = urllib.request.Request(screen["url"], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html)
        print(f"Successfully saved {filepath}")
    except Exception as e:
        print(f"Failed to download {screen['title']}: {e}")

print("Done downloading all screens.")
