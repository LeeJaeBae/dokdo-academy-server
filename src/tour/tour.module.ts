import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { Section } from './entities/section.entity';
import { Participant } from './entities/participant.entity';
import { Group } from './entities/group.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Company } from 'src/lib/entities/company.entity';
import { Options } from 'src/options/entities/options.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tour,
      Group,
      Section,
      Participant,
      Reservation,
      Company,
      Options,
    ]),
  ],
  controllers: [TourController],
  providers: [TourService],
})
export class TourModule {}
