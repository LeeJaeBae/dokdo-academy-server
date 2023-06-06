import { CoreEntity } from 'src/lib/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tour } from './tour.entity';
import { Group } from './group.entity';

export enum Sexuality {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity({
  orderBy: {
    name: 'ASC',
    index: 'ASC',
  },
})
export class Participant extends CoreEntity {
  @ManyToOne(() => Tour, (tour) => tour.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tourId', referencedColumnName: 'id' })
  tour: Tour;

  @Column()
  tourId: number;

  @Column()
  name: string;

  @ManyToOne(() => Group, (group) => group.participants, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'groupId', referencedColumnName: 'id' })
  group: Group;

  @Column({ default: 0 })
  index: number;

  @Column({ default: '미정' })
  hotel: string;

  @Column({ default: '미정' })
  room: string;

  @Column({ type: 'date' })
  birth: Date;

  @Column({ type: 'enum', enum: Sexuality })
  sexuality: Sexuality;

  @Column()
  phone: string;

  @Column({ nullable: true })
  age: number;

  @Column()
  organization: string;
  @Column()
  department: string;
  @Column()
  team: string;
  @Column()
  position: string;
  @Column()
  officePhone: string;
  @Column()
  isDiscountTarget: boolean;

  @Column()
  payment: number;

  @Column()
  paymentMethod: string;
  @Column()
  paymentOrganization: string;
  @Column()
  paymentDepartment: string;
  @Column()
  paymentTeam: string;
  @Column()
  paymentManager: string;
  @Column()
  paymentPhone: string;

  @Column()
  refundMethod: string;
  @Column({ nullable: true, default: '' })
  refundBank: string;
  @Column({ nullable: true, default: '' })
  refundAccount: string;

  @Column({ nullable: true, default: '' })
  refundName: string;

  @Column({ nullable: true, default: '' })
  roomMateTarget: string;
  @Column({ nullable: true, default: '' })
  roomMate: string;

  @Column({ nullable: true, default: '' })
  memo: string;

  @Column({ nullable: true, default: '' })
  label: string;
}
