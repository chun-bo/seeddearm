import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const doubaoApiUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
  
  // 从环境变量中获取 API Key，确保它已在 Vercel 中配置
  const apiKey = process.env.VITE_DOUBAO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const response = await fetch(doubaoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    // 将豆包 API 的响应头复制到我们的响应中
    // 这对于处理流式响应等情况很重要
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    res.setHeader('Transfer-Encoding', response.headers.get('Transfer-Encoding') || 'chunked');
    
    // 将豆包 API 的流式响应体直接 pipe 到我们的响应中
    if (response.body) {
      // Vercel 的响应对象是 Node.js 的 ServerResponse，可以作为可写流使用
      // @ts-ignore
      response.body.pipe(res);
    } else {
      res.status(500).json({ error: 'Empty response from upstream API' });
    }

  } catch (error: any) {
    console.error('Error proxying request:', error);
    res.status(502).json({ error: 'Failed to proxy request to upstream API.', details: error.message });
  }
}