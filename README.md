
AI新闻爬虫与纪要生成系统

## 项目简介

本项目通过RSS订阅和Python爬虫技术，自动爬取多个权威科技媒体的AI相关新闻报道，并生成新闻纪要文档。

## 功能特点

- 支持多个新闻源：TechCrunch、MIT Technology Review、Reuters、CNN Tech、BBC News
- 自动获取新闻文章详细内容
- 智能摘要生成
- 生成Markdown和Word格式的新闻纪要
- 自动去重机制

## 技术栈

- Python 3.x
- requests - HTTP请求
- beautifulsoup4 - HTML解析
- newspaper3k - 文章内容提取
- nltk - 自然语言处理
- python-docx - Word文档生成

## 安装步骤

1. 进入项目目录：
```bash
cd news
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

## 使用方法

运行主程序：
```bash
python main.py
```

程序会自动：
1. 爬取多个新闻源的AI相关新闻
2. 获取文章详细内容
3. 生成新闻摘要
4. 输出新闻纪要到Markdown和Word文件

## 项目结构

```
news/
├── news_crawler.py    # 新闻爬虫模块
├── news_summary.py    # 新闻摘要模块
├── main.py            # 主程序
├── requirements.txt   # 依赖列表
└── README.md          # 项目说明
```

## 输出文件

- `AI新闻纪要_YYYYMMDD_HHMMSS.md` - Markdown格式新闻纪要
- `AI新闻纪要_YYYYMMDD_HHMMSS.docx` - Word格式新闻纪要

## 注意事项

1. 爬虫遵循robots.txt协议，设置了合理的请求间隔
2. 建议不要频繁运行，以免对目标网站造成压力
3. 部分网站可能需要更新解析规则
