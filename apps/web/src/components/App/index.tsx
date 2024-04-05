import {useEffect, useState} from 'react';
import {TypingWriter} from 'ui-type-writer';
import {simulateWebSocketPush} from '@/utils';
import {mockMarkdownStr} from '@/mock/index'

export default function App() {
    const [markdownContent, setMarkdownContent] = useState(' ');

    useEffect(
        () => {
        // 在组件挂载时开始模拟WebSocket推送
            simulateWebSocketPush(mockMarkdownStr, data => {
            // 这里处理每次推送的数据，可以将数据存储到状态中，或者进行其他操作
                // 在每次推送时拼接数据
                setMarkdownContent(data);
            });
            // 清理定时器或其他资源
            return () => {};
        },
        []
    );

    return (
        <TypingWriter text={markdownContent} />
    );
}
