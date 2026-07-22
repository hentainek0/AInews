import time
import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from simple_main import crawl_ai_news, generate_brief, PushNotifier

def run_news_task():
    print("=" * 60)
    print("      AI News Crawler and Brief Generator")
    print("=" * 60)
    
    try:
        print("\nStep 1: Crawling AI news articles...")
        articles = crawl_ai_news()
        print(f"Found {len(articles)} articles")
        
        if not articles:
            print("No articles found, skipping this run")
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
            print("No push config, skipping push")
        
        print("\n" + "=" * 60)
        print("Task completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def get_next_run_time(target_times):
    now = datetime.datetime.now()
    today = now.date()
    
    for target_time_str in target_times:
        target_time = datetime.datetime.strptime(target_time_str, "%H:%M").time()
        target_datetime = datetime.datetime.combine(today, target_time)
        
        if target_datetime > now:
            return target_datetime
    
    first_time = datetime.datetime.strptime(target_times[0], "%H:%M").time()
    next_day = today + datetime.timedelta(days=1)
    return datetime.datetime.combine(next_day, first_time)

def main():
    print("News Scheduler Started")
    print("Press Ctrl+C to stop")
    
    schedule_times = ["09:00", "18:00"]
    
    print("\nScheduled times:")
    for t in schedule_times:
        print(f"  - 每天 {t}")
    
    run_news_task()
    
    while True:
        try:
            next_run = get_next_run_time(schedule_times)
            wait_seconds = (next_run - datetime.datetime.now()).total_seconds()
            
            print(f"\nNext run: {next_run.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"Waiting {int(wait_seconds // 3600)} hours {int((wait_seconds % 3600) // 60)} minutes...")
            
            for _ in range(int(wait_seconds)):
                time.sleep(1)
            
            run_news_task()
            
        except KeyboardInterrupt:
            print("\nScheduler stopped by user")
            break
        except Exception as e:
            print(f"Scheduler error: {e}")
            time.sleep(60)

if __name__ == '__main__':
    main()