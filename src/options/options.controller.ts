import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { OptionsService } from './options.service';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  findAll() {
    return this.optionsService.findAll();
  }

  @Get('/:id')
  findOne(@Param() { id }) {
    return this.optionsService.findOne(+id);
  }

  @Get('/reset/all')
  reset() {
    return this.optionsService.resetOptions();
  }

  @Post()
  createOption(@Body() data) {
    return this.optionsService.CreateOption(data);
  }

  @Put('/:id')
  updateOption(@Param() { id }, @Body() data) {
    return this.optionsService.updateOption(id, data);
  }

  @Delete('/:id')
  deleteOption(@Param() { id }) {
    return this.optionsService.deleteOption(+id);
  }
}
