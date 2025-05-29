# pip install TikTokApi
# pip install yt-dlp
# yt-dlp "https://www.tiktok.com/@interview0"
# yt-dlp -a urls.txt
# pip install yt-dlp
# yt-dlp "https://www.tiktok.com/@interview0"

from TikTokApi import TikTokApi
import yt-dlp
api = TikTokApi()
user = "tiktok_username"
videos = api.user_posts(user)

for video in videos:
    video_data = api.video(id=video['id'])
    with open(f"{video['id']}.mp4", "wb") as out:
        out.write(video_data)

