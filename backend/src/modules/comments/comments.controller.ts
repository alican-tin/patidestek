import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import { BannedGuard } from '../../common/guards';
import { User } from '../users/user.entity';

@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  async findByPostId(@Param('postId', ParseIntPipe) postId: number) {
    const comments = await this.commentsService.findByPostId(postId);
    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
      },
    }));
  }

  @Post('posts/:postId/comments')
  @UseGuards(AuthGuard('jwt'), BannedGuard)
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.create(postId, createCommentDto, user);
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
      },
    };
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.commentsService.delete(id, user);
    return { message: 'Comment deleted successfully' };
  }
}
