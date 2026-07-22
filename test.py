print("测试程序启动...")

try:
    from news_crawler import NewsCrawler
    print("导入爬虫模块成功")
    
    crawler = NewsCrawler()
    print("创建爬虫实例成功")
    
    articles = crawler.crawl_news()
    print(f"获取到 {len(articles)} 篇文章")
    
    if articles:
        print("第一篇文章标题:", articles[0]['title'])
    else:
        print("没有获取到文章")
        
except Exception as e:
    print(f"出错了: {e}")
    import traceback
    traceback.print_exc()
