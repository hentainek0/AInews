import os
import datetime
from news_crawler import NewsCrawler
from news_summary import NewsBriefGenerator

print("Step 1: Initializing crawler...")
crawler = NewsCrawler()

print("\nStep 2: Crawling news...")
articles = crawler.crawl_news()
print(f"Found {len(articles)} articles")

if articles:
    print("\nStep 3: Fetching detailed content...")
    detailed_articles = []
    for i, article in enumerate(articles[:5]):
        detailed = crawler.fetch_full_content(article)
        if detailed:
            detailed_articles.append(detailed)
            print(f"  Processed {i+1}: {article['title'][:30]}...")
    
    print("\nStep 4: Generating brief...")
    generator = NewsBriefGenerator()
    brief = generator.generate_brief(detailed_articles)
    
    print("\nStep 5: Saving brief...")
    filename = "AI_News_Brief_" + datetime.datetime.now().strftime("%Y%m%d_%H%M%S") + ".md"
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(brief)
    print(f"Saved to: {filepath}")
    
    print("\nBrief preview:")
    print("=" * 50)
    print(brief[:1000])
else:
    print("No articles found!")
