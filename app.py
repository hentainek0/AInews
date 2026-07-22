from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os
import json
import re
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from simple_main import crawl_ai_news, generate_brief
from push_notifier import PushNotifier

app = Flask(__name__)
CORS(app)

NEWS_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
os.makedirs(NEWS_DATA_DIR, exist_ok=True)

CONFIG_FILE = os.path.join(NEWS_DATA_DIR, 'config.json')
SCHEDULE_FILE = os.path.join(NEWS_DATA_DIR, 'schedule.json')
ARTICLES_FILE = os.path.join(NEWS_DATA_DIR, 'articles.json')

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'wechat_webhook': '',
        'dingtalk_token': '',
        'feishu_webhook': '',
        'rss_sources': [
            {'name': 'TechCrunch AI', 'url': 'https://techcrunch.com/tag/ai/feed/'},
            {'name': 'VentureBeat AI', 'url': 'https://venturebeat.com/category/ai/feed/'}
        ],
        'article_count': 5,
        'auto_translate': True
    }

def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

def load_schedule():
    if os.path.exists(SCHEDULE_FILE):
        with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'times': ['09:00', '18:00'],
        'enabled': True,
        'last_run': '',
        'next_run': ''
    }

def save_schedule(schedule):
    with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
        json.dump(schedule, f, indent=2, ensure_ascii=False)

def load_articles():
    if os.path.exists(ARTICLES_FILE):
        with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_articles(articles):
    with open(ARTICLES_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)

@app.route('/api/news', methods=['GET'])
def get_news():
    articles = load_articles()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    source = request.args.get('source')
    keyword = request.args.get('keyword')
    
    filtered = articles
    if source:
        filtered = [a for a in filtered if a['source'] == source]
    if keyword:
        keyword = keyword.lower()
        filtered = [a for a in filtered if keyword in a['title'].lower() or keyword in a['title_zh'].lower()]
    
    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    
    return jsonify({
        'status': 'success',
        'data': filtered[start:end],
        'total': total,
        'page': page,
        'limit': limit
    })

@app.route('/api/news', methods=['POST'])
def crawl_and_save_news():
    try:
        config = load_config()
        articles = crawl_ai_news()
        
        translated_articles = []
        for i, article in enumerate(articles):
            article_id = f"{datetime.now().strftime('%Y%m%d')}_{str(i+1).zfill(3)}"
            translated_articles.append({
                'id': article_id,
                'title': article['title'],
                'title_zh': article.get('title_zh', article['title']),
                'link': article['link'],
                'summary': article['content'][:200],
                'summary_zh': article.get('summary_zh', article['content'][:200]),
                'content': article['content'],
                'source': article['source'],
                'date': article.get('date') or datetime.now().strftime('%Y-%m-%d'),
                'tags': extract_tags(article['title']),
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        existing = load_articles()
        all_articles = translated_articles + existing
        save_articles(all_articles[:100])
        
        brief = generate_brief(articles[:config.get('article_count', 5)])
        
        if config.get('wechat_webhook') or config.get('dingtalk_token') or config.get('feishu_webhook'):
            notifier = PushNotifier(config)
            notifier.send_all(brief)
        
        schedule = load_schedule()
        schedule['last_run'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        save_schedule(schedule)
        
        return jsonify({
            'status': 'success',
            'message': f'Successfully crawled {len(articles)} articles',
            'count': len(articles)
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/news/<article_id>', methods=['DELETE'])
def delete_news(article_id):
    articles = load_articles()
    articles = [a for a in articles if a['id'] != article_id]
    save_articles(articles)
    return jsonify({'status': 'success', 'message': 'Article deleted'})

@app.route('/api/analytics/stats', methods=['GET'])
def get_stats():
    articles = load_articles()
    
    today = datetime.now().strftime('%Y-%m-%d')
    today_count = sum(1 for a in articles if a['date'] == today)
    
    source_distribution = {}
    for a in articles:
        source_distribution[a['source']] = source_distribution.get(a['source'], 0) + 1
    
    keywords = {}
    for a in articles:
        for tag in a.get('tags', []):
            keywords[tag] = keywords.get(tag, 0) + 1
        words = re.findall(r'\b[A-Za-z]{3,}\b', a['title'].lower())
        for word in words:
            if word not in {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'your', 'this', 'with', 'will', 'what', 'when', 'have', 'has', 'had', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'of', 'in', 'to', 'at', 'on', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'or'}:
                keywords[word] = keywords.get(word, 0) + 1
    
    top_keywords = sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:10]
    
    week_trend = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        count = sum(1 for a in articles if a['date'] == date)
        week_trend.append({'date': date, 'count': count})
    week_trend = week_trend[::-1]
    
    return jsonify({
        'status': 'success',
        'data': {
            'total_count': len(articles),
            'today_count': today_count,
            'week_trend': week_trend,
            'source_distribution': [{'name': k, 'count': v} for k, v in source_distribution.items()],
            'top_keywords': [{'word': k, 'count': v} for k, v in top_keywords]
        }
    })

@app.route('/api/config', methods=['GET'])
def get_config():
    config = load_config()
    return jsonify({'status': 'success', 'data': config})

@app.route('/api/config', methods=['PUT'])
def update_config():
    data = request.get_json()
    config = load_config()
    config.update(data)
    save_config(config)
    return jsonify({'status': 'success', 'message': 'Config updated'})

@app.route('/api/config/push', methods=['POST'])
def test_push():
    data = request.get_json()
    notifier = PushNotifier(data)
    result = notifier.send_all('测试推送：AI新闻爬虫系统')
    return jsonify({'status': 'success' if result else 'error', 'message': '推送测试完成'})

@app.route('/api/config/schedule', methods=['GET'])
def get_schedule():
    schedule = load_schedule()
    return jsonify({'status': 'success', 'data': schedule})

@app.route('/api/config/schedule', methods=['PUT'])
def update_schedule():
    data = request.get_json()
    schedule = load_schedule()
    schedule.update(data)
    save_schedule(schedule)
    return jsonify({'status': 'success', 'message': 'Schedule updated'})

def extract_tags(title):
    keywords = ['AI', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Neural Network', 'GPT', 'LLM', 'Chatbot', 'Automation', 'Robotics', 'Computer Vision', 'Natural Language', 'NLP', 'Data Science', 'Big Data', 'Cloud', 'Algorithm']
    tags = []
    for kw in keywords:
        if kw.lower() in title.lower():
            tags.append(kw)
    return tags[:3]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)