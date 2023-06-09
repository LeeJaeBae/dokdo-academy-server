import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationInput } from './dto/reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get('/:id')
  getReservation(@Param() { id }) {
    return this.reservationService.getReservation(id);
  }

  @Post('/:tourId')
  createReservation(@Param() { tourId }, @Body() body: CreateReservationInput) {
    return this.reservationService.createReservation(tourId, body);
  }

  @Get('/type/:tourId/:type')
  getReservationsByType(@Param() { tourId, type }) {
    return this.reservationService.getReservationsByType({ tourId, type });
  }

  @Post('/restaurant/:tourId')
  createRestaurantReservation(@Param() { tourId }, @Body() { data }) {
    return this.reservationService.createRestaurantsReservation({
      tourId,
      data,
    });
  }

  @Post('/restaurant/update/:id')
  updateRestaurantReservation(@Param() { id }, @Body() data) {
    return this.reservationService.updateReservationByType({
      id: +id,
      data,
      type: 'restaurant',
    });
  }

  @Post('/ship/create/:tourId')
  createShipReservation(@Param() { tourId }, @Body() data) {
    return this.reservationService.createShipReservation({ tourId, data });
  }

  @Post('/:type/create/:tourId')
  createReservationByType(@Param() { type, tourId }, @Body() data) {
    return this.reservationService.createReservationByType({
      type,
      tourId,
      data,
    });
  }

  @Post('/attraction/update/:id')
  updateAttractionReservation(@Param() { id }, @Body() data) {
    return this.reservationService.updateAttractionReservation({
      id: +id,
      data,
    });
  }

  @Post('/attraction/:tourId')
  createAttractionReservation(@Param() { tourId }, @Body() { data }) {
    return this.reservationService.createAttractionReservation({
      tourId,
      data,
    });
  }

  @Post('/receipt/:id')
  uploadReceipt(@Param() { id }, @Body() body) {
    return this.reservationService.uploadReceipt({
      reservationId: id,
      file: body,
    });
  }
}
