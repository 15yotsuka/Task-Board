#!/usr/bin/env python3
"""
TaskBoard プロモスクリーンショット生成スクリプト
iPhone 6.7" (1290x2796) 用 x 4 枚
"""
import os
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ---- 出力先 ----
OUT_DIR = Path("/Users/yuotsuka/taskboard/screenshots/final")
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1290, 2796

# ---- フォント ----
FONT_HIRAGINO_W6 = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"
FONT_HIRAGINO_W3 = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"

def font(size, bold=True):
    path = FONT_HIRAGINO_W6 if bold else FONT_HIRAGINO_W3
    return ImageFont.truetype(path, size)

# ---- カラー定数 ----
PRIMARY    = (0, 122, 255)      # iOS Blue #007AFF
SECONDARY  = (52, 199, 89)     # iOS Green
DANGER     = (255, 59, 48)     # iOS Red
WARNING    = (255, 149, 0)     # iOS Orange
BG_LIGHT   = (242, 242, 247)   # #F2F2F7
BG_DARK    = (0, 0, 0)
CARD_LIGHT = (255, 255, 255)
CARD_DARK  = (28, 28, 30)
TEXT_LIGHT = (0, 0, 0)
TEXT_DARK  = (255, 255, 255)
TEXT_SEC   = (142, 142, 147)   # iOS secondary label

# ---- ユーティリティ ----
def rounded_rect(draw, xy, radius, fill, outline=None, outline_width=2):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=outline_width)

def draw_gradient_overlay(img, color_top, color_bottom, y_start, y_end):
    """img に縦グラデーションを合成する（alpha あり）"""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    height = y_end - y_start
    r1, g1, b1 = color_top[:3]
    r2, g2, b2 = color_bottom[:3]
    a1 = color_top[3] if len(color_top) == 4 else 220
    a2 = color_bottom[3] if len(color_bottom) == 4 else 0
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(r1 + (r2 - r1) * t)
        g = int(g1 + (g2 - g1) * t)
        b = int(b1 + (b2 - b1) * t)
        a = int(a1 + (a2 - a1) * t)
        d.line([(0, y_start + y), (img.width, y_start + y)], fill=(r, g, b, a))
    img_rgba = img.convert("RGBA")
    img_rgba.alpha_composite(overlay)
    return img_rgba.convert("RGB")

def draw_centered_text(draw, text, y, font_obj, color, width=W):
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    draw.text((x, y), text, font=font_obj, fill=color)

def draw_badge(draw, text, x, y, bg_color, text_color=(255,255,255), radius=22, pad_x=24, pad_y=10):
    f = font(36)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    bx0, by0 = x, y
    bx1, by1 = x + tw + pad_x * 2, y + th + pad_y * 2
    rounded_rect(draw, [bx0, by0, bx1, by1], radius, bg_color)
    draw.text((bx0 + pad_x, by0 + pad_y - bbox[1]), text, font=f, fill=text_color)
    return bx1

