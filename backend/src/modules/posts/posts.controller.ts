import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, UpdateTagsDto, PostQueryDto, RejectPostDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard, BannedGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/user.entity';

@Controller()
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('posts')
  async findPublicPosts(@Query() query: PostQueryDto) {
    const result = await this.postsService.findPublicPosts(query);
    return {
      posts: result.posts.map((post) => this.formatPost(post)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('posts/:id')
  async findPublicById(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.findPublicById(id);
    return this.formatPost(post);
  }

  @Get('my/posts')
  @UseGuards(AuthGuard('jwt'))
  async findMyPosts(@CurrentUser() user: User) {
    const posts = await this.postsService.findMyPosts(user.id);
    return posts.map((post) => this.formatPostWithStatus(post));
  }

  @Get('my/posts/:id')
  @UseGuards(AuthGuard('jwt'))
  async findMyPostById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const post = await this.postsService.findMyPostById(id, user.id);
    return this.formatPostWithStatus(post);
  }

  @Post('posts')
  @UseGuards(AuthGuard('jwt'), BannedGuard)
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    const post = await this.postsService.create(createPostDto, user);
    return this.formatPostWithStatus(post);
  }

  @Patch('posts/:id')
  @UseGuards(AuthGuard('jwt'), BannedGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    const post = await this.postsService.update(id, updatePostDto, user);
    return this.formatPostWithStatus(post);
  }

  @Put('posts/:id/tags')
  @UseGuards(AuthGuard('jwt'), BannedGuard)
  async updateTags(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagsDto: UpdateTagsDto,
    @CurrentUser() user: User,
  ) {
    const post = await this.postsService.updateTags(id, updateTagsDto.tagIds, user);
    return this.formatPostWithStatus(post);
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.postsService.delete(id, user);
    return { message: 'Post deleted successfully' };
  }

  @Get('admin/posts/pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async findPendingPosts() {
    const posts = await this.postsService.findPendingPosts();
    return posts.map((post) => this.formatPostWithStatus(post));
  }

  @Patch('admin/posts/:id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.approve(id);
    return this.formatPostWithStatus(post);
  }

  @Patch('admin/posts/:id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectPostDto,
  ) {
    const post = await this.postsService.reject(id, rejectDto.reason);
    return this.formatPostWithStatus(post);
  }

  private formatPost(post: any) {
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      provinceCode: post.provinceCode,
      provinceName: post.provinceName,
      districtCode: post.districtCode,
      districtName: post.districtName,
      neighbourhoodName: post.neighbourhoodName,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      owner: post.owner ? {
        id: post.owner.id,
        name: post.owner.name,
      } : null,
      category: post.category,
      tags: post.tags || [],
    };
  }

  private formatPostWithStatus(post: any) {
    return {
      ...this.formatPost(post),
      status: post.status,
    };
  }
}
