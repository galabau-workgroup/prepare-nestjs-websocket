export class SendMessageDto {
  type: string;
  data: {
    user: string;
    message: string;
    [key: string]: string | number;
  };
}
