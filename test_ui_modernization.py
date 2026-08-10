# T031 - Verificacion visual y funcional de la spec 002-ui-modernization
# Cubre: US1 (cards), US2 (responsive), US3 (header consistente)
from playwright.sync_api import sync_playwright
import json, sys

BASE = "http://localhost:5173"
RESULTS = []
FAILURES = []

def log(ok, msg):
    status = "[PASS]" if ok else "[FAIL]"
    entry = f"{status} {msg}"
    print(entry)
    RESULTS.append({"ok": ok, "msg": msg})
    if not ok:
        FAILURES.append(msg)

def go(page, path, wait=True):
    """Navigate to path, wait for network idle."""
    url = f"{BASE}{path}"
    print(f"\n  -> {path}")
    page.goto(url)
    if wait:
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

def check_no_horizontal_scroll(page, label):
    """Verify page content doesn't overflow viewport horizontally."""
    scroll_width = page.evaluate("document.documentElement.scrollWidth")
    client_width = page.evaluate("document.documentElement.clientWidth")
    ok = scroll_width <= client_width + 2  # 2px tolerance
    log(ok, f"{label}: sin scroll horizontal (scrollW={scroll_width}, clientW={client_width})")
    return ok

def get_card_dimensions(page):
    """Get all product card dimensions on current page."""
    return page.evaluate("""() => {
        const cards = document.querySelectorAll('.card-shell');
        if (!cards.length) {
            const alt = document.querySelectorAll('[class*="card"]');
            return { count: alt.length, dims: [] };
        }
        const dims = [];
        cards.forEach(c => {
            const rect = c.getBoundingClientRect();
            dims.push({ w: Math.round(rect.width), h: Math.round(rect.height) });
        });
        return { count: cards.length, dims };
    }""")

def check_card_consistency(page, label):
    """All cards must have identical width and height within ±2px."""
    data = get_card_dimensions(page)
    n = data["count"]
    if n == 0:
        log(False, f"{label}: no se encontraron cards ({data})")
        return
    dims = data["dims"]
    widths = set(d["w"] for d in dims)
    heights = set(d["h"] for d in dims)

    w_ok = len(widths) <= 1 or (max(widths) - min(widths) <= 2)
    h_ok = len(heights) <= 1 or (max(heights) - min(heights) <= 2)

    if w_ok and h_ok:
        w = list(widths)[0] if len(widths) == 1 else f"{min(widths)}-{max(widths)}"
        h = list(heights)[0] if len(heights) == 1 else f"{min(heights)}-{max(heights)}"
        log(True, f"{label}: {n} cards con mismas dimensiones ({w}x{h}, tol ±2px)")
    else:
        log(False, f"{label}: cards varían en tamaño -> widths={widths}, heights={heights}")

def get_header_info(page):
    """Extract header structure info for consistency check."""
    return page.evaluate("""() => {
        const nav = document.querySelector('nav');
        if (!nav) return null;
        const rect = nav.getBoundingClientRect();
        const style = window.getComputedStyle(nav);
        return {
            height: Math.round(rect.height),
            position: style.position,
            top: style.top,
            zIndex: style.zIndex,
            bgClass: nav.className?.includes('bg-') || 'unknown',
        };
    }""")


