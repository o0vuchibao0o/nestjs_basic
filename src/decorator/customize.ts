import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const PublicDecorator = () => SetMetadata(IS_PUBLIC_KEY, true);

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const RESPONSE_MESSAGE = "response_message";
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
