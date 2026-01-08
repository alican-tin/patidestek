import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from '../posts/post.entity';
import { CreateCommentDto } from './dto';
import { User } from '../users/user.entity';
import { PostStatus, UserRole } from '../../common/enums';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findByPostId(postId: number): Promise<Comment[]> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, status: PostStatus.APPROVED },
    });

    if (!post) {
      throw new NotFoundException('Post not found or not approved');
    }

    return this.commentsRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(postId: number, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, status: PostStatus.APPROVED },
    });

    if (!post) {
      throw new NotFoundException('Post not found or not approved');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId,
      userId: user.id,
    });

    const savedComment = await this.commentsRepository.save(comment);

    return this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    }) as Promise<Comment>;
  }

  async delete(id: number, user: User): Promise<void> {
    const comment = await this.commentsRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
  }
}
