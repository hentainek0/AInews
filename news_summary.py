import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from collections import defaultdict
import heapq
import re

class NewsSummarizer:
    def __init__(self):
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords', quiet=True)
        
        self.stop_words = set(stopwords.words('english'))
    
    def preprocess_text(self, text):
        text = re.sub(r'\s+', ' ', text).strip()
        sentences = sent_tokenize(text)
        return sentences
    
    def calculate_word_frequencies(self, sentences):
        word_freq = defaultdict(int)
        for sentence in sentences:
            words = word_tokenize(sentence.lower())
            for word in words:
                if word not in self.stop_words and word.isalpha():
                    word_freq[word] += 1
        
        if word_freq:
            max_freq = max(word_freq.values())
            for word in word_freq:
                word_freq[word] /= max_freq
        
        return word_freq
    
    def score_sentences(self, sentences, word_freq):
        sentence_scores = defaultdict(int)
        for sentence in sentences:
            words = word_tokenize(sentence.lower())
            for word in words:
                if word in word_freq:
                    sentence_scores[sentence] += word_freq[word]
            sentence_scores[sentence] /= len(words)
        return sentence_scores
    
    def extract_summary(self, text, num_sentences=3):
        if not text or len(text.strip()) < 50:
            return "Content too short to generate summary"
        
        sentences = self.preprocess_text(text)
        if len(sentences) <= num_sentences:
            return text
        
        word_freq = self.calculate_word_frequencies(sentences)
        sentence_scores = self.score_sentences(sentences, word_freq)
        
        top_sentences = heapq.nlargest(num_sentences, sentence_scores, key=sentence_scores.get)
        top_sentences = sorted(top_sentences, key=lambda x: sentences.index(x))
        
        return ' '.join(top_sentences)
    
    def summarize_articles(self, articles):
        summaries = []
        for article in articles:
            if article and 'content' in article and article['content']:
                summary = self.extract_summary(article['content'])
                summaries.append({
                    'title': article.get('title', ''),
                    'summary': summary,
                    'source': article.get('source', ''),
                    'publish_date': article.get('publish_date', ''),
                    'url': article.get('url', '')
                })
        return summaries

class NewsBriefGenerator:
    def __init__(self):
        self.summarizer = NewsSummarizer()
    
    def generate_brief(self, articles):
        if not articles:
            return "No AI news reports available"
        
        summaries = self.summarizer.summarize_articles(articles)
        
        brief = "# AI News Brief\n\n"
        brief += "## Overview\n"
        brief += f"Collected {len(summaries)} AI-related news articles from various authoritative tech media.\n\n"
        
        brief += "## News Details\n"
        for i, summary in enumerate(summaries, 1):
            brief += f"### {i}. {summary['title']}\n"
            brief += f"**Source**: {summary['source']}\n"
            if summary['publish_date']:
                brief += f"**Publish Date**: {summary['publish_date']}\n"
            brief += f"**Summary**:\n{summary['summary']}\n"
            brief += f"**Link**: [{summary['url']}]({summary['url']})\n\n"
        
        brief += "## Key Focus Areas\n"
        brief += "1. Latest AI technology development trends\n"
        brief += "2. AI applications across various industries\n"
        brief += "3. AI ethics and regulatory topics\n"
        brief += "4. AI strategies of major tech companies\n\n"
        
        brief += "---\n"
        brief += "Generated: Auto-generated\n"
        brief += "Sources: TechCrunch, VentureBeat, ZDNet, MIT Technology Review, etc."
        
        return brief

if __name__ == '__main__':
    sample_article = {
        'title': 'AI Breakthrough in Natural Language Processing',
        'content': 'Recent advances in artificial intelligence have led to significant breakthroughs in natural language processing. Researchers have developed new models that can understand and generate human language with unprecedented accuracy. These models are being applied in various fields including customer service, content creation, and education. The technology is expected to revolutionize how humans interact with machines.',
        'source': 'TechCrunch',
        'publish_date': '2024-01-15',
        'url': 'https://example.com/article'
    }
    
    summarizer = NewsSummarizer()
    summary = summarizer.extract_summary(sample_article['content'])
    print("Summary:", summary)
    
    generator = NewsBriefGenerator()
    brief = generator.generate_brief([sample_article])
    print("\nNews Brief:\n", brief)