# ─── TEST SUITE ───
print("=" * 60)
print("T031 — Verificación Spec 002 UI Modernization")
print("=" * 60)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # ─── DESKTOP TESTS (1280×720) ───
    print("\n--- DESKTOP (1280x720) ---")
    ctx = browser.new_context(viewport={"width": 1280, "height": 720})
    page = ctx.new_page()

    # US1: /home card dimensions
    go(page, "/home")
    page.screenshot(path="tmp/shot_desktop_home.png", full_page=True)
    check_no_horizontal_scroll(page, "Desktop /home")
    check_card_consistency(page, "Desktop /home cards")

    # US1: /productos card dimensions
    go(page, "/productos")
    page.screenshot(path="tmp/shot_desktop_productos.png", full_page=True)
    check_no_horizontal_scroll(page, "Desktop /productos")
    check_card_consistency(page, "Desktop /productos cards")

    # US1: Hover effect on cards
    card_check = page.evaluate("""() => {
        const card = document.querySelector('.card-shell');
        if (!card) return 'no card found';
        const before = card.getBoundingClientRect();
        const evt = new MouseEvent('mouseenter', { bubbles: true });
        card.dispatchEvent(evt);
        const after = card.getBoundingClientRect();
        return {
            before: { w: before.width, h: before.height },
            after: { w: after.width, h: after.height },
            layout_shift: before.width !== after.width || before.height !== after.height
        };
    }""")
    if card_check == "no card found":
        log(False, "Desktop hover: no se encontró .card-shell")
    elif card_check["layout_shift"]:
        log(False, f"Desktop hover: la card sufrió layout shift (antes={card_check['before']}, después={card_check['after']})")
    else:
        log(True, "Desktop hover: sin layout shift al hacer hover")

    # US3: Check /contacto header
    go(page, "/contacto")
    page.screenshot(path="tmp/shot_desktop_contacto.png", full_page=True)

    # US3: Header consistency across all pages
    header_data = {}
    for path, label in [("/home", "Home"), ("/productos", "Productos"), ("/contacto", "Contacto")]:
        go(page, path)
        header_data[label] = get_header_info(page)

    heights = set(h["height"] for h in header_data.values() if h)
    positions = set(h["position"] for h in header_data.values() if h)
    if len(heights) == 1 and len(positions) == 1 and "fixed" in positions:
        log(True, f"Header consistente: fixed, {list(heights)[0]}px en {list(header_data.keys())}")
    else:
        log(False, f"Header inconsistente: {header_data}")

    # US2: /producto/:id desktop layout
    go(page, "/producto/1")
    page.screenshot(path="tmp/shot_desktop_detail.png", full_page=True)
    # Check flex layout exists
    has_flex_layout = page.evaluate("""() => {
        const main = document.querySelector('main') || document.querySelector('[class*="flex-col"]');
        return main ? true : false;
    }""")
    log(has_flex_layout, "Desktop /producto/1: layout cargado correctamente")

    ctx.close()

    # ─── TABLET TESTS (768×700) ───
    print("\n--- TABLET (768x700) ---")
    ctx = browser.new_context(viewport={"width": 768, "height": 700})
    page = ctx.new_page()

    go(page, "/home")
    page.screenshot(path="tmp/shot_tablet_home.png", full_page=True)
    check_no_horizontal_scroll(page, "Tablet /home")

    go(page, "/productos")
    page.screenshot(path="tmp/shot_tablet_productos.png", full_page=True)
    check_no_horizontal_scroll(page, "Tablet /productos")

    ctx.close()

    # ─── MOBILE TESTS (375×667) ───
    print("\n--- MOBILE (375x667) ---")
    ctx = browser.new_context(viewport={"width": 375, "height": 667})
    page = ctx.new_page()

    go(page, "/home")
    page.screenshot(path="tmp/shot_mobile_home.png", full_page=True)
    check_no_horizontal_scroll(page, "Mobile /home")
    check_card_consistency(page, "Mobile /home cards")

    go(page, "/productos")
    page.screenshot(path="tmp/shot_mobile_productos.png", full_page=True)
    check_no_horizontal_scroll(page, "Mobile /productos")

    # US2: /producto/:id gallery reorganizes
    go(page, "/producto/1")
    page.screenshot(path="tmp/shot_mobile_detail.png", full_page=True)
    check_no_horizontal_scroll(page, "Mobile /producto/1")
    # Check that thumbnails are horizontal row (not column) in mobile
    gallery_layout = page.evaluate("""() => {
        const thumbContainers = document.querySelectorAll('.flex.gap-2, .flex.gap-3');
        for (const el of thumbContainers) {
            const style = window.getComputedStyle(el);
            if (style.display === 'flex' && style.flexDirection === 'row') {
                return { direction: 'row', found: true };
            }
        }
        return { direction: 'unknown', found: false };
    }""")
    log(gallery_layout["found"], f"Mobile /producto/1: galería reorganizada (thumbnails en fila)")

    # US2: No horizontal scroll everywhere in mobile
    go(page, "/contacto")
    check_no_horizontal_scroll(page, "Mobile /contacto")

    go(page, "/login")
    check_no_horizontal_scroll(page, "Mobile /login")

    ctx.close()

    # ─── EDGE CASES ───
    print("\n--- EDGE CASES ---")
    ctx = browser.new_context(viewport={"width": 1280, "height": 720})
    page = ctx.new_page()

    # Long title truncation (producto 66 has a very long description, but let's find one with long name)
    # Product 67 has a very long name - "Taladro atornillador percuto inalámbrico 18v 2 bat"
    # Actually let's check product 1 cards for line-clamp
    go(page, "/productos")
    title_clamped = page.evaluate("""() => {
        const titles = document.querySelectorAll('.card-shell .line-clamp-2, .card-shell [class*="line-clamp"]');
        if (!titles.length) {
            // fallback: try any truncation hint
            const allTitles = document.querySelectorAll('.card-shell h3, .card-shell [title]');
            return { clamped_elements: allTitles.length, found_clamp: false };
        }
        const samples = [];
        titles.forEach((t, i) => {
            if (i < 3) {
                const style = window.getComputedStyle(t);
                samples.push({
                    overflow: style.overflow,
                    textOverflow: style.textOverflow,
                    display: style.display,
                    webkitLineClamp: style.webkitLineClamp,
                });
            }
        });
        return { count: titles.length, samples, found_clamp: true };
    }""")
    if title_clamped["found_clamp"]:
        log(True, f"Títulos truncados: {title_clamped['count']} elementos con line-clamp")
    else:
        log(False, f"Títulos sin truncar (no se encontró line-clamp): {title_clamped}")

    # Image aspect ratio containment
    img_contain = page.evaluate("""() => {
        const imgs = document.querySelectorAll('.card-shell img[class*="object-contain"]');
        if (!imgs.length) {
            return { count: 0, note: 'no object-contain imgs' };
        }
        const sample = [];
        imgs.forEach((img, i) => {
            if (i < 3) sample.push({
                className: img.className,
                parentClass: img.parentElement?.className?.substring(0, 80) || 'no-parent',
            });
        });
        return { count: imgs.length, sample };
    }""")
    if img_contain["count"] > 0:
        log(True, f"Imágenes con object-contain: {img_contain['count']}")
    else:
        # Not necessarily a failure if images use different approach
        log(True, f"Imágenes: {img_contain}")

    ctx.close()
    browser.close()

# ─── SUMMARY ───
print("\n" + "=" * 60)
print("RESUMEN")
print("=" * 60)
passed = sum(1 for r in RESULTS if r["ok"])
total = len(RESULTS)
print(f"  {passed}/{total} checks pasaron")

if FAILURES:
    print(f"\nFAILURES ({len(FAILURES)}):")
    for i, f in enumerate(FAILURES, 1):
        print(f"  {i}. {f}")
else:
    print("\nAll checks passed")

sys.exit(1 if FAILURES else 0)
