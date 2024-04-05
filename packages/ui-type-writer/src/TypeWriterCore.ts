interface TypeWriterCoreOptions {
    onConsume: (str: string) => void;
    maxStepSeconds?: number; // 将 maxStepSeconds 定义为可选的
}

export default class TypeWriterCore {
    onConsume: (str: string) => void;
    queueList: string[] = [];
    maxStepSeconds: number = 50;
    maxQueueNum: number = 2000;
    timer: number | undefined;

    constructor({onConsume, maxStepSeconds}: TypeWriterCoreOptions) {
        this.onConsume = onConsume;

        if (maxStepSeconds !== undefined) {
            this.maxStepSeconds = maxStepSeconds;
        }
    }

    dynamicSpeed() {
        const speedQueueNum = this.maxQueueNum / this.queueList.length;
        const resNum = +(
            speedQueueNum > this.maxStepSeconds
                ? this.maxStepSeconds : speedQueueNum
        ).toFixed(0);

        return resNum;
    }

    onAddQueueList(str: string) {
        this.queueList = [...this.queueList, ...str.split('')];
    }

    add(str: string) {
        if (!str) {
            return;
        }
        this.onAddQueueList(str);
    }

    consume() {
        if (this.queueList.length > 0) {
            const str = this.queueList.shift();
            str && this.onConsume(str);
        }
    }

    next() {
        this.timer = setTimeout(() => {
            if (this.queueList.length > 0) {
                this.consume();
                this.next();
            }
        }, this.dynamicSpeed());
    }

    start() {
        this.next();
    }

    onRendered() {
        clearTimeout(this.timer);
    }

    onClearQueueList() {
        this.queueList = [];
        clearTimeout(this.timer);
    }
}
