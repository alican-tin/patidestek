import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagsRepository.findByIds(ids);
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existing = await this.tagsRepository.findOne({
      where: { name: createTagDto.name },
    });
    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagsRepository.create(createTagDto);
    return this.tagsRepository.save(tag);
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);

    const existing = await this.tagsRepository.findOne({
      where: { name: updateTagDto.name },
    });
    if (existing && existing.id !== id) {
      throw new ConflictException('Tag with this name already exists');
    }

    tag.name = updateTagDto.name;
    return this.tagsRepository.save(tag);
  }

  async delete(id: number): Promise<void> {
    const tag = await this.findById(id);
    await this.tagsRepository.remove(tag);
  }
}
