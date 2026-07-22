import os
import datetime
from news_crawler import NewsCrawler
from news_summary import NewsBriefGenerator
from push_notifier import PushNotifier

def save_brief_to_file(brief, filename=None):
    if not filename:
        now = datetime.datetime.now()
        filename = "AI_News_Brief_" + now.strftime("%Y%m%d_%H%M%S") + ".md"
    
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(brief)
    
    print("News brief saved to:", filepath)
    return filepath

def main():
    print("=" * 60)
    print("      AI News Crawler and Brief Generator")
    print("=" * 60)
    
    try:
        crawler = NewsCrawler()
        
        print("\nStarting to crawl AI news...")
        articles = crawler.crawl_news()
        
        if not articles:
            print("No news articles found")
            return
        
        print("\nFetching full content...")
        detailed_articles = []
        for article in articles[:8]:
            detailed = crawler.fetch_full_content(article)
            if detailed:
                detailed_articles.append(detailed)
            print("Processed:", len(detailed_articles), "/", min(len(articles), 8))
        
        if not detailed_articles:
            print("No detailed content available")
            return
        
        print("\nGenerating news brief...")
        generator = NewsBriefGenerator()
        brief = generator.generate_brief(detailed_articles)
        
        print("\n" + "=" * 60)
        print("News Brief Preview")
        print("=" * 60)
        print(brief[:2000])
        
        save_brief_to_file(brief)
        
        print("\nStep 5: Sending to mobile...")
        push_config = {
            "wechat_webhook": "",
            "dingtalk_token": "",
            "feishu_webhook": "",
        }
        
        notifier = PushNotifier(push_config)
        
        if push_config["wechat_webhook"] or push_config["dingtalk_token"] or push_config["feishu_webhook"]:
            notifier.send_all(brief)
        else:
            print("提示: 未配置推送方式，如需推送请在 push_config 中填写 webhook 地址")
        
        print("\n" + "=" * 60)
        print("Task completed!")
        print("=" * 60)
        
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
