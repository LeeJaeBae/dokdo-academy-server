import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get('/type/:type')
  findByType(@Param() { type }) {
    console.log(type);
    return this.companyService.findByType(type);
  }

  @Get('/:name')
  findByName(@Param() { name }) {
    return this.companyService.findByName(name);
  }

  @Post()
  createCompany(@Body() data) {
    return this.companyService.createCompany(data);
  }

  @Delete('/:name')
  deleteCompany(@Param() { name }) {
    return this.companyService.deleteCompany(name);
  }

  @Post('/excel')
  createOrUpdateCompany(@Body() data) {
    return this.companyService.createOrUpdateCompany(data);
  }
}
