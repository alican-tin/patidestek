import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './post.entity';
import { Tag } from '../tags/tag.entity';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto';
import { User } from '../users/user.entity';
import { PostStatus, UserRole } from '../../common/enums';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async findPublicPosts(query: PostQueryDto): Promise<{ posts: Post[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.owner', 'owner')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.status = :status', { status: PostStatus.APPROVED });

    if (query.search) {
      qb.andWhere('(post.title ILIKE :search OR post.description ILIKE :search)', { 
        search: `%${query.search}%` 
      });
    }

    if (query.categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query.tagIds) {
      const tagIdArray = query.tagIds.split(',').map((id) => parseInt(id.trim()));
      
      if (query.tagLogic === 'AND') {
        // AND mantığı: Tüm seçilen etiketlere sahip ilanlar (kesişim)
        qb.andWhere((qb2) => {
          const subQuery = qb2
            .subQuery()
            .select('pt."postId"')
            .from('post_tags', 'pt')
            .where('pt."tagId" IN (:...tagIds)')
            .groupBy('pt."postId"')
            .having('COUNT(DISTINCT pt."tagId") = :tagCount')
            .getQuery();
          return 'post.id IN ' + subQuery;
        })
        .setParameter('tagIds', tagIdArray)
        .setParameter('tagCount', tagIdArray.length);
      } else {
        // OR mantığı (default): Herhangi bir etikete sahip ilanlar (birleşim)
        qb.andWhere('tags.id IN (:...tagIds)', { tagIds: tagIdArray });
      }
    }

    if (query.provinceCode) {
      qb.andWhere('post.provinceCode = :provinceCode', { provinceCode: query.provinceCode });
    }

    if (query.districtCode) {
      qb.andWhere('post.districtCode = :districtCode', { districtCode: query.districtCode });
    }

    if (query.neighbourhoodName) {
      qb.andWhere('post.neighbourhoodName = :neighbourhoodName', { neighbourhoodName: query.neighbourhoodName });
    }

    qb.orderBy('post.createdAt', 'DESC');

    const [posts, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { posts, total, page, limit, totalPages };
  }

  async findPublicById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, status: PostStatus.APPROVED },
      relations: ['owner', 'category', 'tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found or not approved');
    }

    return post;
  }

  async findMyPosts(userId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { ownerId: userId },
      relations: ['category', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyPostById(id: number, userId: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, ownerId: userId },
      relations: ['category', 'tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const { tagIds, ...postData } = createPostDto;

    const post = this.postsRepository.create({
      ...postData,
      ownerId: user.id,
      status: PostStatus.PENDING,
    });

    if (tagIds && tagIds.length > 0) {
      post.tags = await this.tagsRepository.findBy({ id: In(tagIds) });
    }

    return this.postsRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async updateTags(id: number, tagIds: number[], user: User): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (tagIds.length > 0) {
      post.tags = await this.tagsRepository.findBy({ id: In(tagIds) });
    } else {
      post.tags = [];
    }

    return this.postsRepository.save(post);
  }

  async delete(id: number, user: User): Promise<void> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.remove(post);
  }

  async findPendingPosts(): Promise<Post[]> {
    return this.postsRepository.find({
      where: { status: PostStatus.PENDING },
      relations: ['owner', 'category', 'tags'],
      order: { createdAt: 'ASC' },
    });
  }

  async approve(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['owner', 'category', 'tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.status = PostStatus.APPROVED;
    return this.postsRepository.save(post);
  }

  async reject(id: number, reason?: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['owner', 'category', 'tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.status = PostStatus.REJECTED;
    return this.postsRepository.save(post);
  }
}
