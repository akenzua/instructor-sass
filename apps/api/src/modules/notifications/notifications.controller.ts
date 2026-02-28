import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll(
    @Request() req: any,
    @Query("unreadOnly") unreadOnly?: string,
    @Query("limit") limit?: string,
  ) {
    return this.notificationsService.getAll(req.user.sub, {
      unreadOnly: unreadOnly === "true",
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get("unread-count")
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Patch(":id/read")
  async markAsRead(@Request() req: any, @Param("id") id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }

  @Patch("read-all")
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.sub);
  }
}
