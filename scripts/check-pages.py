"""Verify a Pages artifact under its deployment URL before upload."""
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree

from markdown import markdown


class Links(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.targets = []
        self.relations = {}
        self.feed(content)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        for attribute in ("href", "src", "poster", "action"):
            if attrs.get(attribute):
                self.targets.append(attrs[attribute])
        if tag == "link" and attrs.get("rel") and attrs.get("href"):
            key = (attrs["rel"], attrs.get("type"))
            self.relations.setdefault(key, []).append(attrs["href"])


def check_pages(site, base):
    site = Path(site).resolve()
    origin = urlsplit(base)
    documents = {
        page: Links(page.read_text())
        for page in sorted(site.rglob("*.html"))
    }
    failures = []
    checked = 0

    def verify_target(source, page_url, link):
        nonlocal checked
        url = urlsplit(urljoin(page_url, link))
        if url.hostname in {"localhost", "127.0.0.1", "::1"} or url.scheme == "file":
            failures.append(f"{source}: local-only URL {link}")
            return
        if url.netloc != origin.netloc or url.scheme not in {"http", "https"}:
            return
        if url.scheme != origin.scheme or not url.path.startswith(origin.path):
            failures.append(f"{source}: link escapes public Pages root: {link}")
            return
        relative = unquote(url.path[len(origin.path):])
        target = (site / relative).resolve()
        if not target.is_relative_to(site):
            failures.append(f"{source}: file escapes artifact: {link}")
            return
        if target.is_dir():
            target /= "index.html"
        if not target.is_file():
            failures.append(f"{source}: missing {link}")
        elif target in documents and url.fragment and unquote(url.fragment) not in documents[target].ids:
            failures.append(f"{source}: missing fragment {link}")
        checked += 1

    articles = set()
    for page, content in documents.items():
        relative = page.relative_to(site).as_posix()
        page_url = urljoin(base, relative.removesuffix("index.html"))
        for link in content.targets:
            verify_target(relative, page_url, link)
        if relative.startswith("assets/"):
            continue
        if relative == "404.html":
            # Pages serves this file at the browser's missing URL, including nested paths.
            for link in content.targets:
                if not link.startswith("#"):
                    verify_target(relative, urljoin(base, "missing/nested/page/"), link)
            if not any(urljoin(page_url, link) == base for link in content.targets):
                failures.append("404.html: missing project-scoped home link")
            continue
        articles.add(page_url)
        expected = {
            ("canonical", None): page_url,
            ("alternate", "text/markdown"): urljoin(page_url, "index.md"),
            ("describedby", "text/plain"): urljoin(base, "llms.txt"),
        }
        for relation, target in expected.items():
            if content.relations.get(relation) != [target]:
                failures.append(f"{relative}: expected {relation[0]} URL {target}")

    markup_sources = sorted(site.rglob("*.md")) + [site / "llms.txt"]
    for source in markup_sources:
        relative = source.relative_to(site).as_posix()
        markup = markdown(source.read_text(), extensions=["tables", "fenced_code", "footnotes"])
        for link in Links(markup).targets:
            verify_target(relative, urljoin(base, relative), link)

    sitemap = ElementTree.parse(site / "sitemap.xml")
    locations = {element.text for element in sitemap.findall(".//{*}loc")}
    if articles != locations:
        failures.append("sitemap.xml: URLs differ from the public canonical article URLs")
    if f"Sitemap: {urljoin(base, 'sitemap.xml')}" not in (site / "robots.txt").read_text().splitlines():
        failures.append("robots.txt: missing public sitemap")
    search = json.loads((site / "search.json").read_text())
    if not search["items"]:
        failures.append("search.json: empty search index")
    for item in search["items"]:
        verify_target("search.json", base, item["location"])

    notices = "assets/third-party-notices.txt"
    review = documents[site / "website-review/index.html"]
    review_url = urljoin(base, "website-review/")
    notice_file = site / notices
    notice_linked = any(urljoin(review_url, link) == urljoin(base, notices) for link in review.targets)
    if not notice_file.is_file() or not notice_file.stat().st_size or not notice_linked:
        failures.append("website-review/: missing linked third-party notices")
    if list((site / "assets/review").glob("*.png")):
        failures.append("assets/review/: public artifact includes original screenshots")
    if failures:
        raise SystemExit("\n".join(failures))
    print(f"Pages artifact passed: {len(articles)} canonical articles, {len(documents)} HTML files and {checked} internal targets and fragments.")


if __name__ == "__main__":
    check_pages(sys.argv[1], sys.argv[2])
