#!/usr/bin/env python3
"""
TaskBoard アイコン生成
青グラデーション背景 + 白のチェックリストアイコン
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
OUT  = Path("/Users/yuotsuka/taskboard/assets/icon.png")

def make():
    img  = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # ---- 背景グラデーション (左上=明 → 右下=暗) ----
    grad = Image.new("RGB", (SIZE, SIZE))
    gd   = ImageDraw.Draw(grad)
    c1   = (0, 140, 255)   # 明るいブルー
    c2   = (0,  62, 180)   # 深いブルー
    for y in range(SIZE):
        t  = y / (SIZE - 1)
        r  = int(c1[0] + (c2[0] - c1[0]) * t)
        g  = int(c1[1] + (c2[1] - c1[1]) * t)
        b  = int(c1[2] + (c2[2] - c1[2]) * t)
        gd.line([(0, y), (SIZE, y)], fill=(r, g, b))

    # 対角方向にも少しグラデーション
    diag = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    dd   = ImageDraw.Draw(diag)
    for x in range(SIZE):
        t  = x / (SIZE - 1)
        a  = int(60 * t)   # 右ほど暗くなるオーバーレイ
        dd.line([(x, 0), (x, SIZE)], fill=(0, 20, 80, a))
    grad_rgba = grad.convert("RGBA")
    grad_rgba.alpha_composite(diag)
    img = grad_rgba

    draw = ImageDraw.Draw(img)

    # ---- カード（白い角丸矩形）----
    pad  = int(SIZE * 0.14)    # 144
    cr   = int(SIZE * 0.11)    # 113 corner radius of card
    card = [pad, pad, SIZE - pad, SIZE - pad]
    draw.rounded_rectangle(card, radius=cr, fill=(255, 255, 255, 255))

    # ---- チェックリスト行 ----
    # 3行: チェック済み2行 + 未完1行
    cx0  = card[0]
    cw   = card[2] - card[0]
    ch   = card[3] - card[1]

    row_h    = int(ch * 0.24)       # 行高さ
    row_gap  = int(ch * 0.04)       # 行間
    total_h  = row_h * 3 + row_gap * 2
    row_y0   = card[1] + (ch - total_h) // 2

    circle_r  = int(row_h * 0.32)
    circle_x  = cx0 + int(cw * 0.14)
    line_x0   = cx0 + int(cw * 0.30)
    line_x1   = cx0 + int(cw * 0.82)
    line_h    = int(row_h * 0.12)
    line_cr   = line_h // 2

    BLUE  = (0, 122, 255)
    GRAY  = (200, 200, 210)
    DARK  = (30, 30, 50)

    ROWS = [
        {"checked": True,  "line_w": 0.70},   # 完了（長い線→打消し線風）
        {"checked": True,  "line_w": 0.50},   # 完了
        {"checked": False, "line_w": 0.65},   # 未完
    ]

    for i, row in enumerate(ROWS):
        y_center = row_y0 + i * (row_h + row_gap) + row_h // 2

        if row["checked"]:
            # 塗りつぶし円 + チェックマーク
            cx = circle_x
            cy = y_center
            r  = circle_r
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLUE)
            # チェックマーク (白)
            ck_w = int(r * 1.1)
            ck_h = int(r * 0.9)
            pts = [
                (cx - r * 0.45, cy),
                (cx - r * 0.05, cy + r * 0.42),
                (cx + r * 0.50, cy - r * 0.38),
            ]
            draw.line(pts, fill=(255, 255, 255), width=max(int(r * 0.28), 3))

            # テキスト行 (少し薄いグレー → 完了感)
            lw = int(cw * row["line_w"])
            ly = y_center - line_h // 2
            draw.rounded_rectangle(
                [line_x0, ly, line_x0 + lw, ly + line_h],
                radius=line_cr, fill=GRAY
            )
        else:
            # 空の円 (未完)
            cx = circle_x
            cy = y_center
            r  = circle_r
            draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                         outline=(190, 190, 200), width=max(int(r * 0.18), 2))

            # テキスト行 (ダーク)
            lw = int(cw * row["line_w"])
            ly = y_center - line_h // 2
            draw.rounded_rectangle(
                [line_x0, ly, line_x0 + lw, ly + line_h],
                radius=line_cr, fill=DARK
            )

    # ---- 軽いシャドウをカードに ----
    # (Pillowではcardにshadowを後付けするのは難しいので省略)

    img = img.convert("RGB")
    img.save(str(OUT), "PNG", optimize=False)
    print(f"アイコン生成完了: {OUT}  ({SIZE}x{SIZE})")


if __name__ == "__main__":
    make()
