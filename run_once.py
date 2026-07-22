import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from simple_main import crawl_ai_news, generate_brief, PushNotifier

def main():
    print("=" * 60)
    print("      AI News Crawler and Brief Generator")
    print("=" * 60)
    
    try:
        print("\nStep 1: Crawling AI news articles...")
        articles = crawl_ai_news()
        print(f"Found {len(articles)} articles")
        
        if not articles:
            print("No articles found")
            return
        
        print("\nStep 2: Generating news brief (translating to Chinese)...")
        brief = generate_brief(articles[:5])
        
        print("\nStep 3: Saving news brief...")
        filename = "AI_News_Brief_" + time.strftime("%Y%m%d_%H%M%S") + ".md"
        filepath = os.path.join(os.path.dirname(__file__), filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(brief)
        print(f"News brief saved to: {filepath}")
        
        print("\nStep 4: Sending to mobile...")
        push_config = {
            "wechat_webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=c067f16e-9b8c-4dbb-b6b3-b4c2f948c02f",
            "dingtalk_token": "",
            "feishu_webhook": "",
        }
        notifier = PushNotifier(push_config)
        
        if push_config["wechat_webhook"] or push_config["dingtalk_token"] or push_config["feishu_webhook"]:
            notifier.send_all(brief)
        else:
            print("No push config")
        
        print("\n" + "=" * 60)
        print("Task completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    import time
    main()