#!/usr/bin/env python3
"""
TaskBoard v2 プロモスクリーンショット生成 (実機スクリーンショット版)
就活ボードスタイル: グラデーション背景 + デバイスフレーム + テキスト
- iPhone 6.7" (1290x2796) APP_IPHONE_67
- iPad 12.9" (2048x2732) APP_IPAD_PRO_3GEN_129
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_PATH_BOLD   = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"
FONT_PATH_MEDIUM = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"
FONT_FALLBACK    = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def get_font(size, bold=True):
    path = FONT_PATH_BOLD if bold else FONT_PATH_MEDIUM
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.truetype(FONT_FALLBACK, size)

# ---- 実機スクリーンショット (1179x2556 iPhone 15) ----
REAL_SS_DIR = Path("/Users/yuotsuka/Downloads")

# crop_bottom: 広告バナー+タブバー領域を除去するピクセル数 (2556px画像の下から)
# 380px 除去 → 2176px 残す (広告+タブバー+ホームインジケーター)
AD_CROP_BOTTOM = 520  # 広告バナー+タブバー+ホームインジケーターを除去

SCREENS = [
    {
        "filename":    "ss1",
        "source":      REAL_SS_DIR / "IMG_9661.PNG",   # タスク・ライト・日本語
        "crop_bottom": AD_CROP_BOTTOM,
        "title":       "今日やることが\n一目でわかる",
        "subtitle":    "期限・優先度別にセクション整理",
        "grad_top":    (0, 122, 255),
        "grad_bot":    (0, 50, 130),
    },
    {
        "filename":    "ss2",
        "source":      REAL_SS_DIR / "IMG_9660.PNG",   # ホーム・ライト・日本語
        "crop_bottom": AD_CROP_BOTTOM,
        "title":       "タスクを、シンプルに。",
        "subtitle":    "カレンダーで締切を俯瞰する",
        "grad_top":    (0, 90, 200),
        "grad_bot":    (0, 40, 110),
    },
    {
        "filename":    "ss3",
        "source":      REAL_SS_DIR / "IMG_9663.PNG",   # ホーム・ダーク・日本語
        "crop_bottom": AD_CROP_BOTTOM,
        "title":       "ダークモードにも\n完全対応",
        "subtitle":    "目に優しい夜間テーマ搭載",
        "grad_top":    (0, 20, 45),
        "grad_bot":    (0, 0, 0),
    },
    {
        "filename":    "ss4",
        "source":      REAL_SS_DIR / "IMG_9666.PNG",   # 設定・ライト・日本語 (広告なし)
        "crop_bottom": 0,
        "title":       "テーマ・言語を\n自由にカスタマイズ",
        "subtitle":    "日本語・English 切り替え対応",
        "grad_top":    (0, 122, 255),
        "grad_bot":    (0, 50, 130),
    },
]

BASE_DIR    = Path("/Users/yuotsuka/taskboard/screenshots")
OUT_IPHONE  = BASE_DIR / "v2/iphone"
OUT_IPAD    = BASE_DIR / "v2/ipad"
OUT_IPHONE.mkdir(parents=True, exist_ok=True)
OUT_IPAD.mkdir(parents=True, exist_ok=True)


def load_app_img(screen):
    """実機スクリーンショットを読み込み、広告バナーをクロップして返す"""
    img = Image.open(screen["source"])
    if screen["crop_bottom"] > 0:
        w, h = img.size
        img = img.crop((0, 0, w, h - screen["crop_bottom"]))
    return img


def fit_to_frame(app_img, inner_w, inner_h):
    """アスペクト比を保ってフレーム内側にcenter-cropでフィット"""
    src_w, src_h = app_img.size
    src_aspect   = src_w / src_h
    inner_aspect = inner_w / inner_h

    if src_aspect > inner_aspect:
        # 横が余る → 高さ基準でスケール → 横をクロップ
        new_h = inner_h
        new_w = int(new_h * src_aspect)
        tmp   = app_img.resize((new_w, new_h), Image.LANCZOS)
        left  = (new_w - inner_w) // 2
        return tmp.crop((left, 0, left + inner_w, inner_h))
    else:
        # 縦が余る → 幅基準でスケール → 縦をクロップ
        new_w = inner_w
        new_h = int(new_w / src_aspect)
        tmp   = app_img.resize((new_w, new_h), Image.LANCZOS)
        top   = (new_h - inner_h) // 2
        return tmp.crop((0, top, inner_w, top + inner_h))


def make_gradient_bg(width, height, color_top, color_bottom):
    img  = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    r1, g1, b1 = color_top
    r2, g2, b2 = color_bottom
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(r1 + (r2 - r1) * t)
        g = int(g1 + (g2 - g1) * t)
        b = int(b1 + (b2 - b1) * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def composite_device(canvas, app_img, frame_x, frame_y, frame_w, frame_h,
                      corner_radius, bezel, shadow_blur=40):
    W, H = canvas.size

    # ドロップシャドウ
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    sd.rounded_rectangle(
        [frame_x + 10, frame_y + 14, frame_x + frame_w + 10, frame_y + frame_h + 14],
        radius=corner_radius, fill=(0, 0, 0, 140)
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(shadow_blur))
    canvas_rgba  = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(shadow_layer)
    canvas = canvas_rgba.convert("RGB")

    # 白いフレーム
    frame_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame_layer)
    fd.rounded_rectangle(
        [frame_x, frame_y, frame_x + frame_w, frame_y + frame_h],
        radius=corner_radius, fill=(255, 255, 255, 255)
    )
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(frame_layer)
    canvas = canvas_rgba.convert("RGB")

    # アプリ画面 (center-crop でフィット)
    inner_x = frame_x + bezel
    inner_y = frame_y + bezel
    inner_w = frame_w - bezel * 2
    inner_h = frame_h - bezel * 2
    inner_r = max(corner_radius - bezel, 8)

    fitted  = fit_to_frame(app_img, inner_w, inner_h)

    mask = Image.new("L", (inner_w, inner_h), 0)
    md   = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, inner_w, inner_h], radius=inner_r, fill=255)

    app_rgba = fitted.convert("RGBA")
    app_rgba.putalpha(mask)

    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.paste(app_rgba, (inner_x, inner_y), app_rgba)
    return canvas_rgba.convert("RGB")


def draw_multiline_centered(draw, text, center_x, y, font_obj, fill, line_spacing=1.28):
    lines  = text.split("\n")
    dummy  = draw.textbbox((0, 0), "あ", font=font_obj)
    line_h = dummy[3] - dummy[1]
    cur_y  = y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_obj)
        tw   = bbox[2] - bbox[0]
        draw.text((center_x - tw // 2, cur_y), line, font=font_obj, fill=fill)
        cur_y += int(line_h * line_spacing)
    return int(line_h * line_spacing) * len(lines)


def place_text(canvas, screen, frame_y, center_x, title_fs, sub_fs):
    draw       = ImageDraw.Draw(canvas)
    title_font = get_font(title_fs, bold=True)
    sub_font   = get_font(sub_fs,   bold=False)

    dummy        = draw.textbbox((0, 0), "あ", font=title_font)
    line_h       = dummy[3] - dummy[1]
    title_lines  = screen["title"].count("\n") + 1
    title_block_h = int(line_h * 1.28) * title_lines
    sub_bbox     = draw.textbbox((0, 0), screen["subtitle"], font=sub_font)
    sub_h        = sub_bbox[3] - sub_bbox[1]
    gap          = int(line_h * 0.55)
    total_h      = title_block_h + gap + sub_h
    text_top     = (frame_y - total_h) // 2

    draw_multiline_centered(draw, screen["title"], center_x, text_top, title_font, (255, 255, 255))
    sub_y = text_top + title_block_h + gap
    sb    = draw.textbbox((0, 0), screen["subtitle"], font=sub_font)
    sw    = sb[2] - sb[0]
    draw.text((center_x - sw // 2, sub_y), screen["subtitle"], font=sub_font, fill=(200, 225, 255))


def gen_iphone(screen):
    W, H = 1290, 2796
    canvas = make_gradient_bg(W, H, screen["grad_top"], screen["grad_bot"])

    frame_w = 900
    frame_h = int(frame_w * H / W)   # iPhone 6.7" アスペクト維持 = 1950
    frame_x = (W - frame_w) // 2
    frame_y = H - frame_h - 60
    corner_r = 88
    bezel    = 22

    place_text(canvas, screen, frame_y, W // 2, int(W * 0.063), int(W * 0.033))

    app_img = load_app_img(screen)
    canvas  = composite_device(canvas, app_img, frame_x, frame_y, frame_w, frame_h,
                                corner_r, bezel, shadow_blur=42)

    out = OUT_IPHONE / f"{screen['filename']}.png"
    canvas.save(str(out))
    print(f"  iPhone  {out.name}  ({W}x{H})")
    return out


def gen_ipad(screen):
    W, H = 2048, 2732
    canvas = make_gradient_bg(W, H, screen["grad_top"], screen["grad_bot"])

    frame_w = 1380
    frame_h = int(frame_w * 2732 / 2048)   # iPad比維持 ~1840
    frame_x = (W - frame_w) // 2
    frame_y = H - frame_h - 90
    corner_r = 64
    bezel    = 28

    place_text(canvas, screen, frame_y, W // 2, int(W * 0.055), int(W * 0.030))

    app_img = load_app_img(screen)
    canvas  = composite_device(canvas, app_img, frame_x, frame_y, frame_w, frame_h,
                                corner_r, bezel, shadow_blur=60)

    out = OUT_IPAD / f"{screen['filename']}.png"
    canvas.save(str(out))
    print(f"  iPad    {out.name}  ({W}x{H})")
    return out


def main():
    print("=== TaskBoard v2 スクリーンショット生成 (実機版) ===")
    for sc in SCREENS:
        print(f"\n[{sc['filename']}] {sc['title'].replace(chr(10), ' / ')}  (crop_bottom={sc['crop_bottom']})")
        gen_iphone(sc)
        gen_ipad(sc)
    print("\n完了")


if __name__ == "__main__":
    main()
