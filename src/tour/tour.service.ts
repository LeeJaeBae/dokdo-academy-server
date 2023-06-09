import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CoreDto } from 'src/lib/dto/core.dto';
import { Participant, Sexuality } from './entities/participant.entity';
import { Group } from './entities/group.entity';
import { Company } from 'src/lib/entities/company.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Options } from 'src/options/entities/options.entity';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Options)
    private readonly optionRepository: Repository<Options>,
  ) {}

  async getGroup(id: number): Promise<Group> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id },
      });
      return group;
    } catch (e) {}
  }

  async findAll(): Promise<Tour[]> {
    try {
      const tours = await this.tourRepository.find({
        relations: ['participants'],
      });
      return tours;
    } catch (e) {}
  }

  async create(body): Promise<CoreDto> {
    try {
      const tour = this.tourRepository.create(body as Tour);
      await this.tourRepository.save(tour);

      return {
        ok: true,
        data: tour,
        message: '일정을 생성하였습니다.',
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: '일정을 생성할 수 없습니다.',
      };
    }
  }

  async update(body: Tour): Promise<CoreDto> {
    try {
      const { id, ...rest } = body;
      const tour = await this.tourRepository.findOne({ where: { id } });
      if (!tour) {
        return {
          ok: false,
          error: '일정을 찾을 수 없습니다.',
        };
      }

      const newTour = this.tourRepository.merge(tour, rest);

      await this.tourRepository.save(newTour);

      return {
        ok: true,
        data: newTour,
        message: '일정을 수정하였습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '일정을 수정할 수 없습니다.',
      };
    }
  }

  async delete(id): Promise<CoreDto> {
    try {
      const tour = await this.tourRepository.findOne({ where: { id: +id } });
      if (!tour || tour.id !== +id) {
        return {
          ok: false,
          error: '일정을 찾을 수 없습니다.',
        };
      }
      await this.tourRepository.delete(tour.id);
      return {
        ok: true,
        message: '일정을 삭제하였습니다.',
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '일정을 삭제할 수 없습니다.',
      };
    }
  }

  async getNowTour(): Promise<CoreDto> {
    try {
      const now = new Date();

      const tour = await this.tourRepository.findOne({
        where: {
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
        relations: ['participants'],
      });

      if (!tour) {
        const recentTour = await this.tourRepository.find({
          order: { startDate: 'DESC' },
          relations: ['participants'],
        });

        return {
          ok: true,
          data: recentTour[0],
        };
      }

      return {
        ok: true,
        data: tour,
      };
    } catch (e) {
      return {
        ok: false,
        error: '현재 진행중인 일정을 불러올 수 없습니다.',
      };
    }
  }

  async createGroup(body): Promise<CoreDto> {
    try {
      const { tourId, participants } = body;
      const tour = await this.tourRepository.findOne({ where: { id: tourId } });

      if (!tour) {
        return {
          ok: false,
          error: '일정을 찾을 수 없습니다.',
        };
      }

      const participantsByGroup = participants.reduce((acc, cur) => {
        const group = cur['group'];
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(cur);
        return acc;
      }, {});

      for (const key in participantsByGroup) {
        const participants = participantsByGroup[key];
        let group = await this.groupRepository.findOne({
          where: { name: participants[0].group, tourId: tour.id },
        });

        if (!group) {
          const newGroup = this.groupRepository.create({
            name: participants[0].group,
            tour,
          });
          group = await this.groupRepository.save(newGroup);
        }

        participants.map(async (item) => {
          try {
            const participant = await this.participantRepository.findOne({
              where: {
                phone: item['phone'],
                name: item['name'],
                tourId: tour.id,
              },
            });
            if (!participant) {
              return {
                ok: false,
                error: '참가자를 찾을 수 없습니다.',
              };
            }

            let hotel = await this.companyRepository.findOne({
              where: { name: item['hotel'] },
            });

            if (!hotel) {
              const newHotel = this.companyRepository.create({
                name: item['hotel'],
                type: 'hotel',
              });
              hotel = await this.companyRepository.save(newHotel);
            }
            participant.hotel = hotel.name;
            participant.room = item['room'];
            participant.index = +item['index'];

            participant.group = group;
            await this.participantRepository.save(participant);
          } catch {
            return {
              ok: false,
              error: '참가자를 찾을 수 없습니다.',
            };
          }
        });

        const hotelList = participants.map((item) => item['hotel']);

        hotelList.forEach(async (item) => {
          const hotel = await this.companyRepository.findOne({
            where: { name: item },
          });
          if (hotel) {
            const existReservations = await this.reservationRepository.find({
              where: { company: { name: hotel.name }, tour: { id: tour.id } },
            });
            await this.reservationRepository.remove(existReservations);
          }
        });

        const hotelOptions = await this.optionRepository.find({
          where: { target: 'hotel' },
        });

        if (!hotelOptions) {
          return {
            ok: false,
            error: '숙박 옵션을 찾을 수 없습니다.',
          };
        }

        const onePersonRoom: number =
          hotelOptions.find((item) => item.name === '숙박(2인)').value / 2;

        const twoPersonRoom = hotelOptions.find(
          (item) => item.name === '숙박(2인)',
        ).value;

        const threePersonRoom = hotelOptions.find(
          (item) => item.name === '숙박(3인)',
        ).value;

        // hotel reservation
        const participantsByHotel = participants.reduce((acc, cur) => {
          const hotel = cur['hotel'];
          if (!acc[hotel]) {
            acc[hotel] = [];
          }
          acc[hotel].push(cur);
          return acc;
        }, {});

        const tourNights =
          new Date(tour.endDate).getDate() - new Date(tour.startDate).getDate();
        for (const key in participantsByHotel) {
          const hotel = await this.companyRepository.findOne({
            where: { name: key },
          });
          if (!hotel) {
            return {
              ok: false,
              error: '호텔을 찾을 수 없습니다.',
            };
          }

          const participantsByRoom = participantsByHotel[key].reduce(
            (acc, cur) => {
              const room = cur['room'];
              if (!acc[room]) {
                acc[room] = [];
              }
              acc[room].push(cur);
              return acc;
            },
            {},
          );
          for (const key in participantsByRoom) {
            const participants = participantsByRoom[key];

            const detail = {
              room: key,
              participants,
              date: [tour.startDate, tour.endDate],
            };

            const price = (participantsCount) => {
              switch (participantsCount) {
                case 1:
                  return onePersonRoom * tourNights;
                case 2:
                  return twoPersonRoom * tourNights;
                case 3:
                  return threePersonRoom * tourNights;
                default:
                  return 0;
              }
            };

            const newReservation = this.reservationRepository.create({
              detail: JSON.stringify(detail),
              price: price(participants.length),
              type: 'hotel',
            });

            newReservation.tour = tour;
            newReservation.company = hotel;

            await this.reservationRepository.save(newReservation);
          }
        }
      }

      const reloadTour = await this.tourRepository.findOne({
        where: { id: tour.id },
        relations: ['groups', 'participants', 'participants.group'],
      });

      return {
        ok: true,
        message: '그룹을 생성하였습니다.',
        data: reloadTour,
      };
    } catch (error) {
      return {
        ok: false,
        error: '그룹을 생성할 수 없습니다.',
      };
    }
  }

  async getTourById(id: number): Promise<Tour> {
    return this.tourRepository.findOne({
      where: { id },
      relations: ['groups', 'participants'],
      order: {
        groups: {
          id: 'ASC',
        },
      },
    });
  }

  async updateGroup(id: number, body): Promise<CoreDto> {
    try {
      const group = await this.groupRepository.findOne({ where: { id } });
      if (!group) {
        return {
          ok: false,
          error: '그룹을 찾을 수 없습니다.',
        };
      }
      await this.groupRepository.update({ id }, body);
      return {
        ok: true,
        message: '그룹을 수정하였습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '그룹을 수정할 수 없습니다.',
      };
    }
  }

  async updateParticipant(id: number, body): Promise<CoreDto> {
    try {
      const tour = await this.getTourById(id);
      if (!tour) {
        return {
          ok: false,
          error: '일정을 찾을 수 없습니다.',
        };
      }
      body.map(async (item) => {
        const participant = await this.participantRepository.findOne({
          where: { phone: item['phone'], name: item.name },
        });
        if (!participant) {
          throw new Error('참가자를 찾을 수 없습니다.');
        }
        if (item.hasOwnProperty('group')) {
          const group = await this.findGroupOrCreate(item.group, tour.id);
          delete item.group;
          item.group = group;
        }
        const newParticipant = this.participantRepository.merge(
          participant,
          item,
        );
        await this.participantRepository.save(newParticipant);
      });

      return {
        ok: true,
        message: '정보 수정을 완료했습니다.',
      };
    } catch (e) {
      return {
        ok: false,
        error: '정보를 수정하지 못했습니다.',
      };
    }
  }

  async createParticipant(
    id: number,
    { participants: body },
  ): Promise<CoreDto> {
    try {
      const tour = await this.tourRepository.findOneOrFail({
        where: { id },
        relations: ['participants'],
      });

      if (!tour || tour.id != id) {
        return {
          ok: false,
          error: '일정을 찾을 수 없습니다.',
        };
      }

      // delete all participants
      await this.participantRepository.delete({ tourId: tour.id });

      let paymentAmount = 0;

      for (const { sexuality, ...participant } of body) {
        const newParticipant = this.participantRepository.create({
          sexuality: sexuality === '남' ? Sexuality.MALE : Sexuality.FEMALE,
          ...participant,
        } as Participant);

        paymentAmount += +newParticipant.payment;

        newParticipant.tourId = tour.id;

        await this.participantRepository.save(newParticipant);
      }

      const update = await this.tourRepository.merge(tour, { paymentAmount });

      await this.tourRepository.save(update);

      return {
        ok: true,
        message: '참가자를 생성하였습니다.',
      };
    } catch (error) {
      return {
        ok: false,
        error: '참가자를 생성할 수 없습니다.',
      };
    }
  }

  async findGroupOrCreate(groupName: string, tourId: number) {
    try {
      const tour = await this.getTourById(tourId);
      if (!tour) {
        throw new Error('일정을 찾을 수 없습니다.');
      }

      const group = await this.groupRepository.findOne({
        where: { name: groupName, tourId: tour.id },
      });
      if (group) {
        return group;
      }
      const newGroup = this.groupRepository.create({ name: groupName, tour });
      await this.groupRepository.save(newGroup);
      return newGroup;
    } catch {
      throw new Error('그룹을 생성할 수 없습니다.');
    }
  }
}
