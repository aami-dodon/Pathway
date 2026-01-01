"""
Markdown to Lexical JSON Converter

Converts Markdown text to Payload CMS Lexical Editor JSON format.
"""

import re
from html.parser import HTMLParser
from typing import Any

try:
    import markdown
except ImportError:
    markdown = None


class LexicalHTMLParser(HTMLParser):
    """
    Parses HTML (converted from Markdown) and builds Lexical JSON nodes.
    """

    def __init__(self):
        super().__init__()
        self.nodes: list[dict[str, Any]] = []
        self.stack: list[dict[str, Any]] = []  # Stack for nested elements
        self.current_text = ""
        self.current_format = 0  # Bitmask: 1=bold, 2=italic, 8=underline, 16=code

    def _flush_text(self):
        """Flush accumulated text to the current node."""
        if self.current_text:
            text_node = {
                "type": "text",
                "text": self.current_text,
                "format": self.current_format,
                "detail": 0,
                "mode": "normal",
                "style": "",
                "version": 1
            }
            if self.stack:
                if "children" not in self.stack[-1]:
                    self.stack[-1]["children"] = []
                self.stack[-1]["children"].append(text_node)
            self.current_text = ""

    def _create_node(self, node_type: str, **kwargs) -> dict[str, Any]:
        """Create a base Lexical node with common properties."""
        node = {
            "type": node_type,
            "format": kwargs.get("format", ""),
            "indent": kwargs.get("indent", 0),
            "version": 1,
            "direction": "ltr",
            "children": []
        }
        node.update(kwargs)
        return node

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        self._flush_text()
        attrs_dict = dict(attrs)

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            node = self._create_node("heading", tag=tag)
            self.stack.append(node)

        elif tag == "p":
            node = self._create_node("paragraph")
            self.stack.append(node)

        elif tag == "ul":
            node = self._create_node("list", listType="bullet")
            self.stack.append(node)

        elif tag == "ol":
            node = self._create_node("list", listType="number")
            self.stack.append(node)

        elif tag == "li":
            node = self._create_node("listitem", value=1)
            self.stack.append(node)

        elif tag == "blockquote":
            node = self._create_node("quote")
            self.stack.append(node)

        elif tag == "a":
            href = attrs_dict.get("href", "")
            node = self._create_node("link", url=href)
            self.stack.append(node)

        elif tag == "strong" or tag == "b":
            self.current_format |= 1  # Bold

        elif tag == "em" or tag == "i":
            self.current_format |= 2  # Italic

        elif tag == "u":
            self.current_format |= 8  # Underline

        elif tag == "code":
            # Check if inside a pre block (code block) or inline
            if self.stack and self.stack[-1].get("type") == "code-block":
                pass  # Already in code block
            else:
                self.current_format |= 16  # Inline code

        elif tag == "pre":
            # Start a code block - we'll handle the inner code tag
            node = self._create_node("paragraph")  # Fallback to paragraph for now
            self.stack.append(node)

        elif tag == "br":
            # Line break
            if self.stack:
                self._flush_text()
                linebreak_node = {"type": "linebreak", "version": 1}
                if "children" not in self.stack[-1]:
                    self.stack[-1]["children"] = []
                self.stack[-1]["children"].append(linebreak_node)

    def handle_endtag(self, tag: str):
        self._flush_text()

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "blockquote", "a", "pre"):
            if self.stack:
                node = self.stack.pop()
                if self.stack:
                    # Nest inside parent
                    if "children" not in self.stack[-1]:
                        self.stack[-1]["children"] = []
                    self.stack[-1]["children"].append(node)
                else:
                    # Top-level node
                    self.nodes.append(node)

        elif tag == "strong" or tag == "b":
            self.current_format &= ~1  # Remove bold

        elif tag == "em" or tag == "i":
            self.current_format &= ~2  # Remove italic

        elif tag == "u":
            self.current_format &= ~8  # Remove underline

        elif tag == "code":
            self.current_format &= ~16  # Remove inline code

    def handle_data(self, data: str):
        # Accumulate text data
        self.current_text += data

    def get_nodes(self) -> list[dict[str, Any]]:
        """Return the parsed Lexical nodes."""
        self._flush_text()
        return self.nodes


