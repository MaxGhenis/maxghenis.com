#!/usr/bin/env python3
"""Import Medium export HTML files to Astro blog posts."""

import os
import re
import html
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime
import hashlib

MEDIUM_EXPORT_DIR = "/tmp/medium-export/posts"
OUTPUT_DIR = "/Users/maxghenis/maxghenis.com/src/content/blog/medium"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
MIN_CONTENT_LENGTH = 2000  # Filter out short comments - real posts are longer
MIN_FILE_SIZE = 15000  # Real posts have larger HTML files (15KB+)

# Posts to skip (already imported or not personal blog posts)
SKIP_PATTERNS = [
    "ubicenter",
    "policyengine",
    "draft_",
    # Already have these from substack
    "elon-musk",
    "why-i-m-a-neoliberal",
    "warrens-wealth-tax",
    "rent-control",
    "oxnard",
    # Organization posts
    "ubi-center",
    "ventura-county-yimby",
    "sf-yimby",
    "citizens-climate",
]

# Title patterns that indicate comments, not posts
COMMENT_TITLE_PATTERNS = [
    r'^thanks',
    r'^thank you',
    r'^i agree',
    r'^i disagree',
    r'^great point',
    r'^interesting',
    r'^not sure',
    r'^certainly',
    r'^absolutely',
    r'^perhaps',
    r'^fair enough',
    r'^good point',
    r'^can you',
    r'^could you',
    r'^what about',
    r'^from nymag',
    r'^source\?',
    r'^https?://',
    r'^hear,? hear',
    r'^alternatively',
    r'^first off',
    r'^to clarify',
    r'^to be fair',
    r'^as mentioned',
    r'^my mistake',
    r'^that figure',
    r'^they reported',
    r'^link broken',
    r'^this is a lie',
    r'^why do you',
    r'^big \+1',
    r"^i'd clarify",
    r"^i'm sympathetic",
    r'^related to',
    r'^gang violence',
    r'^universal basic income —',
    r'^lack of housing',
    r'^poverty is not',
    r'^pretty extreme',
    r'^excluding legal',
    r'^appreciation of',
    r'^lvt can',
    r"^i wouldn't",
    r'^yes,? this',
    r'^welfare benefits',
    r'^there are two issues',
    r'^there are many reasons',
    r'^no it wasn',
    r"^that's not true",
    r"^uber's studies",
    r'^my goal with this piece',
    r"^let's say hypothetically",
    r'^studies on cash',
    r'^no,? the chronicle',
    r'^the most important difference',
    r'^numerous studies',
    r'^\$1,000/month',
    r'^you may be interested',
    r'^many republicans',
    r'^the footnote',
    r'^was this from',
    r'^a true basic income',
    r'^basic income is not',
    r'^basic income would',
    r'^many \(probably most\)',
    r'^eitc without',
    r'^at the risk',
    r'^carbon pricing',
    r'^since the proposal',
    r'^i started to read',
    r'^great to see',
    r'^another way',
    r'^excellent work',
    r'^traditional definitions',
    r'^i know this is from',
    r'^the bay area abandoned',
    r"^don't forget",
    r'^the traffic studies',
    r'^low property taxes',
    r'^asking poor people',
    r'^the piece has',
    r'^not michael',
    r'^hi shaun',
    r'^the freedom dividend',
    r'^5 days left',
    r'^not really for vets',
    r"^what's the advantage",
    r'^saudi arabia',
    r"^california's budget",
    r'^midnight tonight',
    r'^dear ventura county',
    r'^congrats on',
    r'^the district child',
]

def to_sentence_case(title):
    """Convert title to sentence case, preserving acronyms and proper nouns."""
    # Words to keep capitalized
    preserve = {'UBI', 'EITC', 'US', 'UK', 'SF', 'CA', 'NYC', 'AI', 'YIMBY',
                'NIMBY', 'GDP', 'CTC', 'VAT', 'API', 'CEO', 'CFO', 'SNAP',
                'California', 'Francisco', 'Breed', 'Yang', 'Trump', 'Biden',
                'Harris', 'Warren', 'Sanders', 'Newsom', 'Medium', 'Reddit',
                'Uber', 'Google', 'DeVos', 'Betsy', 'Tucker', 'Carlson',
                'Andrew', 'London', 'San', 'November', 'June', 'March',
                'January', 'February', 'October', 'Proposition', 'Prop'}

    words = title.split()
    if not words:
        return title

    result = []
    for i, word in enumerate(words):
        # First word: capitalize first letter, rest lowercase unless in preserve
        if i == 0:
            if word.upper() in preserve or word in preserve:
                result.append(word)
            else:
                result.append(word[0].upper() + word[1:].lower() if len(word) > 1 else word.upper())
        else:
            # Other words: lowercase unless in preserve list
            if word.upper() in preserve or word in preserve:
                result.append(word if word in preserve else word.upper() if word.upper() in preserve else word)
            elif word.isupper() and len(word) <= 4:  # Likely acronym
                result.append(word)
            else:
                result.append(word.lower())

    return ' '.join(result)

