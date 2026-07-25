import json
import urllib.request
import re
import os

json_path = r"C:/Users/skand/.gemini/antigravity/brain/70bf024b-b365-45d4-8832-c1ec65500ea4/.system_generated/steps/12/output.txt"
output_dir = r"d:\vilora"

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for screen in data.get("screens", []):
    title = screen.get("title", "Untitled")
    # Sanitize title for filename
    filename = re.sub(r'[\\/*?:"<>|]', "", title)
    filename = filename.replace(" ", "_") + ".html"
    
    html_code_info = screen.get("htmlCode", {})
    download_url = html_code_info.get("downloadUrl")
    
    if download_url:
        filepath = os.path.join(output_dir, filename)
        print(f"Downloading {title} to {filename}...")
        try:
            req = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                content = response.read()
                with open(filepath, 'wb') as out_f:
                    out_f.write(content)
            print(f"Successfully downloaded {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
    else:
        print(f"Skipping {title} (no HTML code available)")
