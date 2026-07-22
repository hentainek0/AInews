import requests
import json

class PushNotifier:
    def __init__(self, config=None):
        self.config = config or {}
    
    def send_wechat(self, content, webhook_url=None):
        url = webhook_url or self.config.get('wechat_webhook')
        if not url:
            print("企业微信 webhook 未配置")
            return False
        
        if not url.startswith('https'):
            url = f"https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key={url}"
        
        if 'work.weixin.qq.com' in url:
            print(f"警告: 当前配置的地址不是有效的 webhook 地址，请使用 https://qyapi.weixin.qq.com 开头的地址")
            return False
        
        try:
            data = {
                "msgtype": "markdown",
                "markdown": {
                    "content": content[:4096]
                }
            }
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)
            result = response.json()
            if result.get('errcode') == 0:
                print("企业微信推送成功")
                return True
            else:
                print(f"企业微信推送失败: {result.get('errmsg')}")
                return False
        except Exception as e:
            print(f"企业微信推送异常: {e}")
            return False
    
    def send_dingtalk(self, content, access_token=None):
        url = access_token or self.config.get('dingtalk_token')
        if not url:
            print("钉钉 access_token 未配置")
            return False
        
        if not url.startswith('https'):
            url = f"https://oapi.dingtalk.com/robot/send?access_token={url}"
        
        try:
            data = {
                "msgtype": "markdown",
                "markdown": {
                    "title": "AI 新闻简报",
                    "text": content[:4096]
                }
            }
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)
            result = response.json()
            if result.get('errcode') == 0:
                print("钉钉推送成功")
                return True
            else:
                print(f"钉钉推送失败: {result.get('errmsg')}")
                return False
        except Exception as e:
            print(f"钉钉推送异常: {e}")
            return False
    
    def send_feishu(self, content, webhook_url=None):
        url = webhook_url or self.config.get('feishu_webhook')
        if not url:
            print("飞书 webhook 未配置")
            return False
        
        try:
            text_content = content.replace('# ', '').replace('## ', '').replace('### ', '')
            text_content = text_content.replace('**', '')
            text_content = text_content[:3000]
            
            data = {
                "msg_type": "text",
                "content": {
                    "text": text_content
                }
            }
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)
            result = response.json()
            if result.get('code') == 0:
                print("飞书推送成功")
                return True
            else:
                print(f"飞书推送失败: {result.get('msg')}")
                return False
        except Exception as e:
            print(f"飞书推送异常: {e}")
            return False
    
    def format_brief_for_push(self, brief):
        lines = brief.split('\n')
        formatted_lines = []
        for line in lines:
            if line.startswith('# '):
                formatted_lines.append(f"**{line[2:]}**")
            elif line.startswith('## '):
                formatted_lines.append(f"\n**{line[3:]}**")
            elif line.startswith('### '):
                formatted_lines.append(f"\n{line[4:]}")
            elif line.startswith('**'):
                formatted_lines.append(line)
            elif line.startswith('- '):
                formatted_lines.append(line)
            elif line.startswith('---'):
                formatted_lines.append('')
            elif line.strip():
                formatted_lines.append(line)
        return '\n'.join(formatted_lines)[:4000]
    
    def send_all(self, brief):
        formatted_brief = self.format_brief_for_push(brief)
        
        success_count = 0
        total_count = 0
        
        if self.config.get('wechat_webhook'):
            total_count += 1
            if self.send_wechat(formatted_brief):
                success_count += 1
        
        if self.config.get('dingtalk_token'):
            total_count += 1
            if self.send_dingtalk(formatted_brief):
                success_count += 1
        
        if self.config.get('feishu_webhook'):
            total_count += 1
            if self.send_feishu(formatted_brief):
                success_count += 1
        
        print(f"\n推送完成: 成功 {success_count}/{total_count}")
        return success_count > 0