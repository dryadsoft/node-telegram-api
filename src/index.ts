import moment from "moment";
import "moment-timezone";
import { IResultProps } from "./@types";
import Fetch from "./Fetch";

const BASE_URL = `https://api.telegram.org`;

export default class TelegramApi {
  private getUpdatesUrl: string;
  private sendMessageUrl: string;
  private deleteMessageUrl: string;
  private lastUpdateMessageId?: number;

  constructor(teletramToken: string) {
    this.getUpdatesUrl = `${BASE_URL}/bot${teletramToken}/getUpdates`;
    this.sendMessageUrl = `${BASE_URL}/bot${teletramToken}/sendMessage`;
    this.deleteMessageUrl = `${BASE_URL}/bot${teletramToken}/deleteMessage`;

    (async () => {
      this.setLastMessageId(await this.getLastUpdateMessageId());
    })();
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
   * @param message: string
   */
  async sendMessage(chatId: string, message: string) {
    await Fetch.post(
      this.sendMessageUrl,
      {
        chat_id: chatId,
        text: message,
        parse_mode: "markdown",
      },
      5000
    );
  }

  /**
   * inline button 메시지 보내기
   * @param message: string
   * @param inlineButton: string
   */
  async sendinlineButtonMessage(
    chatId: string,
    message: string,
    inlineButton: string
  ) {
    await Fetch.post(
      this.sendMessageUrl,
      {
        chat_id: chatId,
        text: message,
        parse_mode: "MarkDown",
        reply_markup: inlineButton,
      },
      5000
    );
  }

  /**
   * 메시지 삭제하기
   * @param messageId: number
   */
  async deleteMessage(chatId: string, messageId: number) {
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
  async getLastUpdateMessageId() {
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
  getLastMessageId(result: IResultProps[]) {
    if (result.length > 0) {
      return result[result.length - 1].update_id;
    }
  }

  /**
   * 텔레그램 마지막 메시지ID를 등록한다.
   * @param updateId: number
   */
  setLastMessageId(updateId?: number) {
    if (
      updateId &&
      (!this.lastUpdateMessageId || this.lastUpdateMessageId < updateId)
    ) {
      this.lastUpdateMessageId = updateId;
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  asyncLog(msg: any) {
    return new Promise((resolve) => {
      console.log(moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"), msg);
      return resolve("");
    });
  }
}
