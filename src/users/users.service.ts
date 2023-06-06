import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CoreDto } from 'src/lib/dto/core.dto';
import { Role } from 'src/lib/decorators/roles.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CoreDto> {
    try {
      const exist = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (exist) {
        return { ok: false, error: '이미 존재하는 아이디입니다.' };
      }

      const hashedPassword = await User.hashPassword(createUserDto.password);

      const user = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      console.log(createUserDto);

      await this.userRepository.save(user);

      return {
        ok: true,
        message: '회원가입에 성공했습니다.',
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: '회원가입에 실패했습니다. 관리자에게 문의해주세요.',
      };
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({
        where: {
          roles: Role.MANAGER,
        },
      });
      return users;
    } catch (e) {
      console.log(e);
    }
  }

  async findOne(username: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          ok: false,
          error: '존재하지 않는 회원입니다.',
        };
      }

      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });

      return {
        ok: true,
        user: updatedUser,
        message: '회원정보 수정에 성공했습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '회원정보 수정에 실패했습니다. 관리자에게 문의해주세요.',
      };
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          ok: false,
          error: '존재하지 않는 회원입니다.',
        };
      }

      await this.userRepository.remove(user);

      return {
        ok: true,
        message: '회원정보 삭제에 성공했습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '회원정보 삭제에 실패했습니다. 관리자에게 문의해주세요.',
      };
    }
  }
}
