import { Module } from '@nestjs/common';
import { ReservationController } from './resrvation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Tour } from 'src/tour/entities/tour.entity';
import { Participant } from 'src/tour/entities/participant.entity';
import { Options } from 'src/options/entities/options.entity';
import { Company } from 'src/lib/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Reservation,
      Tour,
      Participant,
      Options,
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
