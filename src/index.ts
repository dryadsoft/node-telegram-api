import moment from "moment";
import {
  callbackType,
  DynamicObject,
  ICallbackProps,
  IInlineButton,
  IMessage,
  IMessageQueueProps,
  initCallbackType,
  IPollingArgumentProps,
  IPollingCallbackProps,
  IResultProps,
  ITelegramApiProps,
  listenerType,
  watchCallbackType,
} from "./@types/telegram";
import Fetch from "./Fetch";

const BASE_URL = `https://api.telegram.org`;

export default class TelegramApi {
  private readonly SERIES: string = "series"; // 직렬
  private readonly PARALLEL: string = "parallel"; // 병렬
  private readonly getUpdatesUrl: string;
  private readonly sendMessageUrl: string;
  private readonly deleteMessageUrl: string;
  private lastUpdateMessageId?: number;
  private pollingArguments: IPollingArgumentProps[] = [];
  private options: DynamicObject<any> = {};
  private messageQueue: IMessageQueueProps[] = [];
  /**
   * constructor
   * @param teletramToken: string;
   * @paran options?: ITelegramApiProps
   * @return void
   */
  constructor(teletramToken: string, options?: ITelegramApiProps) {
    this.getUpdatesUrl = `${BASE_URL}/bot${teletramToken}/getUpdates`;
    this.sendMessageUrl = `${BASE_URL}/bot${teletramToken}/sendMessage`;
    this.deleteMessageUrl = `${BASE_URL}/bot${teletramToken}/deleteMessage`;

    (async () => {
      this.setLastMessageId(await this.getLastUpdateMessageId());
      if (options?.polling) {
        await this.startPolling(options);
      }
    })();
  }

  /**
   * init
   * @param callback: initCallbackType
   */
  init(callback: initCallbackType) {
    if (typeof callback === "function") {
      callback(this.options);
    }
  }

  /**
   * getOptions
   */
  getOptions() {
    return this.options;
  }

  /**
   * pushMessageQueue
   * @param chatId: number 메시지받을 사람의 chat_id
   * @param message: string 메시지 내용
   */
  pushMessageQueue({ chatId, message }: IMessageQueueProps) {
    this.messageQueue.push({ chatId, message });
  }

