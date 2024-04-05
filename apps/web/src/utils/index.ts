export const simulateWebSocketPush = (text, onDataReceived) => {
    const words = text.split(/([\s，。；：！、])/); // 在标点符号前后插入分隔符，以便保留标点符号
    let currentIndex = 0;

    // 模拟推送函数
    function pushNextChunk() {
        const chunkSize = Math.floor(Math.random() * 5) + 1; // 随机生成 1 到 5 的字数
        const currentChunk = words.slice(currentIndex, currentIndex + chunkSize).join('');
        currentIndex += chunkSize;

        // 模拟推送，实际中需要通过 WebSocket 推送给客户端
        // 这里将数据通过回调函数传递给调用方
        onDataReceived(currentChunk);

        // 继续推送，直到所有文字都被推送完
        if (currentIndex < words.length) {
            const interval = Math.floor(Math.random() * 500); // 随机生成时间间隔
            setTimeout(pushNextChunk, interval);
        }
    }

    // 开始推送
    pushNextChunk();
};
