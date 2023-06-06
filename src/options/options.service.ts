import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Options, OptionsDto, defaultOptions } from './entities/options.entity';

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Options)
    private readonly optionsRepository: Repository<Options>,
  ) {}

  async findAll(): Promise<Options[]> {
    const options = await this.optionsRepository.find({});
    return options;
  }

  async resetOptions() {
    try {
      const options = await this.optionsRepository.find();
      await this.optionsRepository.remove(options);
      defaultOptions.forEach(async (option) => {
        const newOption = await this.optionsRepository.create(option);
        await this.optionsRepository.save(newOption);
      });
      console.log('call');
      return {
        ok: true,
        message: '옵션이 초기화되었습니다.',
      };
    } catch (error) {
      return {
        ok: false,
      };
    }
  }

  async findOne(id: number): Promise<Options> {
    try {
      const option = await this.optionsRepository.findOne({ where: { id } });
      return option;
    } catch (error) {
      console.log(error);
    }
  }

  async CreateOption(body: OptionsDto) {
    try {
      const option = await this.optionsRepository.create(body);
      await this.optionsRepository.save(option);
      return {
        ok: true,
        data: option,
        message: '옵션이 생성되었습니다.',
      };
    } catch (error) {
      return {
        ok: false,
        error: '옵션을 생성할 수 없습니다.',
      };
    }
  }

  async updateOption(id: string, body: OptionsDto) {
    try {
      const option = await this.optionsRepository.findOne({
        where: { name: id },
      });

      if (!option) {
        return {
          ok: false,
          error: '옵션이 존재하지 않습니다.',
        };
      }
      const data = await this.optionsRepository.merge(option, body);
      await this.optionsRepository.save(data);
      return {
        ok: true,
        message: '옵션이 수정되었습니다.',
        data,
      };
    } catch (error) {
      return {
        ok: false,
        error: '옵션을 수정할 수 없습니다.',
      };
    }
  }

  async deleteOption(id: number) {
    try {
      const option = await this.optionsRepository.findOne({ where: { id } });
      if (!option) {
        return {
          ok: false,
          error: '옵션이 존재하지 않습니다.',
        };
      }
      await this.optionsRepository.delete({ id });
      return {
        ok: true,
        message: '옵션이 삭제되었습니다.',
      };
    } catch (error) {
      return {
        ok: false,
        error: '옵션을 삭제할 수 없습니다.',
      };
    }
  }
}
