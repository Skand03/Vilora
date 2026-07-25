import os
import re

directory = r"d:\vilora"

fixes = [
    # 1. Typography fixes in Tailwind Config
    (r'"label-md": \["14px",', r'"label-md": ["16px",'),
    (r'"data-ui": \["14px",', r'"data-ui": ["15px",'),
    (r'"label-sm": \["12px",', r'"label-sm": ["13px",'),
    
    # 2. Minimum text sizes
    (r'text-\[10px\]', r'text-xs'),
    (r'text-\[11px\]', r'text-xs'),
    
    # 3. Solid Header instead of low-contrast glassmorphism
    (r'bg-white/60 backdrop-blur-md', r'bg-white shadow-md border-b border-gray-100'),
    (r'bg-surface/80 backdrop-blur-xl', r'bg-surface shadow-md border-b border-outline-variant/30'),
    
    # 4. Industrial 'Add to Cart' buttons instead of small circles
    (r'<button class="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">\s*<span class="material-symbols-outlined">add_shopping_cart</span>\s*</button>', 
     r'<button class="w-full mt-4 bg-primary text-white py-2 rounded border border-primary font-bold hover:bg-primary/90 transition-colors uppercase text-sm tracking-wider flex items-center justify-center gap-2"><span class="material-symbols-outlined text-[18px]">shopping_cart</span> Add to Cart</button>'),
     
    # 5. Fix layout of product cards (add flex-col and mt-auto to push buttons down if needed)
    # The container div around price and button currently looks like:
    # <div class="flex justify-between items-center">
    # <span class="font-body-lg font-bold text-primary">$42.00</span>
    (r'<div class="flex justify-between items-center">\s*<span class="font-body-lg font-bold text-primary">([^<]+)</span>\s*<button class="w-full',
     r'<div class="flex flex-col mt-4 border-t border-outline-variant/20 pt-4">\n<span class="font-body-lg font-bold text-primary text-center">\1</span>\n<button class="w-full'),
     
    # 6. Button in Product Details (glassmorphic to solid)
    (r'glass-card text-primary px-6 py-2 rounded-full font-label-md', r'bg-primary text-white px-6 py-2 rounded font-bold uppercase tracking-wider shadow-sm hover:opacity-90')
]

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for pattern, replacement in fixes:
            new_content = re.sub(pattern, replacement, new_content)
            
        # Specific fix for the flex justify-between after button replace
        new_content = new_content.replace(
            '<div class="flex justify-between items-center">\n<span class="font-body-lg font-bold text-primary">',
            '<div class="flex flex-col mt-4 border-t border-outline-variant/20 pt-4 items-center">\n<span class="font-body-lg font-bold text-primary text-xl mb-2">'
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {filename}")

print("All fixes applied successfully.")