def html_to_markdown(soup):
    """Convert HTML content to markdown."""
    # Remove script and style elements
    for tag in soup.find_all(['script', 'style', 'meta', 'link']):
        tag.decompose()

    content = []

    for element in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'figure', 'pre']):
        if element.name == 'h1':
            continue  # Skip title, we use frontmatter
        elif element.name == 'h2':
            content.append(f"\n## {element.get_text().strip()}\n")
        elif element.name == 'h3':
            content.append(f"\n### {element.get_text().strip()}\n")
        elif element.name == 'h4':
            content.append(f"\n#### {element.get_text().strip()}\n")
        elif element.name == 'blockquote':
            text = element.get_text().strip()
            content.append(f"\n> {text}\n")
        elif element.name == 'pre':
            code = element.get_text()
            content.append(f"\n```\n{code}\n```\n")
        elif element.name in ['ul', 'ol']:
            for li in element.find_all('li', recursive=False):
                content.append(f"- {li.get_text().strip()}")
            content.append("")
        elif element.name == 'figure':
            img = element.find('img')
            if img and img.get('src'):
                src = img.get('src')
                alt = img.get('alt', '')
                caption = element.find('figcaption')
                cap_text = caption.get_text().strip() if caption else alt
                content.append(f"\n![{cap_text}]({src})\n")
        elif element.name == 'p':
            # Convert links
            text = ""
            for child in element.children:
                if hasattr(child, 'name') and child.name == 'a':
                    href = child.get('href', '')
                    link_text = child.get_text()
                    text += f"[{link_text}]({href})"
                elif hasattr(child, 'name') and child.name == 'strong':
                    text += f"**{child.get_text()}**"
                elif hasattr(child, 'name') and child.name == 'em':
                    text += f"*{child.get_text()}*"
                elif hasattr(child, 'name') and child.name == 'code':
                    text += f"`{child.get_text()}`"
                else:
                    text += str(child) if hasattr(child, 'name') else child

            text = text.strip()
            if text:
                content.append(f"{text}\n")

    return '\n'.join(content)

def slugify(text):
    """Create URL-friendly slug from text."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')[:50]

def should_skip(filename, title, filepath=None):
    """Check if post should be skipped."""
    lower_filename = filename.lower()
    lower_title = title.lower()

    for pattern in SKIP_PATTERNS:
        if pattern in lower_filename or pattern in lower_title:
            return True

    # Check if title matches comment patterns
    for pattern in COMMENT_TITLE_PATTERNS:
        if re.match(pattern, lower_title):
            return True

    # Check file size - real posts are larger
    if filepath and os.path.getsize(filepath) < MIN_FILE_SIZE:
        return True

    return False

def process_post(filepath):
    """Process a single Medium HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Get title
    title_elem = soup.find('h1') or soup.find('title')
    if not title_elem:
        return None

    title = title_elem.get_text().strip()

    # Skip if matches skip patterns
    if should_skip(os.path.basename(filepath), title, filepath):
        return None

    # Get date from filename
    filename = os.path.basename(filepath)
    date_match = re.match(r'(\d{4}-\d{2}-\d{2})', filename)
    if date_match:
        pub_date = date_match.group(1)
    else:
        pub_date = "2020-01-01"  # Fallback

    # Convert content to markdown
    article = soup.find('article') or soup.find('body')
    if not article:
        return None

    markdown_content = html_to_markdown(article)

    # Skip short posts (likely comments)
    if len(markdown_content) < MIN_CONTENT_LENGTH:
        return None

    # Clean up title for sentence case
    title = to_sentence_case(title)

    # Generate slug
    slug = slugify(title)

    # Create description from first paragraph
    first_para = markdown_content.split('\n\n')[0][:200].strip()
    description = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', first_para)  # Remove links
    description = re.sub(r'[*_`]', '', description)  # Remove formatting
    description = description.replace('"', "'")

    return {
        'title': title,
        'slug': slug,
        'pub_date': pub_date,
        'description': description,
        'content': markdown_content,
        'original_file': filename,
    }

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)

    posts = []

    for filename in os.listdir(MEDIUM_EXPORT_DIR):
        if not filename.endswith('.html'):
            continue

        filepath = os.path.join(MEDIUM_EXPORT_DIR, filename)
        result = process_post(filepath)

        if result:
            posts.append(result)
            print(f"✓ {result['pub_date']} - {result['title'][:50]}...")

    # Sort by date
    posts.sort(key=lambda x: x['pub_date'])

    print(f"\nFound {len(posts)} posts to import.")
    print("\nPosts:")
    for p in posts:
        print(f"  {p['pub_date']}: {p['title']}")

    # Write posts
    for post in posts:
        output_path = os.path.join(OUTPUT_DIR, f"{post['slug']}.md")

        # Skip if already exists
        if os.path.exists(output_path):
            print(f"Skipping (exists): {post['slug']}")
            continue

        frontmatter = f"""---
title: "{post['title']}"
description: "{post['description']}"
pubDate: '{post['pub_date']}'
---

"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter + post['content'])

        print(f"Wrote: {output_path}")

if __name__ == '__main__':
    main()