  /**
   * callMessageQueue
   * 메시지큐에 들어가있는 메시지를 처음 들어가있는 순서대로 발송한다.
   */
  private async callMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queue = this.messageQueue.shift();
      if (queue) {
        await this.sendMessage(queue.chatId, queue.message);
        // sleep 1초
        await this.sleep(1000);
      }
    }
  }
  /**
   * startPolling
   * @param options: ITelegramApiProps
   */
  private async startPolling(options: ITelegramApiProps) {
    while (options.polling) {
      const arrResult = await this.getUpdates();
      if (arrResult) {
        if (options.process === this.SERIES) {
          // 메시지 직렬방식으로 처리
          await this.pollSeriesJob(arrResult);
        } else {
          // 메시지 병렬방식으로 처리(default)
          await this.pollParallelJob(arrResult);
        }
      }
      // sleep 1초
      await this.sleep(1000);
      this.callMessageQueue();
    }
  }

  /**
   * pollParallelJob
   * 메시지 병렬처리
   * @param arrResult: IResultProps[]
   */
  private async pollParallelJob(arrResult: IResultProps[]) {
    arrResult.forEach(async (item) => {
      await this.pollJob(item);
    });
  }

  /**
   * pollSeriesJob
   * 메시지 직렬처리
   * @param arrResult: IResultProps[]
   */
  private async pollSeriesJob(arrResult: IResultProps[]) {
    for (const item of arrResult) {
      await this.pollJob(item);
    }
  }

  /**
   * pollJob
   * 메시지 처리
   * @param item: IResultProps
   */
  private async pollJob(item: IResultProps) {
    if (item.message) {
      // 일반 메시지 콜백처리
      await this.callTextMessage(item.message);
    } else if (item.callback_query) {
      // 채팅창의 버튼클릭시 콜백처리
      await this.callCallbackMessage(item.callback_query);
    }
  }
  /**
   * callTextMessage
   * 채팅창에 일반메시지 입력되었을때 콜백처리
   * @param message: IMessage
   */
  private async callTextMessage(message: IMessage) {
    const {
      message_id,
      chat: { id },
      from: { is_bot },
      text,
    } = message;
    if (!is_bot) {
      await this.callCallback("text", {
        chatId: id,
        messageId: message_id,
        text,
      });
    }
  }

  /**
   * callCallbackMessage
   * 채팅창에 생성된 버튼을 클릭하였을때 콜백처리
   * @param callback_query: ICallbackProps
   */
  private async callCallbackMessage(callback_query: ICallbackProps) {
    // 채팅창의 버튼클릭시 콜백처리
    const {
      message: {
        message_id,
        chat: { id },
        text,
      },
      data,
    } = callback_query;
    await this.callCallback("callback", {
      chatId: id,
      messageId: message_id,
      text,
      data,
    });
  }

  /**
   * on 이벤트리스너에 등록된 콜백함수 호출
   */
  private async callCallback(
    listener: listenerType,
    { chatId, messageId, text, data }: IPollingCallbackProps
  ) {
    const callback = this.getPollingCallback(listener);
    if (typeof callback === "function") {
      await callback({
        chatId,
        messageId,
        text,
        data,
        options: this.options,
      });
    }
  }

  /**
   * getPollingCallback
   * listener에 등로된 콜백함수를 리턴
   * @param listener: "text" | "callback"
   * @return (param: IPollingCallbackProps) => Promise<void>
   */
  private getPollingCallback(listener: listenerType) {
    return this.pollingArguments.filter(
      (value) => value.listener === listener
    )[0].callback;
  }
  /**
   * isPollingListener
   * 이미 listener에 등록되어있는지 체크한다.
   * @param listener: "text" | "callback"
   * @return boolean
   */
  private isPollingListener(listener: listenerType) {
    return this.pollingArguments.some((value) => value.listener === listener);
  }

  /**
   * on
   * @param listener: listenerType
   * @param callback: callbackType
   */
  on(listener: listenerType, callback: callbackType) {
    const isExists = this.isPollingListener(listener);
    !isExists && this.pollingArguments.push({ listener, callback });
  }

  async watch(watchCallback: watchCallbackType, delay = 1000) {
    if (typeof watchCallback === "function") {
      while (true) {
        await watchCallback({ options: this.options });
        await this.sleep(delay);
      }
    }
  }
  /**
   * 채팅방 메시지 받아오기
   */
  async getUpdates() {
    let url = this.getUpdatesUrl;
    if (this.lastUpdateMessageId) {
      url = `${url}?offset=${this.lastUpdateMessageId + 1}`;
    }
    const res:
      | {
          data: { ok: boolean; result: IResultProps[] };
        }
      | undefined = await Fetch.get(url, 5000);
    if (res) {
      const {
        data: { ok, result },
      } = res;
      // console.log(result);
      if (ok) {
        this.setLastMessageId(this.getLastMessageId(result));
        return result;
      }
    }
    return;
  }

  /**
   * 메시지 보내기
   * @param chatId: number
   * @param message: string
   * @param parse_mode?: string
   */
  async sendMessage(chatId: number, message: string, parse_mode?: string) {
    await Fetch.post(
      this.sendMessageUrl,
      {
        chat_id: chatId,
        text: message,
        parse_mode,
      },
      5000
    );
  }

  /**
   * inline button 메시지 보내기
   * @param chatId: number
   * @param message: string
   * @param inlineButton: IInlineButton[][]
   * @param parse_mode?: string
   */
  async sendInlineButtonMessage(
    chatId: number,
    message: string,
    inlineButton: IInlineButton[][],
    parse_mode?: string
  ) {
    await Fetch.post(
      this.sendMessageUrl,
      {
        chat_id: chatId,
        text: message,
        parse_mode,
        reply_markup: JSON.stringify({ inline_keyboard: inlineButton }),
      },
      5000
    );
  }

  /**
   * inline button 메시지 보내기
   * @param chatId: number
   * @param  message: string
   * @param  keyboard: string[][]
   */
  async sendKeyboardMessage(
    chatId: number,
    message: string,
    keyboard: string[][]
  ) {
    await Fetch.post(
      this.sendMessageUrl,
      {
        chat_id: chatId,
        text: message,
        parse_mode: "MarkDown",
        reply_markup: JSON.stringify({
          keyboard: keyboard,
          resize_keyboard: true,
        }),
      },
      5000
    );
  }

  /**
   * 메시지 삭제하기
   * @param chatId: number
   * @param messageId: number
   */
  async deleteMessage(chatId: number, messageId: number) {
    await Fetch.post(
      this.deleteMessageUrl,
      {
        chat_id: chatId,
        message_id: messageId,
      },
      5000
    );
  }

  /**
   * 채팅방 마지막 메시지번호 가져오기
   */
  private async getLastUpdateMessageId() {
    const res:
      | {
          data: { ok: boolean; result: IResultProps[] };
        }
      | undefined = await Fetch.get(this.getUpdatesUrl, 5000);
    if (res) {
      const {
        data: { ok, result },
      } = res;
      if (ok) {
        if (result.length > 0) {
          return result[result.length - 1].update_id;
        }
      }
    }
    return;
  }

  /**
   * 텔레그램 마지막 메시지ID를 가져온다.
   * @param result: IResultProps[]
   */
  private getLastMessageId(result: IResultProps[]) {
    if (result.length > 0) {
      return result[result.length - 1].update_id;
    }
  }

  /**
   * 텔레그램 마지막 메시지ID를 등록한다.
   * @param updateId?: number
   */
  private setLastMessageId(updateId?: number) {
    if (
      updateId &&
      (!this.lastUpdateMessageId || this.lastUpdateMessageId < updateId)
    ) {
      this.lastUpdateMessageId = updateId;
    }
  }

  /**
   * sleep
   * @param ms: number
   */
  sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * sleep
   * @param msg: any
   */
  asyncLog(msg: any) {
    return new Promise((resolve) => {
      console.log(moment().format("YYYY-MM-DD HH:mm:ss"), msg);
      return resolve("");
    });
  }
}
