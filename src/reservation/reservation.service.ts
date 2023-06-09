import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Like, Repository } from 'typeorm';
import { CoreDto } from 'src/lib/dto/core.dto';
import { CreateReservationInput } from './dto/reservation.dto';
import { Tour } from 'src/tour/entities/tour.entity';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Options } from 'src/options/entities/options.entity';
import { Company } from 'src/lib/entities/company.entity';

@Injectable()
export class ReservationService {
  private s3: S3;

  constructor(
    @InjectRepository(Options)
    private readonly optionRepository: Repository<Options>,

    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private configService: ConfigService,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async getReservations(tourId) {
    const reservations = await this.reservationRepository.find({
      where: {
        tourId: +tourId,
      },
    });
    return reservations;
  }

  async getReservation(id: number): Promise<CoreDto> {
    const reservation = await this.reservationRepository.find({
      where: {
        tourId: id,
      },
    });
    console.log(reservation.length);
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

  async createReservationByType({ tourId, type, data }) {
    try {
      const tour = await this.tourRepository.findOne({
        where: { id: +tourId },
      });
      const company = await this.companyRepository.findOne({
        where: { name: data.companyName },
      });
      const reservation = this.reservationRepository.create({ tour, company });
      reservation.detail = JSON.stringify({
        ...data,
      });
      reservation.price = +data.price * +data.count;
      reservation.type = type;
      await this.reservationRepository.save(reservation);
      return {
        ok: true,
        message: '예약을 생성하였습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '예약을 생성할 수 없습니다.',
      };
    }
  }

  async updateReservationByType({ id, type, data }) {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { id },
      });
      if (!reservation) {
        return {
          ok: false,
          error: '예약을 찾을 수 없습니다.',
        };
      }
      const detail = reservation.detail;
      let count = data.count;
      if (type === 'restaurant') {
        const tour = await this.tourRepository.findOne({
          where: {
            id: reservation.tourId,
          },
          relations: ['participants'],
        });
        const participants = tour.participants;
        const group = participants.filter((p) => p.group.name === detail.group);
        const menu = detail.menu;
        if (group) {
          count += group.length;
        }
        const price = +menu.value * +count;
        reservation.price = price;
      }
      await this.reservationRepository.save(reservation);
      return {
        ok: true,
        message: '예약을 수정하였습니다.',
      };
      // console.log(reservation);
    } catch (error) {
      return {
        ok: false,
        error: '예약을 수정할 수 없습니다.',
      };
    }
  }

  async createShipReservation({ tourId, data }) {
    try {
      const { companyName, start, end, price, count } = data;
      const tour = await this.tourRepository.findOne({
        where: { id: +tourId },
      });
      const company = await this.companyRepository.findOne({
        where: { name: companyName },
      });
      const reservation = this.reservationRepository.create({ tour, company });
      reservation.detail = JSON.stringify({
        ...data,
      });
      reservation.price = +price * +count;
      reservation.type = 'ship';
      if (start === '독도' || end === '독도') {
        reservation.type = 'dokdo';
      }
      await this.reservationRepository.save(reservation);
      return {
        ok: true,
        message: '선박 예약을 생성하였습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '예약을 생성할 수 없습니다.',
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

  async updateAttractionReservation({ id, data }) {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { id },
      });
      if (!reservation) {
        return {
          ok: false,
          error: '잘못된 예약입니다.',
        };
      }
      console.log(data);
      const { count } = data;
      reservation.price = +reservation.detail.attraction.value * count;
      reservation.detail = JSON.stringify({ ...reservation.detail, count });
      await this.reservationRepository.save(reservation);
      return {
        ok: true,
        message: '예약을 수정하였습니다.',
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '예약을 수정할 수 없습니다.',
      };
    }
  }

  async createAttractionReservation({ tourId, data }) {
    try {
      const tour = await this.tourRepository.findOne({
        where: { id: +tourId },
        relations: ['participants'],
      });
      if (!tour) {
        return {
          ok: false,
          error: '잘못된 투어입니다.',
        };
      }
      const participantsCount = tour.participants.length;
      const attraction = await this.optionRepository.findOne({
        where: { name: Like(`%${data.attraction}%`) },
      });
      if (!attraction) {
        return {
          ok: false,
          error: '잘못된 관광지입니다.',
        };
      }
      const price = attraction.value * participantsCount;
      const newReservation = this.reservationRepository.create();
      newReservation.tour = tour;
      newReservation.type = 'attraction';
      newReservation.detail = JSON.stringify({
        attraction,
        count: participantsCount,
      });
      newReservation.price = price;
      await this.reservationRepository.save(newReservation);
      return {
        ok: true,
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

  async createRestaurantsReservation({ tourId, data }) {
    try {
      const tour = await this.tourRepository.findOne({
        where: { id: +tourId },
        relations: ['participants'],
      });

      if (!tour) {
        return {
          ok: false,
          error: '잘못된 투어입니다.',
        };
      }

      for (const reservation of data) {
        const { group, restaurant, menu } = reservation;

        const participants = tour.participants.filter(
          (participant) => participant.group.name === group,
        );

        const company = await this.companyRepository.findOne({
          where: { name: Like(`%${restaurant}%`) },
        });
        const option = await this.optionRepository.findOne({
          where: { name: Like(`%${menu}%`) },
        });
        if (!company || !option) {
          return {
            ok: false,
            error: '잘못된 식당 또는 메뉴입니다.',
          };
        }
        const price = option.value * participants.length;
        const newReservation = this.reservationRepository.create();
        newReservation.tour = tour;
        newReservation.company = company;
        newReservation.type = 'restaurant';
        newReservation.detail = JSON.stringify({
          group: group,
          menu: option,
          title: reservation.title,
          count: participants.length,
        });
        newReservation.price = price;

        await this.reservationRepository.save(newReservation);
      }

      return {
        ok: true,
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

  async uploadReceipt({ reservationId, file }) {
    try {
      const { image } = file; // image => base64
      const reservation = await this.reservationRepository.findOne({
        where: { id: reservationId },
      });
      if (!reservation) {
        return {
          ok: false,
          error: '예약을 찾을 수 없습니다.',
        };
      }
      const dateString = new Date().toLocaleDateString();

      const { Location } = await this.s3
        .upload({
          Bucket: this.configService.get('AWS_BUCKET_NAME'),
          Key: `${reservationId}-${dateString}.jpg`,
          Body: Buffer.from(image, 'base64'),
          ACL: 'public-read',
        })
        .promise();

      if (reservation.type === 'hotel') {
        const reservations = await this.reservationRepository.find({
          where: {
            tourId: reservation.tourId,
            company: {
              name: reservation.company.name,
            },
          },
        });

        for (const reservation of reservations) {
          reservation.receipt = Location;
          await this.reservationRepository.save(reservation);
        }

        return {
          ok: true,
          message: '영수증을 업로드하였습니다.',
        };
      }

      reservation.receipt = Location;

      await this.reservationRepository.save(reservation);

      return {
        ok: true,

        message: '영수증을 업로드하였습니다.',
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: '영수증을 업로드할 수 없습니다.',
      };
    }
  }
}