def draw_checkmark(draw, x, y, checked, size=56, color=PRIMARY):
    draw.ellipse([x, y, x+size, y+size], outline=color if not checked else None,
                 fill=color if checked else None, width=4)
    if checked:
        # checkmark
        pts = [(x+12, y+size//2), (x+size//2-4, y+size-16), (x+size-10, y+16)]
        draw.line(pts, fill=(255,255,255), width=5)

def draw_status_bar(draw, is_dark=True):
    """ステータスバー領域を背景色で塗りつぶし（時刻・アイコン除去）"""
    bg = (0, 0, 0) if is_dark else (242, 242, 247)
    draw.rectangle([0, 0, W, 160], fill=bg)


# ======================================================================
# FRAME 1: ホーム画面（ダーク）- カレンダー月表示 + 今日のタスク
# ======================================================================
def generate_frame1():
    img = Image.new("RGB", (W, H), BG_DARK)
    draw = ImageDraw.Draw(img)

    # ---- 背景グラデーション（上部）----
    for y in range(600):
        t = y / 599
        r = int(0 + 10 * t)
        g = int(0 + 5 * t)
        b = int(30 + 20 * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # ---- ステータスバー除去 ----
    draw_status_bar(draw, is_dark=True)

    # ---- ナビゲーションバー ----
    f_nav = font(72)
    draw.text((80, 180), "TaskBoard", font=f_nav, fill=TEXT_DARK)

    f_date = font(46, bold=False)
    draw.text((80, 270), "2025年3月", font=font(52, bold=False), fill=TEXT_SEC)

    # ---- カレンダーグリッド ----
    cal_top = 370
    cal_left = 60
    cell_w = (W - 120) // 7
    cell_h = 130

    # 曜日ヘッダー
    days_jp = ["日", "月", "火", "水", "木", "金", "土"]
    f_weekday = font(46, bold=False)
    for i, d in enumerate(days_jp):
        cx = cal_left + i * cell_w + cell_w // 2
        color = DANGER if i == 0 else (PRIMARY if i == 6 else TEXT_SEC)
        bbox = draw.textbbox((0, 0), d, font=f_weekday)
        draw.text((cx - (bbox[2]-bbox[0])//2, cal_top), d, font=f_weekday, fill=color)

    # カレンダーの日付（3月、1日が土曜日）
    cal_data = [
        [None, None, None, None, None, None, 1],
        [2, 3, 4, 5, 6, 7, 8],
        [9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22],
        [23, 24, 25, 26, 27, 28, 29],
        [30, 31, None, None, None, None, None],
    ]

    today = 21
    task_days = {3, 7, 10, 14, 18, 21, 25, 28}

    f_day = font(54)
    f_day_s = font(46, bold=False)
    for row, week in enumerate(cal_data):
        for col, day in enumerate(week):
            if day is None:
                continue
            cx = cal_left + col * cell_w + cell_w // 2
            cy = cal_top + 90 + row * cell_h

            if day == today:
                # 今日: 青い円
                draw.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], fill=PRIMARY)
                draw.text((cx - 22, cy - 30), str(day), font=f_day, fill=(255,255,255))
            else:
                color = DANGER if col == 0 else (PRIMARY if col == 6 else TEXT_DARK)
                tw_bbox = draw.textbbox((0, 0), str(day), font=f_day_s)
                draw.text((cx - (tw_bbox[2]-tw_bbox[0])//2, cy - 28), str(day),
                          font=f_day_s, fill=color)

            # タスクドット
            if day in task_days and day != today:
                draw.ellipse([cx - 8, cy + 36, cx + 8, cy + 52], fill=PRIMARY)

    # ---- 今日のタスクセクション ----
    sec_y = cal_top + 90 + 6 * cell_h + 40
    f_sec = font(56)
    draw.text((80, sec_y), "今日のタスク", font=f_sec, fill=TEXT_DARK)

    tasks = [
        ("デザインレビュー", "10:00", True, PRIMARY),
        ("週次ミーティング", "14:00", True, SECONDARY),
        ("リリースノート作成", "17:00", False, WARNING),
        ("コードレビュー", "終日", False, DANGER),
    ]

    card_y = sec_y + 90
    for i, (title, time_str, done, color) in enumerate(tasks):
        card_x = 60
        card_w = W - 120
        card_h = 140

        # カード背景
        rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h],
                     24, CARD_DARK)

        # 左アクセントバー
        draw.rounded_rectangle([card_x, card_y + 20, card_x + 8, card_y + card_h - 20],
                                radius=4, fill=color)

        # チェックボックス
        ck_x, ck_y = card_x + 30, card_y + card_h // 2 - 28
        draw_checkmark(draw, ck_x, ck_y, done, size=56, color=color)

        # タイトル
        f_task = font(52, bold=not done)
        title_color = TEXT_SEC if done else TEXT_DARK
        draw.text((card_x + 120, card_y + 28), title, font=f_task, fill=title_color)

        # 時刻
        f_time = font(40, bold=False)
        draw.text((card_x + 120, card_y + 86), time_str, font=f_time, fill=TEXT_SEC)

        card_y += card_h + 20

    # ---- 広告バナー領域除去（下部）----
    draw.rectangle([0, H - 200, W, H], fill=BG_DARK)

    # ---- グラデーションオーバーレイ + テキスト ----
    img = draw_gradient_overlay(img,
                                 color_top=(0, 0, 0, 0),
                                 color_bottom=(0, 50, 120, 200),
                                 y_start=H - 600, y_end=H - 200)
    draw2 = ImageDraw.Draw(img)

    # キャッチコピー
    f_catch = font(100)
    f_sub   = font(56, bold=False)
    draw_centered_text(draw2, "タスクを、シンプルに。", H - 500, f_catch, (255,255,255))
    draw_centered_text(draw2, "カレンダーとタスクを一画面で管理", H - 370, f_sub, (200, 220, 255))

    out_path = OUT_DIR / "ss1_home_dark.png"
    img.save(out_path)
    print(f"  Saved: {out_path}")
    return str(out_path)


# ======================================================================
# FRAME 2: タスク一覧画面（ライト）- セクション分け + 優先度バッジ
# ======================================================================
def generate_frame2():
    img = Image.new("RGB", (W, H), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    # ---- ステータスバー除去 ----
    draw_status_bar(draw, is_dark=False)

    # ---- ナビゲーションバー ----
    draw.rectangle([0, 0, W, 200], fill=CARD_LIGHT)
    f_nav = font(72)
    draw.text((80, 100), "すべてのタスク", font=f_nav, fill=TEXT_LIGHT)

    # 区切り線
    draw.line([(0, 200), (W, 200)], fill=(210, 210, 215), width=2)

    # ---- セクション: 今日 ----
    y = 240
    f_sec = font(52, bold=False)
    draw.text((80, y), "今日", font=f_sec, fill=TEXT_SEC)
    y += 80

    today_tasks = [
        ("デザインレビュー", "高", DANGER, True),
        ("週次ミーティング", "中", WARNING, False),
        ("リリースノート作成", "低", SECONDARY, False),
    ]

    for title, priority, color, done in today_tasks:
        # カード
        rounded_rect(draw, [60, y, W-60, y+140], 24, CARD_LIGHT)

        # チェック
        draw_checkmark(draw, 90, y+42, done, size=56, color=color)

        # タイトル
        f_t = font(54, bold=not done)
        tc = TEXT_SEC if done else TEXT_LIGHT
        draw.text((170, y+28), title, font=f_t, fill=tc)

        # 優先度バッジ
        draw_badge(draw, priority, W - 220, y + 44, color)

        y += 160

    # ---- セクション: 今週 ----
    y += 20
    draw.text((80, y), "今週", font=f_sec, fill=TEXT_SEC)
    y += 80

    week_tasks = [
        ("APIインテグレーション", "高", DANGER, False),
        ("UIテスト", "中", WARNING, False),
        ("ドキュメント更新", "低", SECONDARY, False),
        ("パフォーマンス改善", "高", DANGER, False),
    ]

    for title, priority, color, done in week_tasks:
        rounded_rect(draw, [60, y, W-60, y+140], 24, CARD_LIGHT)
        draw_checkmark(draw, 90, y+42, done, size=56, color=color)
        f_t = font(54)
        draw.text((170, y+28), title, font=f_t, fill=TEXT_LIGHT)
        draw_badge(draw, priority, W - 220, y + 44, color)
        y += 160

    # ---- セクション: 今月 ----
    y += 20
    draw.text((80, y), "今月", font=f_sec, fill=TEXT_SEC)
    y += 80

    month_tasks = [
        ("四半期レビュー準備", "高", DANGER, False),
        ("採用面接", "中", WARNING, False),
    ]
    for title, priority, color, done in month_tasks:
        rounded_rect(draw, [60, y, W-60, y+140], 24, CARD_LIGHT)
        draw_checkmark(draw, 90, y+42, done, size=56, color=color)
        f_t = font(54)
        draw.text((170, y+28), title, font=f_t, fill=TEXT_LIGHT)
        draw_badge(draw, priority, W - 220, y + 44, color)
        y += 160

    # ---- 広告バナー領域除去 ----
    draw.rectangle([0, H - 200, W, H], fill=BG_LIGHT)

    # ---- グラデーション + キャッチコピー ----
    img = draw_gradient_overlay(img,
                                 color_top=(0, 0, 0, 0),
                                 color_bottom=(0, 80, 180, 210),
                                 y_start=H - 550, y_end=H - 200)
    draw2 = ImageDraw.Draw(img)

    f_catch = font(96)
    f_sub   = font(54, bold=False)
    draw_centered_text(draw2, "期限を見える化しよう", H - 480, f_catch, (255,255,255))
    draw_centered_text(draw2, "優先度別にタスクを整理して管理", H - 350, f_sub, (200, 225, 255))

    out_path = OUT_DIR / "ss2_tasklist_light.png"
    img.save(out_path)
    print(f"  Saved: {out_path}")
    return str(out_path)


# ======================================================================
# FRAME 3: カレンダー画面（ダーク）- 月カレンダー + イベントリスト
# ======================================================================
def generate_frame3():
    img = Image.new("RGB", (W, H), (10, 10, 20))
    draw = ImageDraw.Draw(img)

    # 背景グラデーション
    for y_i in range(H):
        t = y_i / (H - 1)
        r = int(10 + 15 * t)
        g = int(10 + 10 * t)
        b = int(20 + 30 * t)
        draw.line([(0, y_i), (W, y_i)], fill=(r, g, b))

    # ステータスバー除去
    draw_status_bar(draw, is_dark=True)

    # ナビゲーション
    f_nav = font(72)
    draw.text((80, 180), "カレンダー", font=f_nav, fill=TEXT_DARK)

    # 月ナビゲーション
    f_month = font(60)
    draw.text((80, 290), "< 2025年3月 >", font=f_month, fill=PRIMARY)

    # 曜日ヘッダー
    cal_top = 400
    cal_left = 40
    cell_w = (W - 80) // 7
    cell_h = 160

    days_jp = ["日", "月", "火", "水", "木", "金", "土"]
    f_weekday = font(44, bold=False)
    for i, d in enumerate(days_jp):
        cx = cal_left + i * cell_w + cell_w // 2
        color = DANGER if i == 0 else (PRIMARY if i == 6 else TEXT_SEC)
        bbox = draw.textbbox((0, 0), d, font=f_weekday)
        draw.text((cx - (bbox[2]-bbox[0])//2, cal_top), d, font=f_weekday, fill=color)

    cal_data = [
        [None, None, None, None, None, None, 1],
        [2, 3, 4, 5, 6, 7, 8],
        [9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22],
        [23, 24, 25, 26, 27, 28, 29],
        [30, 31, None, None, None, None, None],
    ]
    today = 21

    # イベントのある日 (カラードット)
    event_days = {
        3: [PRIMARY],
        7: [SECONDARY, WARNING],
        10: [PRIMARY],
        14: [DANGER],
        18: [SECONDARY],
        21: [PRIMARY, SECONDARY, DANGER],
        25: [WARNING],
        28: [PRIMARY, SECONDARY],
    }

    f_day = font(52)
    f_day_s = font(46, bold=False)
    for row, week in enumerate(cal_data):
        for col, day in enumerate(week):
            if day is None:
                continue
            cx = cal_left + col * cell_w + cell_w // 2
            cy = cal_top + 80 + row * cell_h

            if day == today:
                draw.ellipse([cx - 42, cy - 36, cx + 42, cy + 36], fill=PRIMARY)
                tw_bbox = draw.textbbox((0, 0), str(day), font=f_day)
                draw.text((cx - (tw_bbox[2]-tw_bbox[0])//2, cy - 28),
                          str(day), font=f_day, fill=(255,255,255))
            else:
                color = DANGER if col == 0 else (PRIMARY if col == 6 else TEXT_DARK)
                tw_bbox = draw.textbbox((0, 0), str(day), font=f_day_s)
                draw.text((cx - (tw_bbox[2]-tw_bbox[0])//2, cy - 28),
                          str(day), font=f_day_s, fill=color)

            # カラードット
            if day in event_days:
                dots = event_days[day]
                dot_size = 12
                total_w = len(dots) * dot_size + (len(dots)-1) * 6
                dx = cx - total_w // 2
                for dc in dots:
                    draw.ellipse([dx, cy + 42, dx + dot_size, cy + 42 + dot_size], fill=dc)
                    dx += dot_size + 6

    # ---- 今日のスケジュールリスト ----
    list_y = cal_top + 80 + 6 * cell_h + 30
    f_sec = font(52, bold=False)
    draw.text((80, list_y), "3月21日のスケジュール", font=f_sec, fill=TEXT_SEC)
    list_y += 80

    events = [
        ("09:00", "スタンドアップMTG", PRIMARY, 45),
        ("11:00", "UIデザインレビュー", WARNING, 90),
        ("14:00", "スプリントレトロ", SECONDARY, 60),
        ("17:00", "リリース準備", DANGER, 120),
    ]

    for time_str, title, color, duration in events:
        # イベントカード
        ev_h = max(120, int(duration * 1.2))
        rounded_rect(draw, [60, list_y, W-60, list_y + ev_h], 20, CARD_DARK)
        # 左バー
        draw.rounded_rectangle([60, list_y+10, 68, list_y + ev_h - 10], radius=4, fill=color)
        # 時刻
        f_time = font(44, bold=False)
        draw.text((90, list_y + 18), time_str, font=f_time, fill=TEXT_SEC)
        # タイトル
        f_ev = font(52)
        draw.text((90, list_y + 60), title, font=f_ev, fill=TEXT_DARK)

        list_y += ev_h + 18

    # 広告除去
    draw.rectangle([0, H - 200, W, H], fill=(10, 10, 20))

    # グラデーション + テキスト
    img = draw_gradient_overlay(img,
                                 color_top=(0, 0, 0, 0),
                                 color_bottom=(0, 40, 100, 200),
                                 y_start=H - 600, y_end=H - 200)
    draw2 = ImageDraw.Draw(img)

    f_catch = font(96)
    f_sub   = font(54, bold=False)
    draw_centered_text(draw2, "カレンダーで一目把握", H - 500, f_catch, (255,255,255))
    draw_centered_text(draw2, "日程とタスクをまとめて確認", H - 360, f_sub, (200, 220, 255))

    out_path = OUT_DIR / "ss3_calendar_dark.png"
    img.save(out_path)
    print(f"  Saved: {out_path}")
    return str(out_path)


# ======================================================================
# FRAME 4: 設定画面（ライト）- テーマ切替、言語、グループ管理
# ======================================================================
def generate_frame4():
    img = Image.new("RGB", (W, H), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    # ステータスバー除去
    draw_status_bar(draw, is_dark=False)

    # ナビゲーション
    draw.rectangle([0, 0, W, 200], fill=CARD_LIGHT)
    f_nav = font(72)
    draw.text((80, 100), "設定", font=f_nav, fill=TEXT_LIGHT)
    draw.line([(0, 200), (W, 200)], fill=(210,210,215), width=2)

    y = 260

    def draw_settings_section(title, items, y):
        f_sec_label = font(46, bold=False)
        draw.text((80, y), title, font=f_sec_label, fill=TEXT_SEC)
        y += 70

        for item in items:
            rounded_rect(draw, [60, y, W-60, y+130], 0, CARD_LIGHT)
            draw.line([(60, y), (W-60, y)], fill=(230,230,235), width=1)

            f_item = font(54)
            draw.text((100, y+36), item["label"], font=f_item, fill=TEXT_LIGHT)

            if "value" in item:
                f_val = font(50, bold=False)
                vbbox = draw.textbbox((0, 0), item["value"], font=f_val)
                vw = vbbox[2] - vbbox[0]
                draw.text((W - 100 - vw - 50, y+40), item["value"], font=f_val, fill=TEXT_SEC)
                # シェブロン
                cx, cy2 = W - 100, y + 65
                draw.line([(cx-20, cy2-20), (cx, cy2), (cx-20, cy2+20)], fill=TEXT_SEC, width=5)

            elif "toggle" in item:
                # トグルスイッチ
                tx = W - 180
                ty = y + 40
                tw2, th = 120, 52
                tog_on = item["toggle"]
                bg_col = PRIMARY if tog_on else (180, 180, 185)
                draw.rounded_rectangle([tx, ty, tx+tw2, ty+th], radius=th//2, fill=bg_col)
                cx2 = tx + tw2 - th//2 if tog_on else tx + th//2
                draw.ellipse([cx2 - 22, ty + 4, cx2 + 22, ty + th - 4], fill=(255,255,255))

            y += 130

        draw.line([(60, y), (W-60, y)], fill=(230,230,235), width=1)
        # 最後の行の底線
        rounded_rect(draw, [60, y, W-60, y+1], 0, (230,230,235))
        return y + 40

    # ---- 外観 ----
    y = draw_settings_section("外観", [
        {"label": "テーマ", "value": "システム"},
        {"label": "ダークモード", "toggle": False},
        {"label": "アクセントカラー", "value": "ブルー"},
    ], y)

    y += 20

    # ---- 言語・地域 ----
    y = draw_settings_section("言語・地域", [
        {"label": "言語", "value": "日本語"},
        {"label": "週の開始", "value": "日曜日"},
        {"label": "時刻フォーマット", "value": "24時間"},
    ], y)

    y += 20

    # ---- グループ管理 ----
    f_sec_label = font(46, bold=False)
    draw.text((80, y), "グループ管理", font=f_sec_label, fill=TEXT_SEC)
    y += 70

    groups = [
        ("仕事", PRIMARY, 12),
        ("個人", SECONDARY, 5),
        ("買い物", WARNING, 3),
        ("勉強", (142, 68, 173), 8),
    ]

    for gname, gcolor, count in groups:
        rounded_rect(draw, [60, y, W-60, y+130], 0, CARD_LIGHT)
        draw.line([(60, y), (W-60, y)], fill=(230,230,235), width=1)

        # カラーサークル
        draw.ellipse([100, y+37, 156, y+93], fill=gcolor)

        # グループ名（サークルの右）
        draw.text((176, y+38), gname, font=font(54), fill=TEXT_LIGHT)

        # タスク数
        f_cnt = font(50, bold=False)
        cnt_str = f"{count}件"
        cb = draw.textbbox((0,0), cnt_str, font=f_cnt)
        draw.text((W - 100 - (cb[2]-cb[0]) - 50, y+40), cnt_str, font=f_cnt, fill=TEXT_SEC)
        cx3, cy3 = W-100, y+65
        draw.line([(cx3-20, cy3-20), (cx3, cy3), (cx3-20, cy3+20)], fill=TEXT_SEC, width=5)
        y += 130

    draw.line([(60, y), (W-60, y)], fill=(230,230,235), width=1)

    # 広告除去
    draw.rectangle([0, H - 200, W, H], fill=BG_LIGHT)

    # グラデーション + テキスト
    img = draw_gradient_overlay(img,
                                 color_top=(0, 0, 0, 0),
                                 color_bottom=(0, 80, 200, 210),
                                 y_start=H - 560, y_end=H - 200)
    draw2 = ImageDraw.Draw(img)

    f_catch = font(96)
    f_sub   = font(54, bold=False)
    draw_centered_text(draw2, "自分好みにカスタマイズ", H - 490, f_catch, (255,255,255))
    draw_centered_text(draw2, "テーマ・言語・グループを自由に設定", H - 360, f_sub, (200,225,255))

    out_path = OUT_DIR / "ss4_settings_light.png"
    img.save(out_path)
    print(f"  Saved: {out_path}")
    return str(out_path)


# ======================================================================
# メイン
# ======================================================================
if __name__ == "__main__":
    print("=== TaskBoard プロモスクリーンショット生成 ===")
    paths = []
    print("\n[1/4] ホーム画面（ダーク）")
    paths.append(generate_frame1())
    print("\n[2/4] タスク一覧（ライト）")
    paths.append(generate_frame2())
    print("\n[3/4] カレンダー（ダーク）")
    paths.append(generate_frame3())
    print("\n[4/4] 設定画面（ライト）")
    paths.append(generate_frame4())

    print(f"\n完了: {len(paths)} 枚生成")
    for p in paths:
        from PIL import Image as _Im
        im = _Im.open(p)
        print(f"  {p} — {im.size}")
