import { Module } from '@nestjs/common';
import { ReservationController } from './resrvation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Tour } from 'src/tour/entities/tour.entity';
import { Participant } from 'src/tour/entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Tour, Participant])],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
