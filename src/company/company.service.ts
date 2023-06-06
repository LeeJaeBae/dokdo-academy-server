import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreDto } from 'src/lib/dto/core.dto';
import { Company } from 'src/lib/entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async findByType(type: string): Promise<Company[]> {
    const company = await this.companyRepository.find({
      where: { type },
    });

    return company;
  }

  async findByName(name: string): Promise<CoreDto> {
    try {
      const company = await this.companyRepository.findOne({
        where: { name },
        relations: ['reservations', 'reservations.tour'],
      });

      return { ok: true, data: company };
    } catch (e) {
      return {
        ok: false,
        error: '존재하지 않는 업체입니다.',
      };
    }
  }

  async deleteCompany(name: string) {
    try {
      const company = await this.companyRepository.findOne({
        where: { name },
      });
      if (!company) {
        return {
          ok: false,
          error: '존재하지 않는 업체입니다.',
        };
      }
      await this.companyRepository.delete(company.name);
      return {
        ok: true,
        message: '업체 삭제에 성공했습니다.',
      };
    } catch (error) {
      return {
        ok: false,
        error: '업체 삭제에 실패했습니다.',
      };
    }
  }

  async createOrUpdateCompany(data: Array<unknown>): Promise<CoreDto> {
    try {
      for (const item of data) {
        const exist = await this.companyRepository.findOne({
          where: { name: item['name'] },
        });
        if (exist) {
          await this.companyRepository.update(exist.name, item);
        } else {
          await this.companyRepository.save(item);
        }
      }
      return {
        ok: true,
        message: '업체 등록에 성공했습니다.',
      };
    } catch (error) {
      return {
        ok: false,
        error: '업체 등록에 실패했습니다.',
      };
    }
  }

  async createCompany(data): Promise<CoreDto> {
    try {
      const exist = await this.companyRepository.findOne({
        where: { name: data.name },
      });
      if (exist) {
        return {
          ok: false,
          error: '이미 존재하는 업체입니다.',
        };
      }
      const company = await this.companyRepository.create(data);
      await this.companyRepository.save(company);

      return {
        ok: true,
        message: '업체 등록에 성공했습니다.',
        data: company,
      };
    } catch (e) {
      return {
        ok: false,
        error: '업체 등록에 실패했습니다.',
      };
    }
  }
}
