import React from 'react';
import ReactMarkdown from 'react-markdown';
import {useTypeWriter} from './useTypeWriter'; // 替换为实际的导入路径
import TypeWriterCore from './TypeWriterCore';


interface TypingWriterProps {
  text: string;
  options?: {
    maxStepSeconds?: number;
    // 其他可能的属性
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
