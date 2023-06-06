import { PartialType } from '@nestjs/mapped-types';
import { Reservation } from '../entities/reservation.entity';

export class CreateReservationInput extends PartialType(Reservation) {}
