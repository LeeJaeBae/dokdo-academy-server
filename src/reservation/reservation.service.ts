import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository } from 'typeorm';
import { CoreDto } from 'src/lib/dto/core.dto';
import { CreateReservationInput } from './dto/reservation.dto';
import { Tour } from 'src/tour/entities/tour.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
  ) {}

  async getReservation(id: number): Promise<CoreDto> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    return {
      ok: true,
      data: reservation,
    };
  }

  async getReservationsByType({ tourId, type }) {
    try {
      const reservations = await this.reservationRepository.find({
        where: { tourId, type },
      });

      // const filteredReservations = reservations.filter(
      //   (reservation) => reservation.company.type === type,
      // );

      return {
        ok: true,
        data: reservations,
      };
    } catch (error) {
      return {
        ok: false,
        error: '예약을 불러올 수 없습니다.',
      };
    }
  }

  async createReservation(
    tourId: string,
    body: CreateReservationInput,
  ): Promise<CoreDto> {
    try {
      const tour = await this.tourRepository.findOne({
        where: { id: +tourId },
      });

      const reservation = this.reservationRepository.create(body);
      reservation.tour = tour;
      await this.reservationRepository.save(reservation);
      return {
        ok: true,
        data: reservation,
        message: '예약을 생성하였습니다.',
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: '예약을 생성할 수 없습니다.',
      };
    }
  }
}
