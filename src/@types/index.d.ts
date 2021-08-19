export interface IFromProps {
  id: number;
  is_bot: boolean;
  first_name: string;
  language_code: string;
}
export interface IChatProps {
  id: number;
  first_name: string;
  type: string;
}
export interface IEntitiesProps {
  offset: number;
  length: number;
  type: string;
}
export interface IMessage {
  message_id: number;
  from: IFromProps;
  chat: IChatProps;
  date: number;
  text: string;
  entities?: IEntitiesProps[];
}

export interface ICallbackProps {
  id: string;
  from: IFromProps;
  message: IMessage;
  chat_instance: string;
  data: string;
}

export interface IResultProps {
  update_id: number;
  message?: IMessage;
  callback_query?: ICallbackProps;
}

export interface IInlineButton {
  text: string;
  callback_data: string;
}
