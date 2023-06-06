import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { TourService } from './tour.service';

@Controller('tour')
export class TourController {
  constructor(private tourService: TourService) {}
  @Get()
  findAll() {
    return this.tourService.findAll();
  }

  @Post()
  create(@Body() body) {
    return this.tourService.create(body);
  }

  @Put()
  update(@Body() body) {
    console.log(body);
    return this.tourService.update(body);
  }

  @Delete(':id')
  async delete(@Param() { id }, @Res() res) {
    const result = await this.tourService.delete(id);
    if (result.ok) {
      res.status(201).json(result);
    } else {
      res.status(201).json(result);
    }
    return result;
  }

  @Get('recent')
  getNowTour() {
    return this.tourService.getNowTour();
  }

  @Get('/:id')
  getTour(@Param() query) {
    const { id } = query;
    return this.tourService.getTourById(+id);
  }

  @Post('/participants/:id')
  createParticipant(@Body() body, @Param() query) {
    const { id } = query;

    return this.tourService.createParticipant(id, body);
  }

  @Post('/group/:id')
  createGroup(@Body() body, @Param() query) {
    return this.tourService.createGroup(body);
  }

  @Get('/group/:id')
  getGroup(@Param() query) {
    const { id } = query;
    return this.tourService.getGroup(id);
  }

  @Put('/group/:id')
  updateGroup(@Body() body, @Param() query) {
    const { id } = query;
    return this.tourService.updateGroup(id, body);
  }
}
