## 描述
An NPM package/book that can have a typewriter like effect

一个可以如同打字机效果的npm包/hook

## 效果

![Untitled.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/47acfb2a976a49788372ee0f73b20afa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1174&h=530&s=1125414&e=gif&f=113&b=fefefe)

## 应用示例
### 1、模拟流式文本消息推送：

以下示例展示如何模拟SSE（Server-Sent Events）文本消息推送，模拟实时数据流的场景。
```js
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
            const interval = Math.floor(Math.random() * 500) + 1000; // 随机生成时间间隔
            setTimeout(pushNextChunk, interval);
        }
    }

    // 开始推送
    pushNextChunk();
};
```

### 2. 使用示例`React`
此示例展示如何在应用中模拟文本数据传入，实现打字机效果。
```js
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

```

## 代码实现
实现打字机效果涉及三个部分：
- 核心逻辑`TypeWriterCore`
- Hook封装`useTypeWriter`
- React组件实现`TypeWriter Components`
三个部分业务侧可按需取用，以下部分将详细介绍每一部分的实现逻辑及关键代码。

### 1. `TypeWriterCore.ts` - 打字机核心逻辑
`TypeWriterCore.ts`文件中定义了`TypeWriterCore`类，这个类封装了打字机效果的核心逻辑。通过构造函数，我们可以传入不同的配置选项，如打字速度、暂停时间等，以适应不同的使用场景。

```ts
interface TypeWriterCoreOptions {
    onConsume: (str: string) => void; // 定义一个回调函数，用于消费（处理）字符
    maxStepSeconds?: number; // 可选属性，定义最大步进间隔（毫秒）
}

export default class TypeWriterCore {
    onConsume: (str: string) => void; // 消费（处理）字符的回调函数
    queueList: string[] = []; // 存储待消费字符的队列
    maxStepSeconds: number = 50; // 默认最大步进间隔为50毫秒
    maxQueueNum: number = 2000; // 队列中最大字符数
    timer: number | undefined; // 用于控制下一次消费的定时器

    constructor({onConsume, maxStepSeconds}: TypeWriterCoreOptions) {
        this.onConsume = onConsume; // 初始化消费字符的回调

        if (maxStepSeconds !== undefined) {
            this.maxStepSeconds = maxStepSeconds; // 如果提供了最大步进间隔，则使用提供的值
        }
    }

    // 动态计算消费字符的速度
    dynamicSpeed() {
        const speedQueueNum = this.maxQueueNum / this.queueList.length; // 根据队列长度动态调整速度
        const resNum = +(
            speedQueueNum > this.maxStepSeconds
                ? this.maxStepSeconds : speedQueueNum
        ).toFixed(0); // 确保结果为整数

        return resNum;
    }

    // 将字符串添加到队列中
    onAddQueueList(str: string) {
        this.queueList = [...this.queueList, ...str.split('')]; // 分解字符串为字符数组并追加到队列
    }

    // 添加字符串到队列的公共方法
    add(str: string) {
        if (!str) return; // 如果字符串为空，则不执行任何操作
        this.onAddQueueList(str); // 调用内部方法添加字符串到队列
    }

    // 从队列中消费一个字符
    consume() {
        if (this.queueList.length > 0) {
            const str = this.queueList.shift(); // 从队列头部移除一个字符
            str && this.onConsume(str); // 如果字符存在，则调用消费函数处理该字符
        }
    }

    // 定时消费队列中的字符
    next() {
        this.timer = setTimeout(() => {
            if (this.queueList.length > 0) {
                this.consume(); // 消费一个字符
                this.next(); // 递归调用，继续消费下一个字符
            }
        }, this.dynamicSpeed()); // 根据动态速度设置定时器
    }

    // 开始消费队列中的字符
    start() {
        this.next(); // 调用next方法开始消费字符
    }

    // 渲染完成后的清理工作
    onRendered() {
        clearTimeout(this.timer); // 清除定时器，防止继续消费字符
    }

    // 清空队列并停止当前的消费过程
    onClearQueueList() {
        this.queueList = []; // 清空字符队列
        clearTimeout(this.timer); // 清除定时器
    }
}
```

### 2. `useTypeWriter.ts` - Hook封装
通过Hook`useTypeWriter`封装`TypeWriterCore`类，提供简洁的接口，使得在React或Vue组件中易于实现打字机效果。

代码示例如下：
```ts
import {useEffect, useState, useMemo} from 'react';
import TypeWriterCore from './TypeWriterCore';

interface UseWriterOptions {
    maxStepSeconds?: number; // 将 maxStepSeconds 定义为可选的
}

export const useTypeWriter = (
    {text, options}:
    { text: string, options?: UseWriterOptions }
) => {
    const [typedText, setTypedText] = useState('');

    const typingCore = useMemo(
        () => new TypeWriterCore(
            {
                onConsume: (str: string) => setTypedText(prev => prev + str),
                ...options,
            }
        ),
        []
    );

    useEffect(
        () => {
            typingCore.onRendered(); // 渲染完成 => 清空定时器
            typingCore.add(text);
            typingCore.start();

            return () => typingCore.onRendered(); // 渲染完成 => 清空定时器
        },
        [text]
    );

    return [typedText];
};
```

### 3. `index.tsx` - 组件实现示例

这个文件展示了如何在React组件中使用`useTypeWriter`Hook来实现打字机效果。以下是实现的关键部分：

```ts
import React from 'react';
import ReactMarkdown from 'react-markdown';
import {useTypeWriter} from './useTypeWriter'; // 替换为实际的导入路径
import TypeWriterCore from './TypeWriterCore';


interface TypingWriterProps {
  text: string;
  options?: {
    maxStepSeconds?: number;
  };
}

const TypingWriter: React.FC<TypingWriterProps> = ({text, options = {}}) => {
    const [typedText] = useTypeWriter({text, options});

    return (
        <div>
            <ReactMarkdown>
                {typedText}
            </ReactMarkdown>
        </div>
    );
};


export {
  TypingWriter,
  TypeWriterCore,
  useTypeWriter,
};
```

通过这三个文件的详细解析和代码实现，我们展示了从核心逻辑的构建到在React组件中的应用，如何逐步开发一个打字机效果的流式组件。
