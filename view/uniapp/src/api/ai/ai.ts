import request from '@/utils/request';

/**
 * 发送消息到AI（流式）
 * @param message 用户消息
 * @param onChunk 接收到数据块的回调
 */
export async function sendMessageStream(
    message: string,
    onChunk: (chunk: string) => void
): Promise<void> {
    const url = 'ai/chat/stream';
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream'
            }
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('无法获取响应流');
        }

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('[AI API] 流式接收完成');
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    } catch (error) {
        console.error('[AI API] 流式请求失败:', error);
        throw error;
    }
}

/**
 * 发送消息到AI（非流式，保留兼容）
 */
export function sendMessage(message: string) {
    return new Promise((resolve, reject) => {
        request({
            url: 'ai/chat',
            method: 'post',
            data: { message }
        }).then((res: any) => {
            console.log('[AI API] 原始响应:', res);
            // 直接返回整个响应对象
            resolve(res);
        }).catch((err: any) => {
            console.error('[AI API] 请求失败:', err);
            reject(err);
        });
    });
}

/**
 * 清空对话历史
 */
export function clearHistory() {
    return request({
        url: 'ai/clear',
        method: 'post'
    });
}

/**
 * 获取对话历史
 */
export function getHistory() {
    return request({
        url: 'ai/history',
        method: 'get'
    });
}
