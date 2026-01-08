import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateRoleDto, UpdateBanDto } from './dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<User> {
    const user = await this.findById(id);
    user.role = updateRoleDto.role;
    return this.usersRepository.save(user);
  }

  async updateBan(id: number, updateBanDto: UpdateBanDto): Promise<User> {
    const user = await this.findById(id);
    user.isBanned = updateBanDto.isBanned;
    return this.usersRepository.save(user);
  }
}