def markdown_to_lexical(markdown_text: str) -> dict[str, Any]:
    """
    Convert Markdown text to Lexical JSON format.

    Args:
        markdown_text: The Markdown content to convert.

    Returns:
        A dictionary representing the Lexical JSON structure.
    """
    if not markdown_text or not markdown_text.strip():
        # Return empty root for empty content
        return {
            "root": {
                "type": "root",
                "format": "",
                "indent": 0,
                "version": 1,
                "direction": "ltr",
                "children": []
            }
        }

    # If markdown library is available, use it for proper parsing
    if markdown:
        html_content = markdown.markdown(
            markdown_text,
            extensions=['extra']  # Adds support for fenced code blocks, etc.
        )
    else:
        # Fallback: basic Markdown to HTML conversion
        html_content = _basic_markdown_to_html(markdown_text)

    # Parse HTML to Lexical nodes
    parser = LexicalHTMLParser()
    parser.feed(html_content)
    children = parser.get_nodes()

    # If no nodes were parsed, wrap the text in a paragraph
    if not children:
        children = [{
            "type": "paragraph",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [{
                "type": "text",
                "text": markdown_text.strip(),
                "format": 0,
                "detail": 0,
                "mode": "normal",
                "style": "",
                "version": 1
            }]
        }]

    return {
        "root": {
            "type": "root",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": children
        }
    }


def _basic_markdown_to_html(md_text: str) -> str:
    """
    Basic Markdown to HTML conversion as fallback when markdown library is unavailable.
    """
    lines = md_text.split('\n')
    html_parts = []
    in_list = False
    list_type = None

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if in_list:
                html_parts.append(f'</{list_type}>')
                in_list = False
            continue

        # Headings
        if stripped.startswith('######'):
            html_parts.append(f'<h6>{stripped[6:].strip()}</h6>')
        elif stripped.startswith('#####'):
            html_parts.append(f'<h5>{stripped[5:].strip()}</h5>')
        elif stripped.startswith('####'):
            html_parts.append(f'<h4>{stripped[4:].strip()}</h4>')
        elif stripped.startswith('###'):
            html_parts.append(f'<h3>{stripped[3:].strip()}</h3>')
        elif stripped.startswith('##'):
            html_parts.append(f'<h2>{stripped[2:].strip()}</h2>')
        elif stripped.startswith('#'):
            html_parts.append(f'<h1>{stripped[1:].strip()}</h1>')

        # Bullet list
        elif stripped.startswith('- ') or stripped.startswith('* '):
            if not in_list or list_type != 'ul':
                if in_list:
                    html_parts.append(f'</{list_type}>')
                html_parts.append('<ul>')
                in_list = True
                list_type = 'ul'
            item_text = _process_inline_formatting(stripped[2:])
            html_parts.append(f'<li>{item_text}</li>')

        # Numbered list
        elif re.match(r'^\d+\.\s', stripped):
            if not in_list or list_type != 'ol':
                if in_list:
                    html_parts.append(f'</{list_type}>')
                html_parts.append('<ol>')
                in_list = True
                list_type = 'ol'
            item_text = _process_inline_formatting(re.sub(r'^\d+\.\s', '', stripped))
            html_parts.append(f'<li>{item_text}</li>')

        # Blockquote
        elif stripped.startswith('>'):
            text = _process_inline_formatting(stripped[1:].strip())
            html_parts.append(f'<blockquote><p>{text}</p></blockquote>')

        # Regular paragraph
        else:
            if in_list:
                html_parts.append(f'</{list_type}>')
                in_list = False
            text = _process_inline_formatting(stripped)
            html_parts.append(f'<p>{text}</p>')

    if in_list:
        html_parts.append(f'</{list_type}>')

    return '\n'.join(html_parts)


def _process_inline_formatting(text: str) -> str:
    """Process inline Markdown formatting (bold, italic, code, links)."""
    # Bold: **text** or __text__
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'__(.+?)__', r'<strong>\1</strong>', text)

    # Italic: *text* or _text_
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    text = re.sub(r'_(.+?)_', r'<em>\1</em>', text)

    # Inline code: `code`
    text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)

    # Links: [text](url)
    text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', text)

    return text
